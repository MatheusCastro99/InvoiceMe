/**
 * Tests: scripts/v2Migration.js (#141).
 * Raw old-shape rows go in through Model.collection (Mongoose would cast them). The unique indexes are
 * dropped before each test so duplicates can be inserted, and so "built" can be told from "not built".
 */

const mongoose = require("mongoose");
const CustomerModel = require("../models/customerModel");
const InvoiceModel = require("../models/invoiceModel");
const { migrate, exitCodeFor, describeTarget } = require("../scripts/v2Migration");

const newId = () => new mongoose.Types.ObjectId();

beforeEach(async () => {
  // Let the automatic index build finish, then remove its indexes
  await Promise.all([CustomerModel.init(), InvoiceModel.init()]);
  for (const Model of [CustomerModel, InvoiceModel]) {
    await Model.collection.dropIndexes().catch(() => {});
  }
});

// A customer as the old API stored it (the phone number as typed)
const oldCustomer = (overrides = {}) => ({
  _id: newId(),
  companyName: "Acme Plumbing",
  phoneNumber: "(555) 123-4567",
  stateAddress: "CA",
  ...overrides,
});

// An invoice as the old API stored it: 2 x $400.00 in CA (7.25%), dollars as floats, rows with string amounts
const oldInvoice = (overrides = {}) => ({
  _id: newId(),
  companyName: "Acme Plumbing",
  phoneNumber: "(555) 123-4567",
  stateAddress: "CA",
  dateOfService: "03/15/2026",
  invoiceNumber: "INV-1",
  jobDescription: "Replace water heater",
  tableData: [{ id: 1, description: "Water heater", quantity: "2", price: "400.00", itemTotal: 800 }],
  taxRate: 7.25,
  subtotal: 800,
  finalPrice: 858,
  ...overrides,
});

const insert = async (customers, invoices) => {
  if (customers.length > 0) await CustomerModel.collection.insertMany(customers);
  if (invoices.length > 0) await InvoiceModel.collection.insertMany(invoices);
};

const invoiceOf = (doc) => InvoiceModel.collection.findOne({ _id: doc._id });
const customerOf = (doc) => CustomerModel.collection.findOne({ _id: doc._id });
const reasonsFor = (result, doc) => result.problems.filter((p) => p._id === String(doc._id)).map((p) => p.reason);
const noticesFor = (result, doc) => result.notices.filter((n) => n._id === String(doc._id)).map((n) => n.reason);
const indexOf = (result, collection) => result.indexes.find((i) => i.collection === collection);

const snapshot = async () => ({
  customers: await CustomerModel.collection.find({}).toArray(),
  invoices: await InvoiceModel.collection.find({}).toArray(),
  customerIndexes: await CustomerModel.collection.indexes().catch(() => []),
  invoiceIndexes: await InvoiceModel.collection.indexes().catch(() => []),
});

describe("customers", () => {
  it("normalizes a phone number to its 10 digits and builds the index", async () => {
    const customer = oldCustomer();
    await insert([customer], []);

    const result = await migrate();

    expect((await customerOf(customer)).phoneNumber).toBe("5551234567");
    expect(result.changes).toEqual([{ collection: "customers", _id: String(customer._id), fields: ["phoneNumber"] }]);
    expect(result.problems).toEqual([]);
    expect(indexOf(result, "customers").status).toBe("built");
    expect(exitCodeFor(result)).toBe(0);
  });

  it("leaves a current customer untouched", async () => {
    const customer = oldCustomer({ phoneNumber: "5551234567" });
    await insert([customer], []);

    const result = await migrate();

    expect(result.changes).toEqual([]);
    expect(await customerOf(customer)).toEqual(customer);
  });

  it("reports a phone number that is not 10 digits and leaves the customer as it is", async () => {
    const short = oldCustomer({ phoneNumber: "555-1234" });
    const missing = oldCustomer({ phoneNumber: undefined });
    await insert([short, missing], []);

    const result = await migrate();

    expect(reasonsFor(result, short)).toEqual(["phoneNumber is not 10 digits once normalized"]);
    expect(reasonsFor(result, missing)).toEqual(["phoneNumber is missing or not text"]);
    expect((await customerOf(short)).phoneNumber).toBe("555-1234");
    expect(exitCodeFor(result)).toBe(1);
  });

  it("reports phone numbers that collide once normalized, changes none, and does not build the index", async () => {
    const a = oldCustomer({ phoneNumber: "(555) 123-4567" });
    const b = oldCustomer({ phoneNumber: "555.123.4567" });
    const c = oldCustomer({ phoneNumber: "5551234567" });
    const other = oldCustomer({ phoneNumber: "(555) 999-0000" });
    await insert([a, b, c, other], []);

    const result = await migrate();

    for (const doc of [a, b, c]) expect(reasonsFor(result, doc)).toHaveLength(1);
    expect(reasonsFor(result, a)[0]).toContain(String(b._id));
    expect((await customerOf(a)).phoneNumber).toBe("(555) 123-4567");
    expect((await customerOf(b)).phoneNumber).toBe("555.123.4567");
    expect((await customerOf(other)).phoneNumber).toBe("5559990000");
    expect(indexOf(result, "customers").status).toBe("blocked");
    expect(await CustomerModel.collection.indexExists("phoneNumber_1")).toBe(false);
    expect(exitCodeFor(result)).toBe(1);
  });
});

