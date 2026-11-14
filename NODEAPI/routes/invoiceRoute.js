/**
 * Invoice Routes
 * API v1.0+
 * Base: /api/v2/invoices
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
 * @route GET /api/v2/invoices
 * @returns {Array} List of all invoices
 */
invoiceRouter.get("/", getInvoice);

/**
 * @route POST /api/v2/invoices
 * @body {string} companyName - Required
 * @body {string} phoneNumber - Required
 * @body {string} dateOfService - Required, a real date as YYYY-MM-DD
 * @body {string} invoiceNumber - Required, unique (trimmed, exact match)
 * @body {string} stateAddress - Required, a state in STATE_TAX_RATES
 * @body {Array} lineItems - [{ description, quantity, unitPriceCents }]; or send subtotalCents when there are none
 * @body {number} subtotalCents - Integer cents, used only when there are no lineItems
 * @returns {Object} Created invoice, with the server's lineTotalCents, subtotalCents, taxRate, taxCents, finalPriceCents
 */
invoiceRouter.post("/", validateInvoiceInput, postInvoice);

/**
 * @route DELETE /api/v2/invoices/:id
 * @param {string} id - Invoice ID
 * @returns {Object} Deleted invoice
 */
invoiceRouter.delete("/:id", delInvoice);

module.exports = invoiceRouter;
