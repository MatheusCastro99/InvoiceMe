/**
 * Invoice Routes
 * API v1.0+
 * Base: /api/v1/invoices
 */

const express = require("express");
const {
  getInvoice,
  delInvoice,
  postInvoice,
} = require("../controllers/invoiceController");
const { validateInvoiceInput } = require("../middlewares/validationMiddleware");

const invoiceRouter = express.Router();

/**
 * @route GET /api/v1/invoices
 * @returns {Array} List of all invoices
 */
invoiceRouter.get("/", getInvoice);

/**
 * @route POST /api/v1/invoices
 * @body {string} companyName - Required
 * @body {string} phoneNumber - Required
 * @body {string} dateOfService - Required
 * @body {number} finalPrice - Required
 * @returns {Object} Created invoice
 */
invoiceRouter.post("/", validateInvoiceInput, postInvoice);

/**
 * @route DELETE /api/v1/invoices/:id
 * @param {string} id - Invoice ID
 * @returns {Object} Deleted invoice
 */
invoiceRouter.delete("/:id", delInvoice);

module.exports = invoiceRouter;
