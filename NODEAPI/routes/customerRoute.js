/**
 * Customer Routes
 * API v1.0+
 * Base: /api/v1/customers
 */

const express = require("express");
const {
  getCustomers,
  getCustomerByID,
  postCustomer,
  updateCustomer,
  delCustomer,
} = require("../controllers/customerController");
const {
  validateCustomerInput,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

/**
 * @route GET /api/v1/customers
 * @query {number} page - Page number
 * @query {number} limit - Items per page
 * @returns {Array} List of customers
 */
router.get("/", getCustomers);

/**
 * @route GET /api/v1/customers/:id
 * @param {string} id - Customer ID
 * @returns {Object} Customer details
 */
router.get("/:id", getCustomerByID);

/**
 * @route POST /api/v1/customers
 * @body {string} companyName - Required
 * @body {string} phoneNumber - Required
 * @returns {Object} Created customer
 */
router.post("/", validateCustomerInput, postCustomer);

/**
 * @route PUT /api/v1/customers/:id
 * @param {string} id - Customer ID
 * @returns {Object} Updated customer
 */
router.put("/:id", validateCustomerInput, updateCustomer);

/**
 * @route DELETE /api/v1/customers/:id
 * @param {string} id - Customer ID
 * @returns {Object} Deleted customer
 */
router.delete("/:id", delCustomer);

module.exports = router;
