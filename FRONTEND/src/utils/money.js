/**
 * Money helpers
 * Amounts are integer cents everywhere except the text the user types and the text we show (ADR-012).
 * The parsers accept exactly what the server accepts (ADR-003); lineTotalCents mirrors
 * NODEAPI/utils/money.js and is used for display only: the server computes every stored figure (ADR-004).
 */

const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

// "19.99", "20" or "0.5" as cents; null for anything else (blank, a sign, 3 decimals, letters, "1,000").
// The server takes JSON integers of cents, 0 or more (isValidCents in NODEAPI/utils/validators.js).
export const parseDollarsToCents = (text) => {
  if (typeof text !== "string") return null;
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text.trim());
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
};

// "2" or "1.5" as a number above 0 with at most 2 decimals; null for anything else
// (isValidQuantity in NODEAPI/utils/validators.js).
export const parseQuantity = (text) => {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) return null;
  const quantity = Number(trimmed);
  return quantity > 0 && Number.isSafeInteger(Math.round(quantity * 100)) ? quantity : null;
};

// quantity x unit price, rounded half-up to a whole cent (the server's lineTotalCents); null when it would not be safe
export const lineTotalCents = (quantity, unitPriceCents) => {
  const total = (BigInt(Math.round(quantity * 100)) * BigInt(unitPriceCents) + 50n) / 100n;
  return total > MAX_SAFE ? null : Number(total);
};

// 6432 becomes "$64.32" and 123456 "$1,234.56"; anything that is not an integer (an old row's missing field) is a dash
export const formatCents = (cents) => {
  if (!Number.isSafeInteger(cents)) return "—";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString("en-US");
  return `${cents < 0 ? "-" : ""}$${dollars}.${String(abs % 100).padStart(2, "0")}`;
};

// 6432 becomes "64.32", the text a user would type into an amount field
export const centsToDollarString = (cents) => {
  if (!Number.isSafeInteger(cents) || cents < 0) return "";
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
};
