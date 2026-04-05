/**
 * Validation Middleware
 * Validates request data before passing to controllers
 * API v1.0+
 */

const { ValidationError } = require("../utils/errors");
const {
  validateCustomerData,
  validateInvoiceData,
} = require("../utils/validators");

const validateCustomerInput = (req, res, next) => {
  const { isValid, errors } = validateCustomerData(req.body);

  if (!isValid) {
    const error = new ValidationError(errors.join("; "));
    error.errors = errors;
    return next(error);
  }

  next();
};

const validateInvoiceInput = (req, res, next) => {
  const { isValid, errors } = validateInvoiceData(req.body);

  if (!isValid) {
    const error = new ValidationError(errors.join("; "));
    error.errors = errors;
    return next(error);
  }

  next();
};

module.exports = {
  validateCustomerInput,
  validateInvoiceInput,
};
