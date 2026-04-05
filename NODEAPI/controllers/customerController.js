/**
 * Customer Controller
 * Handles all customer-related operations
 * API v1.0+
 */

const CustomerModel = require("../models/customerModel");
const asyncHandler = require("express-async-handler");
const {
  NotFoundError,
  ConflictError,
  RESPONSE_MESSAGES,
} = require("../utils/errors");
const { RESPONSE_MESSAGES: MESSAGES } = require("../utils/constants");

/**
 * Get all customers with pagination
 * @route GET /api/v1/customers
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 */
const getCustomers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
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
