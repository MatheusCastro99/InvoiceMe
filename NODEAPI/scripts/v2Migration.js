/**
 * v2 data migration (#141)
 * Converts a database written before API v2.0 to the v2 shapes: phone numbers as 10 digits,
 * dateOfService as a Date at UTC midnight, invoiceNumber trimmed, and money as integer cents
 * (lineItems, subtotalCents, taxCents, finalPriceCents), then builds the unique indexes.
 *
 * Run it with `npm run migrate:v2 [-- --dry-run]` (the procedure is in Docs/README.md).
 * It reads and writes the raw collections: Mongoose would cast an old row and drop what the
 * schema no longer has. A record it cannot convert is left untouched and reported (_id and
 * reason); nothing is ever deleted or merged. A second run changes nothing.
 * migrate() uses the connected mongoose; only the command line connects (see main()).
 * API v2.0+
 */

const path = require("path");
const mongoose = require("mongoose");
const CustomerModel = require("../models/customerModel");
const InvoiceModel = require("../models/invoiceModel");
const { ValidationError } = require("../utils/errors");
const { STATE_TAX_RATES } = require("../utils/constants");
const { computeInvoiceTotals } = require("../utils/money");
const {
  normalizePhoneNumber,
  validateDateOfService,
  isValidQuantity,
  isValidTaxRate,
  isKnownState,
} = require("../utils/validators");

const OLD_DATE = /^(\d{2})\/?(\d{2})\/?(\d{4})$/;
const OLD_PRICE = /^\d+(\.\d{1,2})?$/;
const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

const isBlank = (value) =>
  value === undefined || value === null || (typeof value === "string" && value.trim() === "");

const dollars = (cents) => `$${(cents / 100).toFixed(2)}`;

// A price as written in the old rows ("19.99", "5", or a number) as whole cents, by splitting the text:
// no float math. Returns null when it is not a price with at most 2 decimals or does not fit a safe integer.
const priceToCents = (value) => {
  const text = typeof value === "number" ? String(value) : value;
  if (typeof text !== "string" || !OLD_PRICE.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  return cents > MAX_SAFE ? null : Number(cents);
};

// Collects what a run found. Each item is { collection, _id, reason } (a change lists its fields).
const createResult = () => ({ changes: [], notices: [], problems: [], indexes: [] });

const idOf = (doc) => String(doc._id);

const others = (group, doc) =>
  group
    .filter((member) => member !== doc)
    .map(idOf)
    .join(", ");

// Customers: phone numbers as digits. Returns the writes and the final phone value of every customer
// (what the unique index will see).
const planCustomers = (customers, result) => {
  const ops = [];
  const finals = new Map(customers.map((doc) => [doc, doc.phoneNumber]));
  const groups = new Map();

  for (const doc of customers) {
    if (typeof doc.phoneNumber !== "string") {
      result.problems.push({ collection: "customers", _id: idOf(doc), reason: "phoneNumber is missing or not text" });
      continue;
    }
    const digits = normalizePhoneNumber(doc.phoneNumber);
    if (!/^\d{10}$/.test(digits)) {
      result.problems.push({
        collection: "customers",
        _id: idOf(doc),
        reason: "phoneNumber is not 10 digits once normalized",
      });
      continue;
    }
    if (!groups.has(digits)) groups.set(digits, []);
    groups.get(digits).push(doc);
  }

  for (const [digits, group] of groups) {
    if (group.length > 1) {
      for (const doc of group) {
        finals.set(doc, digits); // left as it is, but the index cannot be built on these
        result.problems.push({
          collection: "customers",
          _id: idOf(doc),
          reason: `phoneNumber is the same as customer ${others(group, doc)} once normalized`,
        });
      }
      continue;
    }
    const [doc] = group;
    if (doc.phoneNumber !== digits) {
      ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: { phoneNumber: digits } } } });
      result.changes.push({ collection: "customers", _id: idOf(doc), fields: ["phoneNumber"] });
      finals.set(doc, digits);
    }
  }

  return { ops, finalValues: [...finals.values()] };
};

