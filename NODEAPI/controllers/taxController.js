/**
 * Tax Controller
 * Handles tax rate calculations and retrieval
 * API v1.0+
 */

const asyncHandler = require("express-async-handler");
const { STATE_TAX_RATES, RESPONSE_MESSAGES } = require("../utils/constants");
const { ValidationError } = require("../utils/errors");
const { isValidCents, isValidTaxRate } = require("../utils/validators");
const { computeTax } = require("../utils/money");

/**
 * Get tax rate by state
 * @route POST /api/v1/tax/rate
 * @body {string} state - State abbreviation (e.g., 'CA')
 * @returns {number} Tax rate as percentage
 */
const defineTaxRate = asyncHandler((req, res) => {
  const { state } = req.body;

  if (!state) {
    throw new ValidationError(RESPONSE_MESSAGES.STATE_PARAMETER_REQUIRED);
  }

  if (typeof state !== "string") {
    throw new ValidationError(`${RESPONSE_MESSAGES.INVALID_STATE_CODE}: ${state}`);
  }

  const stateCode = state.toUpperCase();
  const taxRate = STATE_TAX_RATES[stateCode];

  if (taxRate === undefined) {
    throw new ValidationError(`${RESPONSE_MESSAGES.INVALID_STATE_CODE}: ${state}`);
  }

  res.status(200).json({
    success: true,
    data: {
      state: stateCode,
      taxRate,
    },
  });
});

/**
 * Calculate tax and final price, in integer cents (ADR-012)
 * @route POST /api/v1/tax/calculate
 * @body {number} subtotalCents - Integer cents, 0 or more
 * @body {number} taxRate - Tax rate as a percentage, 0 to 100 with at most 3 decimals
 * @returns {Object} subtotalCents, taxRate, taxCents and finalPriceCents
 */
const calculateTax = asyncHandler((req, res) => {
  const { subtotalCents, taxRate } = req.body;

  if (subtotalCents === undefined || subtotalCents === null) {
    throw new ValidationError(RESPONSE_MESSAGES.SUBTOTAL_CENTS_REQUIRED);
  }

  if (taxRate === undefined || taxRate === null) {
    throw new ValidationError(RESPONSE_MESSAGES.TAX_RATE_REQUIRED);
  }

  if (!isValidCents(subtotalCents)) {
    throw new ValidationError(RESPONSE_MESSAGES.SUBTOTAL_INVALID);
  }

  if (!isValidTaxRate(taxRate)) {
    throw new ValidationError(RESPONSE_MESSAGES.TAX_RATE_INVALID);
  }

  res.status(200).json({
    success: true,
    data: {
      subtotalCents,
      taxRate,
      ...computeTax(subtotalCents, taxRate),
    },
  });
});

module.exports = { defineTaxRate, calculateTax };
