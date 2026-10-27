/**
 * Customer Controller
 * Handles all customer-related operations
 * API v1.0+
 */

const CustomerModel = require("../models/customerModel");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const {
  NotFoundError,
  ConflictError,
  RESPONSE_MESSAGES,
} = require("../utils/errors");
const { RESPONSE_MESSAGES: MESSAGES, PAGINATION } = require("../utils/constants");
const { normalizePhoneNumber } = require("../utils/validators");

// A whole number of 1 or more, read from a query value; anything else gives the fallback
const toPositiveInteger = (value, fallback) => {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 1 ? number : fallback;
};

/**
 * Get all customers with pagination
 * @route GET /api/v1/customers
 * @param {number} page - Page number (default: 1; a value that is not a whole number of 1 or more falls back to 1)
 * @param {number} limit - Items per page (default: 20, max: 100; a value that is not a whole number of 1 or more falls back to 20)
 */
const getCustomers = asyncHandler(async (req, res) => {
  const page = toPositiveInteger(req.query.page, PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    toPositiveInteger(req.query.limit, PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  const customers = await CustomerModel.find({})
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await CustomerModel.countDocuments();

  res.status(200).json({
    success: true,
    data: customers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get customer by ID
 * @route GET /api/v1/customers/:id
 */
const getCustomerByID = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await CustomerModel.findById(id);

  if (!customer) {
    throw new NotFoundError(MESSAGES.CUSTOMER_NOT_FOUND);
  }

  res.status(200).json({
    success: true,
    data: customer,
  });
});

/**
 * Create new customer
 * @route POST /api/v1/customers
 * @body {string} companyName - Required
 * @body {string} phoneNumber - Required
 */
const postCustomer = asyncHandler(async (req, res) => {
  // Phone numbers are stored as digits, so a duplicate is found in any accepted format
  req.body.phoneNumber = normalizePhoneNumber(req.body.phoneNumber);

  // Check for duplicate phone number
  const existingCustomer = await CustomerModel.findOne({
    phoneNumber: req.body.phoneNumber,
  });

  if (existingCustomer) {
    throw new ConflictError(MESSAGES.DUPLICATE_CUSTOMER);
  }

  const customer = await CustomerModel.create(req.body);

  res.status(201).json({
    success: true,
    message: MESSAGES.CUSTOMER_CREATED,
    data: customer,
  });
});

/**
 * Update customer
 * @route PUT /api/v1/customers/:id
 */
const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await CustomerModel.findById(id);
  if (!customer) {
    throw new NotFoundError(MESSAGES.CUSTOMER_NOT_FOUND);
  }

  req.body.phoneNumber = normalizePhoneNumber(req.body.phoneNumber);

  // Check for duplicate phone number if changed
  if (req.body.phoneNumber && req.body.phoneNumber !== customer.phoneNumber) {
    const existingCustomer = await CustomerModel.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    if (existingCustomer) {
      throw new ConflictError(MESSAGES.DUPLICATE_CUSTOMER);
    }
  }

  const updatedCustomer = await CustomerModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: MESSAGES.CUSTOMER_UPDATED,
    data: updatedCustomer,
  });
});

/**
 * Delete customer
 * @route DELETE /api/v1/customers/:id
 */
const delCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await CustomerModel.findByIdAndDelete(id);

  if (!customer) {
    throw new NotFoundError(MESSAGES.CUSTOMER_NOT_FOUND);
  }

  res.status(200).json({
    success: true,
    message: MESSAGES.CUSTOMER_DELETED,
    data: customer,
  });
});

module.exports = {
  getCustomers,
  getCustomerByID,
  postCustomer,
  updateCustomer,
  delCustomer,
};