describe("invoices: dateOfService", () => {
  it("stores MM/DD/YYYY, MMDDYYYY and mixed forms as UTC midnight", async () => {
    const slashes = oldInvoice({ invoiceNumber: "A", dateOfService: "03/15/2026" });
    const digits = oldInvoice({ invoiceNumber: "B", dateOfService: "03152026" });
    const mixed = oldInvoice({ invoiceNumber: "C", dateOfService: "0315/2026" });
    await insert([], [slashes, digits, mixed]);

    await migrate();

    for (const doc of [slashes, digits, mixed]) {
      expect((await invoiceOf(doc)).dateOfService).toEqual(new Date("2026-03-15T00:00:00.000Z"));
    }
  });

  it("reports an impossible or unreadable date and leaves the date as it is", async () => {
    const impossible = oldInvoice({ invoiceNumber: "A", dateOfService: "02/30/2024" });
    const unreadable = oldInvoice({ invoiceNumber: "B", dateOfService: "banana" });
    const missing = oldInvoice({ invoiceNumber: "C", dateOfService: undefined });
    await insert([], [impossible, unreadable, missing]);

    const result = await migrate();

    for (const doc of [impossible, unreadable, missing]) {
      expect(reasonsFor(result, doc)).toEqual(["dateOfService is missing or not a real date (MM/DD/YYYY)"]);
    }
    expect((await invoiceOf(impossible)).dateOfService).toBe("02/30/2024");
    expect(exitCodeFor(result)).toBe(1);
  });

  it("skips a date that is already a Date, and still converts the rest of the invoice", async () => {
    const doc = oldInvoice({ dateOfService: new Date("2026-03-15T00:00:00.000Z") });
    await insert([], [doc]);

    const result = await migrate();

    expect(result.changes[0].fields).toEqual(["money"]);
    expect((await invoiceOf(doc)).dateOfService).toEqual(new Date("2026-03-15T00:00:00.000Z"));
  });
});

describe("invoices: invoiceNumber", () => {
  it("trims an untrimmed number", async () => {
    const doc = oldInvoice({ invoiceNumber: "  INV-7 " });
    await insert([], [doc]);

    await migrate();

    expect((await invoiceOf(doc)).invoiceNumber).toBe("INV-7");
  });

  it("reports a missing, non-text or empty number", async () => {
    const missing = oldInvoice({ invoiceNumber: undefined });
    const numeric = oldInvoice({ invoiceNumber: 42 });
    const empty = oldInvoice({ invoiceNumber: "   " });
    await insert([], [missing, numeric, empty]);

    const result = await migrate();

    expect(reasonsFor(result, missing)).toEqual(["invoiceNumber is missing or not text"]);
    expect(reasonsFor(result, numeric)).toEqual(["invoiceNumber is missing or not text"]);
    expect(reasonsFor(result, empty)).toEqual(["invoiceNumber is empty"]);
    expect((await invoiceOf(empty)).invoiceNumber).toBe("   ");
  });

  it("reports equal numbers, and a trim that would clash, and changes none of them", async () => {
    const first = oldInvoice({ invoiceNumber: "INV-1" });
    const second = oldInvoice({ invoiceNumber: "INV-1" });
    const clash = oldInvoice({ invoiceNumber: "INV-2 " });
    const clashWith = oldInvoice({ invoiceNumber: "INV-2" });
    await insert([], [first, second, clash, clashWith]);

    const result = await migrate();

    expect(reasonsFor(result, first)).toEqual([`invoiceNumber is the same as invoice ${second._id}`]);
    expect(reasonsFor(result, clash)).toEqual([`invoiceNumber is the same as invoice ${clashWith._id} once trimmed`]);
    expect((await invoiceOf(clash)).invoiceNumber).toBe("INV-2 ");
    expect(indexOf(result, "invoices").status).toBe("blocked");
    expect(await InvoiceModel.collection.indexExists("invoiceNumber_1")).toBe(false);
    expect(exitCodeFor(result)).toBe(1);
  });
});

