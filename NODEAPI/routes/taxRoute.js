/**
 * Tax Routes
 * API v1.0+
 * Base: /api/v1/tax
 */

const express = require("express");
const { calculateTax, defineTaxRate } = require("../controllers/taxController");

const taxRouter = express.Router();

/**
 * @route POST /api/v1/tax/rate
 * @body {string} state - State abbreviation (e.g., 'CA', 'NY')
 * @returns {Object} State and tax rate
 * @example
 * POST /api/v1/tax/rate
 * { "state": "CA" }
 * Response: { "success": true, "data": { "state": "CA", "taxRate": 7.25 } }
 */
taxRouter.post("/rate", defineTaxRate);

/**
 * @route POST /api/v1/tax/calculate
 * @body {number} subtotalCents - Integer cents, 0 or more
 * @body {number} taxRate - Tax rate as a percentage, 0 to 100 with at most 3 decimals
 * @returns {Object} subtotalCents, taxRate, taxCents and finalPriceCents (integer cents)
 * @example
 * POST /api/v1/tax/calculate
 * { "subtotalCents": 5997, "taxRate": 7.25 }
 * Response: { "success": true, "data": { "subtotalCents": 5997, "taxRate": 7.25, "taxCents": 435, "finalPriceCents": 6432 } }
 */
taxRouter.post("/calculate", calculateTax);

module.exports = taxRouter;
