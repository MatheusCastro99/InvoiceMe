/**
 * Invoice Controller
 * Handles invoice generation and management
 * API v1.0+
 */

const asyncHandler = require("express-async-handler");
const InvoiceModel = require("../models/invoiceModel");
const { NotFoundError } = require("../utils/errors");
const { RESPONSE_MESSAGES, STATE_TAX_RATES } = require("../utils/constants");
const { computeInvoiceTotals } = require("../utils/money");

/**
 * Get all invoices
 * @route GET /api/v2/invoices
 * @returns {Array} List of all invoices
 */
const getInvoice = asyncHandler(async (req, res) => {
  const invoices = await InvoiceModel.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: invoices,
    count: invoices.length,
  });
});

/**
 * Create new invoice
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
const postInvoice = asyncHandler(async (req, res) => {
  // The server computes every figure (ADR-004, ADR-012); figures the client sent are not used
  const taxRate = STATE_TAX_RATES[req.body.stateAddress];
  const totals = computeInvoiceTotals({
    lineItems: req.body.lineItems,
    subtotalCents: req.body.subtotalCents,
    taxRate,
  });

  const invoice = await InvoiceModel.create({ ...req.body, ...totals, taxRate });

  res.status(201).json({
    success: true,
    message: RESPONSE_MESSAGES.INVOICE_CREATED,
    data: invoice,
  });
});

/**
 * Delete invoice
 * @route DELETE /api/v2/invoices/:id
 * @param {string} id - Invoice ID
 * @returns {Object} Deleted invoice
 */
const delInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await InvoiceModel.findByIdAndDelete(id);

  if (!invoice) {
    throw new NotFoundError(RESPONSE_MESSAGES.INVOICE_NOT_FOUND);
  }

  res.status(200).json({
    success: true,
    message: RESPONSE_MESSAGES.INVOICE_DELETED,
    data: invoice,
  });
});

module.exports = { getInvoice, postInvoice, delInvoice };