// Invoices, invoiceNumber: trimmed, unless equal numbers remain. Returns each invoice's new number (when it
// changes) and the final invoiceNumber of every invoice that has one (what the partial unique index will see).
const planInvoiceNumbers = (invoices, result) => {
  const newNumbers = new Map();
  const finals = new Map();
  const groups = new Map();

  for (const doc of invoices) {
    if (typeof doc.invoiceNumber !== "string") {
      result.problems.push({ collection: "invoices", _id: idOf(doc), reason: "invoiceNumber is missing or not text" });
      continue;
    }
    finals.set(doc, doc.invoiceNumber);
    const trimmed = doc.invoiceNumber.trim();
    if (trimmed === "") {
      result.problems.push({ collection: "invoices", _id: idOf(doc), reason: "invoiceNumber is empty" });
      continue;
    }
    if (!groups.has(trimmed)) groups.set(trimmed, []);
    groups.get(trimmed).push(doc);
  }

  for (const [trimmed, group] of groups) {
    if (group.length > 1) {
      for (const doc of group) {
        finals.set(doc, trimmed); // left as it is, but the index cannot be built on these
        result.problems.push({
          collection: "invoices",
          _id: idOf(doc),
          reason: `invoiceNumber is the same as invoice ${others(group, doc)}${
            group.some((member) => member.invoiceNumber !== trimmed) ? " once trimmed" : ""
          }`,
        });
      }
      continue;
    }
    const [doc] = group;
    if (doc.invoiceNumber !== trimmed) {
      newNumbers.set(doc, trimmed);
      finals.set(doc, trimmed);
    }
  }

  return { newNumbers, finalValues: [...finals.values()] };
};

// dateOfService: an old MM/DD/YYYY string (the old pattern also let MMDDYYYY through) as a UTC midnight Date.
// Returns { value } to write, {} to leave it, or { problem }.
const planDate = (doc) => {
  const stored = doc.dateOfService;
  if (stored instanceof Date) return {};
  const match = typeof stored === "string" ? OLD_DATE.exec(stored) : null;
  if (match) {
    const [, month, day, year] = match;
    if (validateDateOfService(`${year}-${month}-${day}`)) {
      return { value: new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))) };
    }
  }
  return { problem: "dateOfService is missing or not a real date (MM/DD/YYYY)" };
};

// The old tableData rows as v2 line items. Returns { lines } or { problem }.
const planLines = (tableData) => {
  if (tableData === undefined || tableData === null) return { lines: [] };
  if (!Array.isArray(tableData)) return { problem: "tableData is not a list" };

  const lines = [];
  const problems = [];
  tableData.forEach((row, index) => {
    const label = `line ${index + 1}`;
    if (row === null || typeof row !== "object") {
      problems.push(`${label} is not a row`);
      return;
    }
    if (isBlank(row.description) && isBlank(row.price)) return; // an empty row the page left behind

    if (typeof row.description !== "string" || row.description.trim() === "") {
      problems.push(`${label} has no description`);
      return;
    }
    const quantity = typeof row.quantity === "string" || typeof row.quantity === "number" ? Number(row.quantity) : NaN;
    if (!isValidQuantity(quantity)) {
      problems.push(`${label} has an invalid quantity`);
      return;
    }
    const unitPriceCents = priceToCents(row.price);
    if (unitPriceCents === null) {
      problems.push(`${label} has an invalid price`);
      return;
    }
    lines.push({ description: row.description.trim(), quantity, unitPriceCents });
  });

  return problems.length > 0 ? { problem: problems.join("; ") } : { lines };
};

