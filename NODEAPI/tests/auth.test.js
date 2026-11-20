/**
 * HTTP tests: every /api/v2/ route requires a signed-in user (ADR-014), answered as a 401 in the
 * standard error shape before any controller runs. /, /health and CORS preflight stay open.
 * These tests use plain supertest, so no request carries the test token unless a test adds it.
 */

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const CustomerModel = require("../models/customerModel");
const InvoiceModel = require("../models/invoiceModel");
const { RESPONSE_MESSAGES } = require("../utils/constants");
const { signTestToken } = require("./setup/tokenHelper");

const validCustomer = {
  companyName: "Acme Plumbing",
  phoneNumber: "5551234567",
  companyEmail: "office@acme.example",
  contactName: "Dana Smith",
  streetAddress: "12 Main St",
  cityAddress: "Springfield",
  stateAddress: "CA",
  zipAddress: "90210",
};

const validInvoice = {
  ...validCustomer,
  dateOfService: "2026-03-15",
  invoiceNumber: "INV-001",
  jobDescription: "Replace water heater",
  lineItems: [{ description: "Water heater", quantity: 1, unitPriceCents: 80000 }],
};

const id = () => new mongoose.Types.ObjectId().toString();

// The ten /api/v2/ routes: method, path, and a body a controller would accept (null for none; jest-each
// would pass its done callback in a missing third argument)
const ROUTES = [
  ["get", "/api/v2/customers", null],
  ["get", `/api/v2/customers/${id()}`, null],
  ["post", "/api/v2/customers", validCustomer],
  ["put", `/api/v2/customers/${id()}`, validCustomer],
  ["delete", `/api/v2/customers/${id()}`, null],
  ["get", "/api/v2/invoices", null],
  ["post", "/api/v2/invoices", validInvoice],
  ["delete", `/api/v2/invoices/${id()}`, null],
  ["post", "/api/v2/tax/rate", { state: "CA" }],
  ["post", "/api/v2/tax/calculate", { state: "CA", subtotalCents: 80000 }],
];

const send = (method, path, body, token) => {
  let req = request(app)[method](path);
  if (token) {
    req = req.set("Authorization", `Bearer ${token}`);
  }
  return body ? req.send(body) : req;
};

const expectSignInRequired = (res) => {
  expect(res.status).toBe(401);
  expect(res.body).toMatchObject({
    success: false,
    message: RESPONSE_MESSAGES.SIGN_IN_REQUIRED,
    statusCode: 401,
  });
  expect(res.body.data).toBeUndefined();
};

beforeAll(async () => {
  await CustomerModel.init();
  await InvoiceModel.init();
});

describe("every /api/v2/ route without a token", () => {
  it("covers the ten routes", () => {
    expect(ROUTES).toHaveLength(10);
  });

  it.each(ROUTES)("answers 401 on %s %s", async (method, path, body) => {
    const res = await send(method, path, body);

    expectSignInRequired(res);
  });

  it("answers 401 on an unknown /api/v2/ path, not 404", async () => {
    expectSignInRequired(await send("get", "/api/v2/nothing-here"));
  });

  it("answers 401 before the body is validated", async () => {
    expectSignInRequired(await send("post", "/api/v2/customers", { companyName: "" }));
  });

  it("writes nothing: no customer or invoice is created", async () => {
    await send("post", "/api/v2/customers", validCustomer);
    await send("post", "/api/v2/invoices", validInvoice);

    expect(await CustomerModel.countDocuments()).toBe(0);
    expect(await InvoiceModel.countDocuments()).toBe(0);
  });

  it("changes nothing: a stored customer is neither updated nor deleted", async () => {
    const customer = await CustomerModel.create(validCustomer);

    await send("put", `/api/v2/customers/${customer.id}`, { ...validCustomer, companyName: "Changed" });
    await send("delete", `/api/v2/customers/${customer.id}`);

    const stored = await CustomerModel.findById(customer.id);
    expect(stored).not.toBeNull();
    expect(stored.companyName).toBe(validCustomer.companyName);
  });

  it("changes nothing: a stored invoice is not deleted", async () => {
    const invoice = await InvoiceModel.create({
      ...validInvoice,
      lineItems: [{ description: "Water heater", quantity: 1, unitPriceCents: 80000, lineTotalCents: 80000 }],
      subtotalCents: 80000,
      taxRate: 7.25,
      taxCents: 5800,
      finalPriceCents: 85800,
    });

    await send("delete", `/api/v2/invoices/${invoice.id}`);

    expect(await InvoiceModel.countDocuments()).toBe(1);
  });
});

describe("a token that is not valid", () => {
  it.each(ROUTES)("answers 401 on %s %s", async (method, path, body) => {
    const res = await send(method, path, body, "not-a-jwt");

    expectSignInRequired(res);
  });

  it("answers 401 for an expired token and echoes nothing of it", async () => {
    const token = await signTestToken({}, { expiresIn: Math.floor(Date.now() / 1000) - 3600 });

    const res = await send("get", "/api/v2/customers", undefined, token);

    expectSignInRequired(res);
    expect(JSON.stringify(res.body)).not.toContain(token);
  });

  it("answers 401 for a token without the API's scope", async () => {
    const token = await signTestToken({ scp: "other.read" });

    expectSignInRequired(await send("get", "/api/v2/customers", undefined, token));
  });
});

describe("a valid token", () => {
  it("reaches the controller", async () => {
    const token = await signTestToken();

    const res = await send("get", "/api/v2/customers", undefined, token);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, data: [] });
  });
});

describe("the routes that stay open", () => {
  it("answers CORS preflight on an /api/v2/ path with 200 and no token", async () => {
    const res = await request(app)
      .options("/api/v2/customers")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Authorization,Content-Type");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(res.headers["access-control-allow-headers"]).toMatch(/Authorization/i);
  });

  it.each(["/", "/health"])("answers 200 on GET %s with no token", async (path) => {
    const res = await request(app).get(path);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
