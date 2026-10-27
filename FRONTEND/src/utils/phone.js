/**
 * Phone number helpers
 * The client's phone check follows the server's (ADR-003); the server stores the 10 digits.
 */

// The server's pattern in NODEAPI/utils/validators.js (VALIDATION_PATTERNS.phoneNumber, line 8);
// keep the two in step. The server strips whitespace before it tests the value.
const PHONE_PATTERN = /^(\d{10}|\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4}))$/;

// Examples shown in the hint when a phone number is refused
export const PHONE_EXAMPLES = ["5551234567", "555-123-4567", "(555) 123-4567", "555.123.4567"];

// True for exactly what the server accepts
export const isValidPhoneNumber = (value) => {
  if (!value || typeof value !== "string") return false;
  return PHONE_PATTERN.test(value.replace(/\s/g, ""));
};

// 10 digits become "(555) 123-4567"; any other value (old rows, empty, missing) is returned unchanged
export const formatPhoneNumber = (value) => {
  if (typeof value !== "string" || !/^\d{10}$/.test(value)) return value;
  return `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
};