describe("invoices: money", () => {
  it("recomputes the figures in cents, writes the lines, and removes the old fields", async () => {
    const doc = oldInvoice();
    await insert([], [doc]);

    const result = await migrate();

    const stored = await invoiceOf(doc);
    expect(stored.lineItems).toEqual([
      { description: "Water heater", quantity: 2, unitPriceCents: 40000, lineTotalCents: 80000 },
    ]);
    expect(stored).toMatchObject({ subtotalCents: 80000, taxCents: 5800, finalPriceCents: 85800, taxRate: 7.25 });
    expect(stored).not.toHaveProperty("finalPrice");
    expect(stored).not.toHaveProperty("subtotal");
    expect(stored).not.toHaveProperty("tableData");
    expect(result.notices).toEqual([]);
  });

  it("rounds half-up to the cent, from the price text and not from a float", async () => {
    // 1.5 x $19.99 = 2998.5 cents -> 2999; $19.99 would be 1998.9999... as a float times 100
    // subtotal 2999 at 6.25% = 187.4375 -> 187
    const doc = oldInvoice({
      tableData: [{ description: "Part", quantity: "1.5", price: "19.99" }],
      taxRate: 6.25,
      finalPrice: 31.86,
    });
    await insert([], [doc]);

    await migrate();

    expect(await invoiceOf(doc)).toMatchObject({
      subtotalCents: 2999,
      taxCents: 187,
      finalPriceCents: 3186,
      lineItems: [{ unitPriceCents: 1999, lineTotalCents: 2999 }],
    });
  });

  it("rounds the tax half-up: 10.00 at 6.25% is 0.63", async () => {
    const doc = oldInvoice({
      tableData: [{ description: "Part", quantity: "1", price: "10" }],
      taxRate: 6.25,
      subtotal: 10,
      finalPrice: 10.62,
    });
    await insert([], [doc]);

    const result = await migrate();

    expect(await invoiceOf(doc)).toMatchObject({ taxCents: 63, finalPriceCents: 1063 });
    expect(noticesFor(result, doc)).toEqual(["final price changes from $10.62 to $10.63"]);
  });

  it("lists each invoice whose final price changes, and only those; notices leave the exit code alone", async () => {
    const same = oldInvoice({ invoiceNumber: "A" });
    const changed = oldInvoice({ invoiceNumber: "B", finalPrice: 999 });
    const noFinal = oldInvoice({ invoiceNumber: "C", finalPrice: undefined });
    await insert([], [same, changed, noFinal]);

    const result = await migrate();

    expect(noticesFor(result, same)).toEqual([]);
    expect(noticesFor(result, changed)).toEqual(["final price changes from $999.00 to $858.00"]);
    expect(noticesFor(result, noFinal)).toEqual(["no stored final price; it is now $858.00"]);
    expect(result.problems).toEqual([]);
    expect(exitCodeFor(result)).toBe(0);
  });

  it("drops fully blank rows", async () => {
    const doc = oldInvoice({
      tableData: [
        { id: 1, description: "Water heater", quantity: "2", price: "400.00" },
        { id: 2, description: "", quantity: "", price: "" },
        { id: 3, description: "  ", quantity: "1" },
      ],
    });
    await insert([], [doc]);

    await migrate();

    expect((await invoiceOf(doc)).lineItems).toHaveLength(1);
  });

  it("reports an invoice with a bad row, and leaves it untouched", async () => {
    const noDescription = oldInvoice({ invoiceNumber: "A", tableData: [{ description: "", quantity: "1", price: "5" }] });
    const badQuantity = oldInvoice({ invoiceNumber: "B", tableData: [{ description: "x", quantity: "1.234", price: "5" }] });
    const zeroQuantity = oldInvoice({ invoiceNumber: "C", tableData: [{ description: "x", quantity: "0", price: "5" }] });
    const longPrice = oldInvoice({ invoiceNumber: "D", tableData: [{ description: "x", quantity: "1", price: "19.999" }] });
    const textPrice = oldInvoice({ invoiceNumber: "E", tableData: [{ description: "x", quantity: "1", price: "12abc" }] });
    const noPrice = oldInvoice({ invoiceNumber: "F", tableData: [{ description: "x", quantity: "1" }] });
    const notAList = oldInvoice({ invoiceNumber: "G", tableData: "nope" });
    await insert([], [noDescription, badQuantity, zeroQuantity, longPrice, textPrice, noPrice, notAList]);

    const result = await migrate();

    expect(reasonsFor(result, noDescription)).toEqual(["line 1 has no description"]);
    expect(reasonsFor(result, badQuantity)).toEqual(["line 1 has an invalid quantity"]);
    expect(reasonsFor(result, zeroQuantity)).toEqual(["line 1 has an invalid quantity"]);
    expect(reasonsFor(result, longPrice)).toEqual(["line 1 has an invalid price"]);
    expect(reasonsFor(result, textPrice)).toEqual(["line 1 has an invalid price"]);
    expect(reasonsFor(result, noPrice)).toEqual(["line 1 has an invalid price"]);
    expect(reasonsFor(result, notAList)).toEqual(["tableData is not a list"]);
    const stored = await invoiceOf(longPrice);
    expect(stored.finalPrice).toBe(858);
    expect(stored).not.toHaveProperty("finalPriceCents");
  });

  it("converts an invoice with no lines from its stored subtotal", async () => {
    const noRows = oldInvoice({ invoiceNumber: "A", tableData: undefined, subtotal: 100.1, finalPrice: 107.35 });
    const emptyRows = oldInvoice({ invoiceNumber: "B", tableData: [], subtotal: 50, finalPrice: 53.63 });
    await insert([], [noRows, emptyRows]);

    const result = await migrate();

    // 10010 cents at 7.25% = 725.725 -> 726
    expect(await invoiceOf(noRows)).toMatchObject({ lineItems: [], subtotalCents: 10010, taxCents: 726, finalPriceCents: 10736 });
    expect(await invoiceOf(emptyRows)).toMatchObject({ lineItems: [], subtotalCents: 5000, taxCents: 363, finalPriceCents: 5363 });
    expect(noticesFor(result, noRows)).toEqual(["final price changes from $107.35 to $107.36"]);
  });

  it("reports an invoice with no lines and no usable subtotal", async () => {
    const none = oldInvoice({ invoiceNumber: "A", tableData: undefined, subtotal: undefined });
    const negative = oldInvoice({ invoiceNumber: "B", tableData: [], subtotal: -5 });
    await insert([], [none, negative]);

    const result = await migrate();

    expect(reasonsFor(result, none)).toEqual(["no lines, and no usable subtotal"]);
    expect(reasonsFor(result, negative)).toEqual(["no lines, and no usable subtotal"]);
  });

  it("keeps a valid stored taxRate, and fills a missing or invalid one from the state", async () => {
    const stored = oldInvoice({ invoiceNumber: "A", taxRate: 5, stateAddress: "CA" });
    const missing = oldInvoice({ invoiceNumber: "B", taxRate: undefined, stateAddress: "CA" });
    const invalid = oldInvoice({ invoiceNumber: "C", taxRate: 150, stateAddress: "NY" });
    await insert([], [stored, missing, invalid]);

    await migrate();

    expect((await invoiceOf(stored)).taxRate).toBe(5);
    expect((await invoiceOf(missing)).taxRate).toBe(7.25);
    expect((await invoiceOf(invalid)).taxRate).toBe(4);
  });

  it("reports an invoice with no rate and no known state", async () => {
    const noState = oldInvoice({ invoiceNumber: "A", taxRate: undefined, stateAddress: undefined });
    const unknown = oldInvoice({ invoiceNumber: "B", taxRate: undefined, stateAddress: "ZZ" });
    const proto = oldInvoice({ invoiceNumber: "C", taxRate: undefined, stateAddress: "constructor" });
    await insert([], [noState, unknown, proto]);

    const result = await migrate();

    for (const doc of [noState, unknown, proto]) {
      expect(reasonsFor(result, doc)).toEqual(["no valid taxRate, and stateAddress is missing or not a known state"]);
    }
  });

  it("reports an amount too large to store", async () => {
    const huge = oldInvoice({ tableData: [{ description: "x", quantity: "1", price: "999999999999999999" }] });
    await insert([], [huge]);

    const result = await migrate();

    expect(reasonsFor(result, huge)).toHaveLength(1);
    expect(await invoiceOf(huge)).not.toHaveProperty("finalPriceCents");
  });

  it("leaves a current invoice and its phone copy untouched (ADR-008)", async () => {
    const current = {
      _id: newId(),
      companyName: "Acme Plumbing",
      phoneNumber: "(555) 123-4567",
      stateAddress: "CA",
      dateOfService: new Date("2026-03-15T00:00:00.000Z"),
      invoiceNumber: "INV-9",
      lineItems: [],
      taxRate: 7.25,
      subtotalCents: 100,
      taxCents: 7,
      finalPriceCents: 107,
    };
    await insert([], [current]);

    const result = await migrate();

    expect(result.changes).toEqual([]);
    expect(await invoiceOf(current)).toEqual(current);
  });

  it("converts an invoice by one concern even when another is reported", async () => {
    const doc = oldInvoice({ dateOfService: "13/45/2026" });
    await insert([], [doc]);

    const result = await migrate();

    expect(reasonsFor(result, doc)).toHaveLength(1);
    expect(result.changes[0].fields).toEqual(["money"]);
    expect((await invoiceOf(doc)).dateOfService).toBe("13/45/2026");
  });
});

