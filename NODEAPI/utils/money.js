/**
 * Money Utilities
 * Integer-cent math for invoices and tax (ADR-012). Pure functions, no I/O.
 * The frontend mirrors the line total in FRONTEND/src/utils/money.js for display only (ADR-004).
 * API v1.26+
 */

const { ValidationError } = require("./errors");
const { RESPONSE_MESSAGES } = require("./constants");

const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

// A BigInt result back to a Number, or a 400 when it would not be a safe integer
const toSafeNumber = (value) => {
  if (value > MAX_SAFE) {
    throw new ValidationError(RESPONSE_MESSAGES.AMOUNT_TOO_LARGE);
  }
  return Number(value);
};

// A percentage (7.25) as integer thousandths of a percent (7250): exact for rates with up to 3 decimals
const rateToThousandths = (rate) => Math.round(rate * 1000);

// A quantity (1.5) as integer hundredths (150): exact for quantities with up to 2 decimals
const quantityToHundredths = (quantity) => Math.round(quantity * 100);

// quantity x unit price, rounded half-up to a whole cent
const lineTotalCents = (quantity, unitPriceCents) =>
  toSafeNumber((BigInt(quantityToHundredths(quantity)) * BigInt(unitPriceCents) + 50n) / 100n);

// subtotal x rate, rounded half-up to a whole cent, once for the whole invoice
const taxCents = (subtotalCents, taxRate) =>
  toSafeNumber((BigInt(subtotalCents) * BigInt(rateToThousandths(taxRate)) + 50000n) / 100000n);

// Tax and final price for a subtotal and a rate
const computeTax = (subtotalCents, taxRate) => {
  const tax = taxCents(subtotalCents, taxRate);
  return {
    taxCents: tax,
    finalPriceCents: toSafeNumber(BigInt(subtotalCents) + BigInt(tax)),
  };
};

// The stored figures of an invoice. With lines, the subtotal is the sum of the line totals;
// without, it is the subtotal that was sent (the page allows a typed subtotal).
// Inputs are already validated (validateInvoiceData).
const computeInvoiceTotals = ({ lineItems = [], subtotalCents, taxRate }) => {
  const computedLines = lineItems.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    lineTotalCents: lineTotalCents(item.quantity, item.unitPriceCents),
  }));

  const subtotal =
    computedLines.length > 0
      ? toSafeNumber(computedLines.reduce((sum, line) => sum + BigInt(line.lineTotalCents), 0n))
      : subtotalCents;

  return { lineItems: computedLines, subtotalCents: subtotal, ...computeTax(subtotal, taxRate) };
};

module.exports = {
  rateToThousandths,
  quantityToHundredths,
  lineTotalCents,
  taxCents,
  computeTax,
  computeInvoiceTotals,
};
