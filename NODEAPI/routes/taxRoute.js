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
 * @body {number} jobPrice - Base job price
 * @body {number} taxRate - Tax rate as percentage
 * @returns {Object} Breakdown with tax and final price
 * @example
 * POST /api/v1/tax/calculate
 * { "jobPrice": 100, "taxRate": 7.25 }
 * Response: { "success": true, "data": { "jobPrice": 100, "taxRate": 7.25, "taxAmount": 7.25, "finalPrice": 107.25 } }
 */
taxRouter.post("/calculate", calculateTax);

module.exports = taxRouter;