describe("indexes", () => {
  it("builds a blocked index on a later run, once the data allows it", async () => {
    const a = oldCustomer({ phoneNumber: "(555) 123-4567" });
    const b = oldCustomer({ phoneNumber: "555.123.4567" });
    const first = oldInvoice({ invoiceNumber: "INV-1" });
    const second = oldInvoice({ invoiceNumber: "INV-1" });
    await insert([a, b], [first, second]);

    const blocked = await migrate();
    expect(indexOf(blocked, "customers").status).toBe("blocked");
    expect(indexOf(blocked, "invoices").status).toBe("blocked");

    // The owner fixes the duplicates by hand
    await CustomerModel.collection.updateOne({ _id: b._id }, { $set: { phoneNumber: "5559990000" } });
    await InvoiceModel.collection.updateOne({ _id: second._id }, { $set: { invoiceNumber: "INV-2" } });

    const fixed = await migrate();

    expect(fixed.problems).toEqual([]);
    expect(indexOf(fixed, "customers").status).toBe("built");
    expect(indexOf(fixed, "invoices").status).toBe("built");
    expect(await CustomerModel.collection.indexExists("phoneNumber_1")).toBe(true);
    expect(await InvoiceModel.collection.indexExists("invoiceNumber_1")).toBe(true);
    expect(exitCodeFor(fixed)).toBe(0);
  });

  it("does not let a row without an invoiceNumber block the partial index", async () => {
    const withNumber = oldInvoice({ invoiceNumber: "INV-1" });
    const without = oldInvoice({ invoiceNumber: undefined });
    const alsoWithout = oldInvoice({ invoiceNumber: undefined });
    await insert([], [withNumber, without, alsoWithout]);

    const result = await migrate();

    expect(indexOf(result, "invoices").status).toBe("built");
    expect(result.problems).toHaveLength(2);
  });
});