// The money fields: the rows (or the stored subtotal) recomputed by today's rules (ADR-004, ADR-012).
// Returns { set, unset, notice } or { problem } or {} when the invoice is already in cents.
const planMoney = (doc) => {
  const hasOldFields = doc.finalPrice !== undefined || doc.subtotal !== undefined || doc.tableData !== undefined;
  if (!hasOldFields && doc.finalPriceCents !== undefined && doc.finalPriceCents !== null) return {};

  let taxRate = null;
  if (isValidTaxRate(doc.taxRate)) taxRate = doc.taxRate;
  else if (isKnownState(doc.stateAddress)) taxRate = STATE_TAX_RATES[doc.stateAddress];
  if (taxRate === null) {
    return { problem: "no valid taxRate, and stateAddress is missing or not a known state" };
  }

  const { lines, problem } = planLines(doc.tableData);
  if (problem) return { problem };

  let subtotalCents;
  if (lines.length === 0) {
    const subtotal = doc.subtotal;
    subtotalCents = typeof subtotal === "number" && Number.isFinite(subtotal) && subtotal >= 0 ? Math.round(subtotal * 100) : NaN;
    if (!Number.isSafeInteger(subtotalCents)) {
      return { problem: "no lines, and no usable subtotal" };
    }
  }

  let totals;
  try {
    totals = computeInvoiceTotals({ lineItems: lines, subtotalCents, taxRate });
  } catch (error) {
    if (error instanceof ValidationError) return { problem: error.message };
    throw error;
  }

  const oldFinal = doc.finalPrice;
  let notice = null;
  if (typeof oldFinal === "number" && Number.isFinite(oldFinal)) {
    const oldCents = Math.round(oldFinal * 100);
    if (oldCents !== totals.finalPriceCents) {
      notice = `final price changes from ${dollars(oldCents)} to ${dollars(totals.finalPriceCents)}`;
    }
  } else {
    notice = `no stored final price; it is now ${dollars(totals.finalPriceCents)}`;
  }

  return {
    set: {
      lineItems: totals.lineItems,
      subtotalCents: totals.subtotalCents,
      taxCents: totals.taxCents,
      finalPriceCents: totals.finalPriceCents,
      taxRate,
    },
    unset: { finalPrice: "", subtotal: "", tableData: "" },
    notice,
  };
};

const planInvoices = (invoices, result) => {
  const { newNumbers, finalValues } = planInvoiceNumbers(invoices, result);
  const ops = [];

  for (const doc of invoices) {
    const $set = {};
    const $unset = {};
    const fields = [];
    const id = idOf(doc);

    const date = planDate(doc);
    if (date.problem) result.problems.push({ collection: "invoices", _id: id, reason: date.problem });
    else if (date.value) {
      $set.dateOfService = date.value;
      fields.push("dateOfService");
    }

    if (newNumbers.has(doc)) {
      $set.invoiceNumber = newNumbers.get(doc);
      fields.push("invoiceNumber");
    }

    const money = planMoney(doc);
    if (money.problem) result.problems.push({ collection: "invoices", _id: id, reason: money.problem });
    else if (money.set) {
      Object.assign($set, money.set);
      Object.assign($unset, money.unset);
      fields.push("money");
      if (money.notice) result.notices.push({ collection: "invoices", _id: id, reason: money.notice });
    }

    if (fields.length > 0) {
      const update = { $set };
      if (Object.keys($unset).length > 0) update.$unset = $unset;
      ops.push({ updateOne: { filter: { _id: doc._id }, update } });
      result.changes.push({ collection: "invoices", _id: id, fields });
    }
  }

  return { ops, finalValues };
};

const hasDuplicates = (values) => new Set(values.map((value) => (value === undefined ? null : value))).size < values.length;

// listIndexes fails on a collection that does not exist yet (error 26): then there is no index
const indexExists = async (Model, name) => {
  try {
    return await Model.collection.indexExists(name);
  } catch (error) {
    if (error.code === 26) return false;
    throw error;
  }
};

// Builds (or, in a dry run, only checks that it can build) one model's unique index. An index that is
// blocked by duplicates is reported and not built.
const planIndex = async (Model, collection, name, blocked, dryRun) => {
  const entry = { collection, name };
  if (await indexExists(Model, name)) return { ...entry, status: "exists" };
  if (blocked) return { ...entry, status: "blocked", reason: "duplicates remain (see the problems)" };
  if (dryRun) return { ...entry, status: "buildable" };
  try {
    await Model.createIndexes();
    return { ...entry, status: "built" };
  } catch (error) {
    // The driver's message can quote a stored value, so only its code is reported
    return { ...entry, status: "failed", reason: `the database refused it (error ${error.code ?? error.name})` };
  }
};

