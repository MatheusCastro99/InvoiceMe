/**
 * Characterization tests: /api/v1/tax (rate by state, tax calculation).
 * Known bugs (#69) are pinned as test.failing that asserts the correct behavior.
 */

const request = require("supertest");
const app = require("../app");

describe("POST /api/v1/tax/rate", () => {
  it.each([
    ["CA", "CA"],
    ["ca", "CA"],
  ])("answers the rate for state %s", async (state, code) => {
    const res = await request(app).post("/api/v1/tax/rate").send({ state });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { state: code, taxRate: 7.25 } });
  });

  it("answers a rate of 0 for a state without sales tax", async () => {
    const res = await request(app).post("/api/v1/tax/rate").send({ state: "OR" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ state: "OR", taxRate: 0 });
  });

  it("answers 400 when the state is missing", async () => {
    const res = await request(app).post("/api/v1/tax/rate").send({});

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      message: "State parameter is required",
      statusCode: 400,
    });
  });

  it("answers 400 for an unknown state code", async () => {
    const res = await request(app).post("/api/v1/tax/rate").send({ state: "XX" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid state code: XX");
  });

  test.failing("#69: a numeric state answers 400", async () => {
    const res = await request(app).post("/api/v1/tax/rate").send({ state: 123 });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/tax/calculate", () => {
  it("answers the tax amount and the final price", async () => {
    const res = await request(app)
      .post("/api/v1/tax/calculate")
      .send({ jobPrice: 100, taxRate: 7.25 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: { jobPrice: 100, taxRate: 7.25, taxAmount: 7.25, finalPrice: 107.25 },
    });
  });

  it("rounds the tax amount and the final price to 2 decimals", async () => {
    const res = await request(app)
      .post("/api/v1/tax/calculate")
      .send({ jobPrice: 19.99, taxRate: 6.625 });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      jobPrice: 19.99,
      taxRate: 6.625,
      taxAmount: 1.32,
      finalPrice: 21.31,
    });
  });

  it("accepts numeric strings", async () => {
    const res = await request(app)
      .post("/api/v1/tax/calculate")
      .send({ jobPrice: "100", taxRate: "10" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      jobPrice: 100,
      taxRate: 10,
      taxAmount: 10,
      finalPrice: 110,
    });
  });

  it("accepts a job price and a tax rate of 0", async () => {
    const res = await request(app)
      .post("/api/v1/tax/calculate")
      .send({ jobPrice: 0, taxRate: 0 });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ jobPrice: 0, taxRate: 0, taxAmount: 0, finalPrice: 0 });
  });

  it.each([
    ["a missing jobPrice", { taxRate: 7.25 }, "Job price is required"],
    ["a missing taxRate", { jobPrice: 100 }, "Tax rate is required"],
    ["a negative jobPrice", { jobPrice: -1, taxRate: 7.25 }, "Job price must be a valid positive number"],
    ["a non-numeric jobPrice", { jobPrice: "abc", taxRate: 7.25 }, "Job price must be a valid positive number"],
    ["a taxRate above 100", { jobPrice: 100, taxRate: 101 }, "Tax rate must be between 0 and 100"],
    ["a taxRate below 0", { jobPrice: 100, taxRate: -1 }, "Tax rate must be between 0 and 100"],
  ])("answers 400 for %s", async (_name, body, message) => {
    const res = await request(app).post("/api/v1/tax/calculate").send(body);

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message, statusCode: 400 });
  });
});