describe("a dry run", () => {
  it("lists everything and writes nothing, indexes included", async () => {
    await insert(
      [oldCustomer(), oldCustomer({ phoneNumber: "555-1234" })],
      [oldInvoice({ invoiceNumber: "A", finalPrice: 1 }), oldInvoice({ invoiceNumber: "B", dateOfService: "banana" })]
    );
    const before = await snapshot();
    const lines = [];

    const result = await migrate({ dryRun: true, log: (line) => lines.push(line) });

    expect(await snapshot()).toEqual(before);
    expect(result.changes).toHaveLength(3); // the customer's phone, invoice A's money, invoice B's money
    expect(result.notices).toHaveLength(1); // invoice A: 1 -> 858.00
    expect(result.problems).toHaveLength(2); // the short phone, the unreadable date
    expect(indexOf(result, "customers").status).toBe("buildable");
    expect(indexOf(result, "invoices").status).toBe("buildable");
    expect(lines[0]).toContain("DRY RUN");
    expect(exitCodeFor(result)).toBe(1);
  });

  it("exits 0 on clean data, and reports a blocked index without building it", async () => {
    await insert([oldCustomer()], [oldInvoice()]);
    const clean = await migrate({ dryRun: true });
    expect(exitCodeFor(clean)).toBe(0);
    expect(await CustomerModel.collection.indexExists("phoneNumber_1")).toBe(false);

    await insert([oldCustomer({ phoneNumber: "555 123 4567" })], []);
    const blocked = await migrate({ dryRun: true });
    expect(indexOf(blocked, "customers").status).toBe("blocked");
    expect(exitCodeFor(blocked)).toBe(1);
  });
});

