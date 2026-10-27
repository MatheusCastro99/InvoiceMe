/**
 * Unit tests: errorMiddleware maps library errors to client errors and
 * never leaks the message of an unexpected error.
 */

const mongoose = require("mongoose");
const errorMiddleware = require("../middlewares/errorMiddleware");
const { AppError, InternalServerError } = require("../utils/errors");
const { RESPONSE_MESSAGES } = require("../utils/constants");

const run = (err) => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  errorMiddleware(err, { method: "GET", path: "/x" }, res, jest.fn());
  return { status: res.status.mock.calls[0][0], body: res.json.mock.calls[0][0] };
};

describe("errorMiddleware", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("maps a duplicate key error (code 11000) to 409", () => {
    const err = Object.assign(new Error("E11000 duplicate key error { phoneNumber: \"5551234567\" }"), {
      code: 11000,
    });

    const { status, body } = run(err);

    expect(status).toBe(409);
    expect(body).toMatchObject({
      success: false,
      message: RESPONSE_MESSAGES.DUPLICATE_RECORD,
      statusCode: 409,
    });
    expect(JSON.stringify(body)).not.toContain("5551234567");
  });

  it("maps a CastError on _id to 400 INVALID_ID", () => {
    const err = new mongoose.Error.CastError("ObjectId", "not-an-id", "_id");

    const { status, body } = run(err);

    expect(status).toBe(400);
    expect(body.message).toBe(RESPONSE_MESSAGES.INVALID_ID);
    expect(JSON.stringify(body)).not.toContain("not-an-id");
  });

  it("maps a CastError on another path to 400 INVALID_REQUEST", () => {
    const err = new mongoose.Error.CastError("Date", "banana", "dateOfService");

    const { status, body } = run(err);

    expect(status).toBe(400);
    expect(body.message).toBe(RESPONSE_MESSAGES.INVALID_REQUEST);
    expect(JSON.stringify(body)).not.toContain("banana");
  });

  it("maps a Mongoose ValidationError to 400 and lists only the paths", () => {
    const err = new mongoose.Error.ValidationError();
    err.addError("companyName", new Error("Path `companyName` is required, got 'secret value'"));
    err.addError("phoneNumber", new Error("bad phone"));

    const { status, body } = run(err);

    expect(status).toBe(400);
    expect(body.message).toBe(RESPONSE_MESSAGES.INVALID_REQUEST);
    expect(body.errors).toEqual(["Invalid value for companyName", "Invalid value for phoneNumber"]);
    expect(JSON.stringify(body)).not.toContain("secret value");
  });

  it("answers an unexpected error as a generic 500 and keeps the detail out of the body", () => {
    const { status, body } = run(new Error("secret detail"));

    expect(status).toBe(500);
    expect(body).toMatchObject({
      success: false,
      message: RESPONSE_MESSAGES.SERVER_ERROR,
      statusCode: 500,
    });
    expect(JSON.stringify(body)).not.toContain("secret detail");
    expect(console.error).toHaveBeenCalledWith("ERROR:", expect.stringContaining("secret detail"));
  });

  it("keeps the message and status of an AppError", () => {
    const { status, body } = run(new AppError("Custom failure", 418));

    expect(status).toBe(418);
    expect(body.message).toBe("Custom failure");
  });

  it("keeps the message of an InternalServerError", () => {
    const { status, body } = run(new InternalServerError("Planned 500"));

    expect(status).toBe(500);
    expect(body.message).toBe("Planned 500");
  });

  it("keeps the message of a library 4xx error such as a body-parser error", () => {
    const err = Object.assign(new SyntaxError("Unexpected token } in JSON"), { statusCode: 400 });

    const { status, body } = run(err);

    expect(status).toBe(400);
    expect(body.message).toBe("Unexpected token } in JSON");
  });
});
