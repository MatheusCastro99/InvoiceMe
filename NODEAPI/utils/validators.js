/**
 * Validation Utilities
 * Centralized validation functions used across the API
 * API v1.0+
 */

const { RESPONSE_MESSAGES } = require("./constants");

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

// A finite number >= 0, or a non-blank string that Number() turns into one
const isValidPrice = (price) => {
  if (typeof price === "string") {
    if (price.trim() === "") return false;
    price = Number(price);
  }
  return typeof price === "number" && Number.isFinite(price) && price >= 0;
};

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

  if (data.finalPrice === undefined || data.finalPrice === null) {
    errors.push("Final price is required");
  } else if (!isValidPrice(data.finalPrice)) {
    errors.push("Final price must be a valid positive number");
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
  validateCustomerData,
  validateInvoiceData,
  VALIDATION_PATTERNS,
};