describe("a second run", () => {
  it("changes nothing", async () => {
    await insert(
      [oldCustomer(), oldCustomer({ phoneNumber: "(555) 999-0000" })],
      [oldInvoice({ invoiceNumber: " A " }), oldInvoice({ invoiceNumber: "B", tableData: undefined, subtotal: 12.34 })]
    );

    const first = await migrate();
    const after = await snapshot();
    const second = await migrate();

    expect(first.changes).toHaveLength(4);
    expect(second.changes).toEqual([]);
    expect(second.notices).toEqual([]);
    expect(second.problems).toEqual([]);
    expect(second.indexes.map((i) => i.status)).toEqual(["exists", "exists"]);
    expect(await snapshot()).toEqual(after);
    expect(exitCodeFor(second)).toBe(0);
  });

  it("reports the same problems again, and changes nothing", async () => {
    const bad = oldInvoice({ dateOfService: "banana" });
    await insert([], [bad]);

    await migrate();
    const after = await snapshot();
    const second = await migrate();

    expect(second.changes).toEqual([]);
    expect(reasonsFor(second, bad)).toHaveLength(1);
    expect(await snapshot()).toEqual(after);
  });
});

describe("the report", () => {
  it("is logged line by line: counts, then each item with its _id and reason", async () => {
    const bad = oldInvoice({ dateOfService: "banana" });
    await insert([], [bad]);
    const lines = [];

    await migrate({ log: (line) => lines.push(line) });

    const text = lines.join("\n");
    expect(text).toContain("Changes: 0 customers, 1 invoices. Notices: 0. Problems: 1.");
    expect(text).toContain(`invoices ${bad._id}: dateOfService is missing or not a real date (MM/DD/YYYY)`);
  });

  it("prints no stored value: not a phone number, an invoice number or a name", async () => {
    const lines = [];
    await insert(
      [oldCustomer({ phoneNumber: "(555) 123-4567" }), oldCustomer({ phoneNumber: "555.123.4567" })],
      [oldInvoice({ invoiceNumber: "SECRET-7" }), oldInvoice({ invoiceNumber: "SECRET-7" })]
    );

    await migrate({ log: (line) => lines.push(line) });

    const text = lines.join("\n");
    expect(text).not.toContain("1234567");
    expect(text).not.toContain("SECRET-7");
    expect(text).not.toContain("Acme");
  });
});

describe("describeTarget", () => {
  it("names the host and database, never the credentials", () => {
    const text = describeTarget("mongodb+srv://some-user:some-secret@cluster0.example.mongodb.net/invoices?retryWrites=true");

    expect(text).toBe("host cluster0.example.mongodb.net, database invoices");
    expect(text).not.toContain("some-user");
    expect(text).not.toContain("some-secret");
  });

  it("handles a local URL, several hosts, and an address it cannot read", () => {
    expect(describeTarget("mongodb://127.0.0.1:27017/API-test")).toBe("host 127.0.0.1:27017, database API-test");
    expect(describeTarget("mongodb://u:p@a:1,b:2/db")).toBe("host a:1,b:2, database db");
    expect(describeTarget("not a url")).not.toContain("not a url");
  });
});
