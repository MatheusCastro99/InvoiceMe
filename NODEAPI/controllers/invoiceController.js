/**
 * Invoice Controller
 * Handles invoice generation and management
 * API v1.0+
 */

const asyncHandler = require("express-async-handler");
const InvoiceModel = require("../models/invoiceModel");
const { NotFoundError } = require("../utils/errors");
const { RESPONSE_MESSAGES } = require("../utils/constants");

/**
 * Get all invoices
 * @route GET /api/v1/invoices
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
 * @route POST /api/v1/invoices
 * @body {string} companyName - Required
 * @body {string} phoneNumber - Required
 * @body {string} dateOfService - Required
 * @body {number} finalPrice - Required
 * @returns {Object} Created invoice
 */
const postInvoice = asyncHandler(async (req, res) => {
  const invoice = await InvoiceModel.create(req.body);

  res.status(201).json({
    success: true,
    message: RESPONSE_MESSAGES.INVOICE_CREATED,
    data: invoice,
  });
});

/**
 * Delete invoice
 * @route DELETE /api/v1/invoices/:id
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
