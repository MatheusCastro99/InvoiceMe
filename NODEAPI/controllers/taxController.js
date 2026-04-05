/**
 * Tax Controller
 * Handles tax rate calculations and retrieval
 * API v1.0+
 */

const asyncHandler = require("express-async-handler");
const { STATE_TAX_RATES } = require("../utils/constants");
const { ValidationError } = require("../utils/errors");

/**
 * Get tax rate by state
 * @route POST /api/v1/tax/rate
 * @body {string} state - State abbreviation (e.g., 'CA')
 * @returns {number} Tax rate as percentage
 */
const defineTaxRate = asyncHandler((req, res) => {
  const { state } = req.body;

  if (!state) {
    throw new ValidationError("State parameter is required");
  }

  const stateCode = state.toUpperCase();
  const taxRate = STATE_TAX_RATES[stateCode];

  if (taxRate === undefined) {
    throw new ValidationError(`Invalid state code: ${state}`);
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
 * Calculate tax amount and final price
 * @route POST /api/v1/tax/calculate
 * @body {number} jobPrice - Base job price
 * @body {number} taxRate - Tax rate as percentage
 * @returns {Object} taxAmount, finalPrice, and breakdown
 */
const calculateTax = asyncHandler((req, res) => {
  let { taxRate, jobPrice } = req.body;

  if (jobPrice === undefined || jobPrice === null) {
    throw new ValidationError("Job price is required");
  }

  if (taxRate === undefined || taxRate === null) {
    throw new ValidationError("Tax rate is required");
  }

  const jobPriceNum = parseFloat(jobPrice);
  const taxRateNum = parseFloat(taxRate);

  if (isNaN(jobPriceNum) || jobPriceNum < 0) {
    throw new ValidationError("Job price must be a valid positive number");
  }

  if (isNaN(taxRateNum) || taxRateNum < 0 || taxRateNum > 100) {
    throw new ValidationError("Tax rate must be between 0 and 100");
  }

  const taxAmount = (taxRateNum / 100) * jobPriceNum;
  const finalPrice = jobPriceNum + taxAmount;

  res.status(200).json({
    success: true,
    data: {
      jobPrice: jobPriceNum,
      taxRate: taxRateNum,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      finalPrice: parseFloat(finalPrice.toFixed(2)),
    },
  });
});

module.exports = { defineTaxRate, calculateTax };