const readableReport = (result, dryRun) => {
  const lines = [];
  const count = (items, collection) => items.filter((item) => item.collection === collection).length;
  lines.push(dryRun ? "v2 migration, DRY RUN: nothing is written." : "v2 migration.");
  lines.push(
    `Changes: ${count(result.changes, "customers")} customers, ${count(result.changes, "invoices")} invoices.` +
      ` Notices: ${result.notices.length}. Problems: ${result.problems.length}.`
  );
  const section = (title, items, text) => {
    if (items.length === 0) return;
    lines.push("", `${title}:`);
    for (const item of items) lines.push(`  ${text(item)}`);
  };
  section("Changes", result.changes, (c) => `${c.collection} ${c._id}: ${c.fields.join(", ")}`);
  section("Notices", result.notices, (n) => `${n.collection} ${n._id}: ${n.reason}`);
  section("Problems (left untouched)", result.problems, (p) => `${p.collection} ${p._id}: ${p.reason}`);
  section("Indexes", result.indexes, (i) => `${i.collection} ${i.name}: ${i.status}${i.reason ? ` - ${i.reason}` : ""}`);
  return lines;
};

/**
 * Converts the connected database. Writes nothing when dryRun is true (index builds included).
 * @param {{ dryRun?: boolean, log?: (line: string) => void }} [options]
 * @returns {Promise<{ changes: object[], notices: object[], problems: object[], indexes: object[] }>}
 */
const migrate = async ({ dryRun = false, log = () => {} } = {}) => {
  const result = createResult();

  const customers = await CustomerModel.collection.find({}).toArray();
  const invoices = await InvoiceModel.collection.find({}).toArray();

  const customerPlan = planCustomers(customers, result);
  const invoicePlan = planInvoices(invoices, result);

  if (!dryRun) {
    if (customerPlan.ops.length > 0) await CustomerModel.collection.bulkWrite(customerPlan.ops, { ordered: false });
    if (invoicePlan.ops.length > 0) await InvoiceModel.collection.bulkWrite(invoicePlan.ops, { ordered: false });
  }

  result.indexes.push(
    await planIndex(CustomerModel, "customers", "phoneNumber_1", hasDuplicates(customerPlan.finalValues), dryRun),
    await planIndex(InvoiceModel, "invoices", "invoiceNumber_1", hasDuplicates(invoicePlan.finalValues), dryRun)
  );

  for (const line of readableReport(result, dryRun)) log(line);
  return result;
};

// 0 only when nothing is reported and the indexes are built (or, in a dry run, buildable). Notices don't count.
const exitCodeFor = (result) => {
  const indexesReady = result.indexes.every((index) => ["exists", "built", "buildable"].includes(index.status));
  return result.problems.length === 0 && indexesReady ? 0 : 1;
};

// "host and database" of a MongoDB URL, never its credentials
const describeTarget = (url) => {
  const match = /^mongodb(?:\+srv)?:\/\/(?:[^/]*@)?([^/?]+)(?:\/([^?]*))?/.exec(url);
  if (!match) return "an address in MONGO_URL that could not be read";
  return `host ${match[1]}, database ${match[2] || "(none: the driver's default)"}`;
};

// An error's name, plus its code when it has one; never its message, which can quote a stored value or the URL
const errorLabel = (error) => (error.code === undefined ? error.name : `${error.name}, error ${error.code}`);

const main = async (argv) => {
  const args = argv.slice(2);
  const unknown = args.filter((arg) => arg !== "--dry-run");
  if (unknown.length > 0) {
    console.error("Usage: npm run migrate:v2 [-- --dry-run]");
    return 1;
  }
  // `npm run migrate:v2 --dry-run` (no `--`) is eaten by npm: it passes no argument and sets this variable instead
  const dryRun = args.includes("--dry-run") || process.env.npm_config_dry_run === "true";

  require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
  const url = process.env.MONGO_URL;
  if (!url) {
    console.error("MONGO_URL is not set. The migration needs the database named explicitly, so it will not run.");
    return 1;
  }

  console.log(`Target: ${describeTarget(url)}`);
  try {
    // autoIndex and autoCreate off: Mongoose would otherwise build the indexes, and create any missing
    // collection, itself on connect, even in a dry run
    await mongoose.connect(url, { autoIndex: false, autoCreate: false });
  } catch (error) {
    console.error(`Could not connect to the database (${errorLabel(error)}). Check MONGO_URL.`);
    return 1;
  }

  try {
    const result = await migrate({ dryRun, log: console.log });
    return exitCodeFor(result);
  } catch (error) {
    console.error(`The migration stopped (${errorLabel(error)}). The database may be partly converted: run it again.`);
    return 1;
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  main(process.argv).then((code) => {
    process.exitCode = code;
  });
}

module.exports = { migrate, exitCodeFor, describeTarget };
