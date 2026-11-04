/**
 * Validation Utilities
 * Centralized validation functions used across the API
 * API v1.0+
 */

const { RESPONSE_MESSAGES, STATE_TAX_RATES } = require("./constants");

const VALIDATION_PATTERNS = {
  phoneNumber: /^(\d{10}|\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4}))$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  companyName: /^[a-zA-Z0-9\s\-&.,()]+$/,
  state: /^[A-Z]{2}$/,
  dateOfService: /^\d{4}-\d{2}-\d{2}$/,
};

const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== "string") return false;
  return VALIDATION_PATTERNS.phoneNumber.test(phone.replace(/\s/g, ""));
};

// A phone number is stored as its digits only; any other value is returned as it came
const normalizePhoneNumber = (value) => {
  if (typeof value !== "string") return value;
  return value.replace(/\D/g, "");
};

const validateEmail = (email) => {
  if (!email) return true; // Email is optional
  if (typeof email !== "string" || email.length > 150) return false;
  return VALIDATION_PATTERNS.email.test(email);
};

const validateZipCode = (zip) => {
  if (!zip) return true; // Zip is optional
  return VALIDATION_PATTERNS.zipCode.test(zip);
};

const validateCompanyName = (name) => {
  if (!name || typeof name !== "string" || name.trim().length === 0) return false;
  if (name.length > 100) return false;
  return VALIDATION_PATTERNS.companyName.test(name);
};

const validateState = (state) => {
  if (!state) return true; // State is optional
  return VALIDATION_PATTERNS.state.test(state);
};

// A real calendar date written YYYY-MM-DD: a string only (Mongoose would cast a number to a Date),
// and one that survives a UTC round trip, which refuses 2026-02-30, 2026-13-01 and years below 100
// (Date.UTC maps those to 1900-1999)
const validateDateOfService = (value) => {
  if (typeof value !== "string" || !VALIDATION_PATTERNS.dateOfService.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

// A money amount: a JSON integer of cents, 0 or more (ADR-012). Strings and floats are refused.
const isValidCents = (value) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

// A number written with at most `decimals` decimals, judged by its shortest text form
// (so 1e-7 and 0.001 are refused for 2 decimals)
const hasAtMostDecimals = (value, decimals) =>
  new RegExp(`^\\d+(\\.\\d{1,${decimals}})?$`).test(String(value));

// A quantity: a number above 0 with at most 2 decimals, whose hundredths are a safe integer
const isValidQuantity = (value) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value > 0 &&
  hasAtMostDecimals(value, 2) &&
  Number.isSafeInteger(Math.round(value * 100));

// A tax rate: a percentage from 0 to 100 with at most 3 decimals
const isValidTaxRate = (value) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 100 &&
  hasAtMostDecimals(value, 3);

// A state the tax table knows (own keys only: "constructor" is not a state)
const isKnownState = (value) => typeof value === "string" && Object.hasOwn(STATE_TAX_RATES, value);

const validateCustomerData = (data) => {
  const errors = [];

  if (!data.companyName) {
    errors.push("Company name is required");
  } else if (!validateCompanyName(data.companyName)) {
    errors.push("Invalid company name format");
  }

  if (!data.phoneNumber) {
    errors.push("Phone number is required");
  } else if (!validatePhoneNumber(data.phoneNumber)) {
    errors.push("Invalid phone number format");
  }

  if (data.companyEmail && !validateEmail(data.companyEmail)) {
    errors.push("Invalid email format");
  }

  if (data.zipAddress && !validateZipCode(data.zipAddress)) {
    errors.push("Invalid zip code format");
  }

  if (data.stateAddress && !validateState(data.stateAddress)) {
    errors.push("Invalid state abbreviation (use 2-letter code)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateInvoiceData = (data) => {
  const errors = [];

  if (!data.companyName) {
    errors.push("Company name is required");
  }

  if (!data.phoneNumber) {
    errors.push("Phone number is required");
  } else if (!validatePhoneNumber(data.phoneNumber)) {
    errors.push("Invalid phone number format");
  }

  if (!data.dateOfService) {
    errors.push("Date of service is required");
  } else if (!validateDateOfService(data.dateOfService)) {
    errors.push(RESPONSE_MESSAGES.INVALID_DATE_OF_SERVICE);
  }

  if (typeof data.invoiceNumber !== "string" || data.invoiceNumber.trim() === "") {
    errors.push(RESPONSE_MESSAGES.INVOICE_NUMBER_REQUIRED);
  }

  if (data.stateAddress === undefined || data.stateAddress === null || data.stateAddress === "") {
    errors.push(RESPONSE_MESSAGES.STATE_REQUIRED);
  } else if (!isKnownState(data.stateAddress)) {
    errors.push(RESPONSE_MESSAGES.STATE_INVALID);
  }

  // The server computes every figure; only the lines (or a subtotal, when there are none) come from the client
  const { lineItems } = data;
  if (lineItems !== undefined && !Array.isArray(lineItems)) {
    errors.push(RESPONSE_MESSAGES.LINE_ITEMS_INVALID);
  } else if (!lineItems || lineItems.length === 0) {
    if (data.subtotalCents === undefined || data.subtotalCents === null) {
      errors.push(RESPONSE_MESSAGES.SUBTOTAL_REQUIRED);
    } else if (!isValidCents(data.subtotalCents)) {
      errors.push(RESPONSE_MESSAGES.SUBTOTAL_INVALID);
    }
  } else {
    const items = lineItems.map((item) => (item && typeof item === "object" ? item : {}));
    if (items.some((item) => typeof item.description !== "string" || item.description.trim() === "")) {
      errors.push(RESPONSE_MESSAGES.LINE_ITEM_DESCRIPTION_REQUIRED);
    }
    if (items.some((item) => !isValidQuantity(item.quantity))) {
      errors.push(RESPONSE_MESSAGES.LINE_ITEM_QUANTITY_INVALID);
    }
    if (items.some((item) => !isValidCents(item.unitPriceCents))) {
      errors.push(RESPONSE_MESSAGES.LINE_ITEM_PRICE_INVALID);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validatePhoneNumber,
  normalizePhoneNumber,
  validateEmail,
  validateZipCode,
  validateCompanyName,
  validateState,
  validateDateOfService,
  isValidCents,
  isValidQuantity,
  isValidTaxRate,
  isKnownState,
  validateCustomerData,
  validateInvoiceData,
  VALIDATION_PATTERNS,
};
