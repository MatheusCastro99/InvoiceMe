/**
 * Characterization tests: /api/v2/tax (rate by state, tax calculation in integer cents, #140).
 */

const request = require("supertest");
const app = require("../app");
const { RESPONSE_MESSAGES } = require("../utils/constants");

describe("POST /api/v2/tax/rate", () => {
  it.each([
    ["CA", "CA"],
    ["ca", "CA"],
  ])("answers the rate for state %s", async (state, code) => {
    const res = await request(app).post("/api/v2/tax/rate").send({ state });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { state: code, taxRate: 7.25 } });
  });

  it("answers a rate of 0 for a state without sales tax", async () => {
    const res = await request(app).post("/api/v2/tax/rate").send({ state: "OR" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ state: "OR", taxRate: 0 });
  });

  it("answers 400 when the state is missing", async () => {
    const res = await request(app).post("/api/v2/tax/rate").send({});

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      message: RESPONSE_MESSAGES.STATE_PARAMETER_REQUIRED,
      statusCode: 400,
    });
  });

  it("answers 400 for an unknown state code", async () => {
    const res = await request(app).post("/api/v2/tax/rate").send({ state: "XX" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid state code: XX");
  });

  it("a numeric state answers 400", async () => {
    const res = await request(app).post("/api/v2/tax/rate").send({ state: 123 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid state code: 123");
  });
});

describe("POST /api/v2/tax/calculate", () => {
  const calculate = (body) => request(app).post("/api/v2/tax/calculate").send(body);

  it.each([
    ["3 x $19.99 in CA", 5997, 7.25, 435, 6432],
    ["1000 in CT rounds half-up", 1000, 6.35, 64, 1064],
    ["1999 at 6.625", 1999, 6.625, 132, 2131],
    ["10000 in MN at 6.875 (a rate with 3 decimals is exact)", 10000, 6.875, 688, 10688],
    ["a rate of 0", 12345, 0, 0, 12345],
    ["a subtotal and a rate of 0", 0, 0, 0, 0],
    ["a rate of 100", 250, 100, 250, 500],
  ])("answers the tax and the final price in cents: %s", async (_name, subtotalCents, taxRate, taxCents, finalPriceCents) => {
    const res = await calculate({ subtotalCents, taxRate });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: { subtotalCents, taxRate, taxCents, finalPriceCents },
    });
  });

  it("gives the same figures as POST /invoices for the same lines", async () => {
    const invoice = await request(app)
      .post("/api/v2/invoices")
      .send({
        companyName: "Acme Plumbing",
        phoneNumber: "5551234567",
        stateAddress: "CA",
        dateOfService: "2026-03-15",
        invoiceNumber: "INV-TAX",
        lineItems: [{ description: "Faucet", quantity: 3, unitPriceCents: 1999 }],
      });
    const calc = await calculate({ subtotalCents: 5997, taxRate: 7.25 });

    expect(invoice.status).toBe(201);
    expect(calc.body.data).toMatchObject({
      subtotalCents: invoice.body.data.subtotalCents,
      taxCents: invoice.body.data.taxCents,
      finalPriceCents: invoice.body.data.finalPriceCents,
    });
  });

  it.each([
    ["a missing subtotalCents", { taxRate: 7.25 }, RESPONSE_MESSAGES.SUBTOTAL_CENTS_REQUIRED],
    ["a missing taxRate", { subtotalCents: 100 }, RESPONSE_MESSAGES.TAX_RATE_REQUIRED],
    ["the old jobPrice instead of subtotalCents", { jobPrice: 100, taxRate: 7.25 }, RESPONSE_MESSAGES.SUBTOTAL_CENTS_REQUIRED],
    ["a float subtotalCents", { subtotalCents: 19.99, taxRate: 7.25 }, RESPONSE_MESSAGES.SUBTOTAL_INVALID],
    ["a negative subtotalCents", { subtotalCents: -1, taxRate: 7.25 }, RESPONSE_MESSAGES.SUBTOTAL_INVALID],
    ["a string subtotalCents", { subtotalCents: "100", taxRate: 7.25 }, RESPONSE_MESSAGES.SUBTOTAL_INVALID],
    ["a partly numeric subtotalCents", { subtotalCents: "12abc", taxRate: 7.25 }, RESPONSE_MESSAGES.SUBTOTAL_INVALID],
    ["a subtotalCents that is not a safe integer", { subtotalCents: 2 ** 60, taxRate: 7.25 }, RESPONSE_MESSAGES.SUBTOTAL_INVALID],
    ["a string taxRate", { subtotalCents: 100, taxRate: "7.25" }, RESPONSE_MESSAGES.TAX_RATE_INVALID],
    ["a partly numeric taxRate", { subtotalCents: 100, taxRate: "12abc" }, RESPONSE_MESSAGES.TAX_RATE_INVALID],
    ["a taxRate above 100", { subtotalCents: 100, taxRate: 101 }, RESPONSE_MESSAGES.TAX_RATE_INVALID],
    ["a taxRate below 0", { subtotalCents: 100, taxRate: -1 }, RESPONSE_MESSAGES.TAX_RATE_INVALID],
    ["a taxRate with 4 decimals", { subtotalCents: 100, taxRate: 6.6251 }, RESPONSE_MESSAGES.TAX_RATE_INVALID],
  ])("answers 400 for %s", async (_name, body, message) => {
    const res = await calculate(body);

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message, statusCode: 400 });
  });

  it("answers 400 when the final price is not a safe integer", async () => {
    const res = await calculate({ subtotalCents: Number.MAX_SAFE_INTEGER, taxRate: 100 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.AMOUNT_TOO_LARGE);
  });
});
