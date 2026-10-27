/**
 * Global Error Handler Middleware
 * Must be placed after all other route handlers
 * Maps Mongoose cast/validation errors and duplicate keys to client errors,
 * and answers a generic message for unexpected server errors.
 * API v1.0+
 */

const mongoose = require("mongoose");
const { AppError } = require("../utils/errors");
const { RESPONSE_MESSAGES } = require("../utils/constants");

const errorMiddleware = (err, req, res, next) => {
  // Library errors may set only `status` (e.g. Express's URI decode failure)
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message;
  let errors;

  if (err instanceof mongoose.Error.CastError) {
    // A value that cannot be cast to its schema type, e.g. a malformed :id
    statusCode = 400;
    message = err.path === "_id" ? RESPONSE_MESSAGES.INVALID_ID : RESPONSE_MESSAGES.INVALID_REQUEST;
  } else if (err instanceof mongoose.Error.ValidationError) {
    // Mongoose's own sub-messages would echo the submitted values, so list only the paths
    statusCode = 400;
    message = RESPONSE_MESSAGES.INVALID_REQUEST;
    errors = Object.keys(err.errors).map((path) => `Invalid value for ${path}`);
  } else if (err.code === 11000) {
    // Duplicate key from a unique index
    statusCode = 409;
    message = RESPONSE_MESSAGES.DUPLICATE_RECORD;
  } else if (statusCode >= 500 && !(err instanceof AppError)) {
    // Unexpected error: log the real message, never send it
    statusCode = 500;
    message = RESPONSE_MESSAGES.SERVER_ERROR;
  }

  // Log error with context (the original message, even when the response is generic)
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    message: err.message,
    statusCode,
  };

  console.error("ERROR:", JSON.stringify(errorLog, null, 2));

  // Build response
  const response = {
    success: false,
    message: message || "Internal server error",
    statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  // Include validation errors if present
  if (errors) {
    response.errors = errors;
  } else if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
