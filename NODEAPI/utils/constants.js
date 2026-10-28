/**
 * Application Constants
 * API v1.0+
 */

// State Tax Rates (base state sales tax rates as of 2026; local taxes may apply separately)
const STATE_TAX_RATES = {
  AL: 4,
  AK: 0,
  AZ: 5.6,
  AR: 6.5,
  CA: 7.25,
  CO: 2.9,
  CT: 6.35,
  DE: 0,
  FL: 6,
  GA: 4,
  HI: 4,
  ID: 6,
  IL: 6.25,
  IN: 7,
  IA: 6,
  KS: 6.5,
  KY: 6,
  LA: 5,
  ME: 5.5,
  MD: 6,
  MA: 6.25,
  MI: 6,
  MN: 6.875,
  MS: 7,
  MO: 4.225,
  MT: 0,
  NE: 5.5,
  NV: 6.85,
  NH: 0,
  NJ: 6.625,
  NM: 4.875,
  NY: 4,
  NC: 4.75,
  ND: 5,
  OH: 5.75,
  OK: 4.5,
  OR: 0,
  PA: 6,
  RI: 7,
  SC: 6,
  SD: 4.2,
  TN: 7,
  TX: 6.25,
  UT: 6.1,
  VT: 6,
  VA: 5.3,
  WA: 6.5,
  WV: 6,
  WI: 5,
  WY: 4,
};

// API Response Messages
const RESPONSE_MESSAGES = {
  // Success Messages
  CUSTOMER_CREATED: "Customer created successfully",
  CUSTOMER_UPDATED: "Customer updated successfully",
  CUSTOMER_DELETED: "Customer deleted successfully",
  INVOICE_CREATED: "Invoice created successfully",
  INVOICE_DELETED: "Invoice deleted successfully",

  // Error Messages
  CUSTOMER_NOT_FOUND: "Customer not found",
  INVOICE_NOT_FOUND: "Invoice not found",
  INVALID_REQUEST: "Invalid request data",
  INVALID_ID: "Invalid id format",
  INVALID_DATE_OF_SERVICE: "Date of service must be a real date in YYYY-MM-DD format",
  INVOICE_NUMBER_REQUIRED: "Invoice number is required",
  ORIGIN_NOT_ALLOWED: "Origin not allowed",
  DUPLICATE_RECORD: "A record with this value already exists",
  SERVER_ERROR: "An error occurred while processing your request",
  DUPLICATE_CUSTOMER: "A customer with this phone number already exists",
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  STATE_TAX_RATES,
  RESPONSE_MESSAGES,
  PAGINATION,
};
