/**
 * Date of service helpers
 * The client's date check follows the server's (ADR-003); the server stores a calendar date at UTC midnight
 * and answers it as YYYY-MM-DD. Nothing here parses the string into a Date for display: a Date made from
 * "2026-03-15" is UTC midnight, which is the day before in a time zone behind UTC.
 */

// The server's pattern in NODEAPI/utils/validators.js (VALIDATION_PATTERNS.dateOfService);
// keep the two in step.
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// True for exactly what the server accepts: a string written YYYY-MM-DD that is a real date.
// The UTC round trip refuses 2026-02-30, 2026-13-01 and years below 100 (Date.UTC maps those to 1900-1999).
export const isValidDateOfService = (value) => {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

// "2026-03-15" becomes "03/15/2026" by cutting the string; any other value (old rows, empty, missing) is returned unchanged
export const formatDateOfService = (value) => {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return value;
  return `${value.slice(5, 7)}/${value.slice(8, 10)}/${value.slice(0, 4)}`;
};

// The month, 1 to 12, of a YYYY-MM-DD string; null for any other value
export const monthOfService = (value) => {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const month = Number(value.slice(5, 7));
  return month >= 1 && month <= 12 ? month : null;
};
