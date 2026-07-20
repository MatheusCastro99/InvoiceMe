/**
 * Validation Utilities
 * Centralized validation functions used across the API
 * API v1.0+
 */

const VALIDATION_PATTERNS = {
  phoneNumber: /^(\d{10}|\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4}))$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  companyName: /^[a-zA-Z0-9\s\-&.,()]+$/,
  state: /^[A-Z]{2}$/,
};

const validatePhoneNumber = (phone) => {
  if (!phone) return false;
  return VALIDATION_PATTERNS.phoneNumber.test(phone.replace(/\s/g, ""));
};

const validateEmail = (email) => {
  if (!email) return true; // Email is optional
  if (email.length > 150) {
    throw new Error("Input too long");
}
  return VALIDATION_PATTERNS.email.test(email);
};

const validateZipCode = (zip) => {
  if (!zip) return true; // Zip is optional
  return VALIDATION_PATTERNS.zipCode.test(zip);
};

const validateCompanyName = (name) => {
  if (!name || name.trim().length === 0) return false;
  if (name.length > 100) return false;
  return VALIDATION_PATTERNS.companyName.test(name);
};

const validateState = (state) => {
  if (!state) return true; // State is optional
  return VALIDATION_PATTERNS.state.test(state);
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
  }

  if (data.finalPrice === undefined || data.finalPrice === null) {
    errors.push("Final price is required");
  } else if (
    isNaN(parseFloat(data.finalPrice)) ||
    parseFloat(data.finalPrice) < 0
  ) {
    errors.push("Final price must be a valid positive number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validatePhoneNumber,
  validateEmail,
  validateZipCode,
  validateCompanyName,
  validateState,
  validateCustomerData,
  validateInvoiceData,
  VALIDATION_PATTERNS,
};
