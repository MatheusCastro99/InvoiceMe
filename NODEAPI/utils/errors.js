/**
 * Custom Error Classes for consistent error handling
 * Used throughout the API for standardized error responses
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
    this.name = "ConflictError";
  }
}

class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500);
    this.name = "InternalServerError";
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  InternalServerError,
};
