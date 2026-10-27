/**
 * Characterization tests: /api/v1/invoices (list, create, delete).
 * Known bugs (#69, #70) are pinned as test.failing that asserts the correct behavior.
 */

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const InvoiceModel = require("../models/invoiceModel");
const { RESPONSE_MESSAGES } = require("../utils/constants");

const validInvoice = (overrides = {}) => ({
  companyName: "Acme Plumbing",
  phoneNumber: "5551234567",
  companyEmail: "office@acme.example",
  streetAddress: "12 Main St",
  cityAddress: "Springfield",
  stateAddress: "CA",
  zipAddress: "90210",
  dateOfService: "2026-03-15",
  invoiceNumber: "INV-001",
  jobDescription: "Replace water heater",
  tableData: [{ description: "Water heater", amount: 800 }],
  taxRate: 7.25,
  subtotal: 800,
  finalPrice: 858,
  ...overrides,
});

const unusedId = () => new mongoose.Types.ObjectId().toString();

describe("GET /api/v1/invoices", () => {
  it("answers an empty list when there are no invoices", async () => {
    const res = await request(app).get("/api/v1/invoices");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [], count: 0 });
  });

  describe("with three invoices", () => {
    beforeEach(async () => {
      await InvoiceModel.insertMany([
        validInvoice({ invoiceNumber: "MIDDLE", createdAt: new Date("2026-01-02T00:00:00Z") }),
        validInvoice({ invoiceNumber: "OLDEST", createdAt: new Date("2026-01-01T00:00:00Z") }),
        validInvoice({ invoiceNumber: "NEWEST", createdAt: new Date("2026-01-03T00:00:00Z") }),
      ]);
    });

    it("answers a count equal to the number stored", async () => {
      const res = await request(app).get("/api/v1/invoices");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(res.body.data).toHaveLength(3);
    });

    it("lists the newest invoice first", async () => {
      const res = await request(app).get("/api/v1/invoices");

      expect(res.body.data.map((i) => i.invoiceNumber)).toEqual(["NEWEST", "MIDDLE", "OLDEST"]);
    });
  });
});

describe("POST /api/v1/invoices", () => {
  it("creates an invoice", async () => {
    const res = await request(app).post("/api/v1/invoices").send(validInvoice());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.INVOICE_CREATED);
    expect(res.body.data).toMatchObject(validInvoice());
    expect(res.body.data._id).toBeDefined();
    expect(await InvoiceModel.countDocuments()).toBe(1);
  });

  it("accepts a finalPrice of 0", async () => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send(validInvoice({ finalPrice: 0 }));

    expect(res.status).toBe(201);
    expect(res.body.data.finalPrice).toBe(0);
  });

  describe("validation", () => {
    it.each([
      ["a missing companyName", { companyName: undefined }, "Company name is required"],
      ["a missing phoneNumber", { phoneNumber: undefined }, "Phone number is required"],
      ["a badly formatted phoneNumber", { phoneNumber: "12345" }, "Invalid phone number format"],
      ["a missing dateOfService", { dateOfService: undefined }, "Date of service is required"],
      ["a missing finalPrice", { finalPrice: undefined }, "Final price is required"],
      ["a non-numeric finalPrice", { finalPrice: "abc" }, "Final price must be a valid positive number"],
      ["a negative finalPrice", { finalPrice: -5 }, "Final price must be a valid positive number"],
    ])("answers 400 for %s", async (_name, overrides, message) => {
      const res = await request(app)
        .post("/api/v1/invoices")
        .send(validInvoice(overrides));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toContain(message);
      expect(res.body.message).toContain(message);
      expect(await InvoiceModel.countDocuments()).toBe(0);
    });

    it("lists every failing rule", async () => {
      const res = await request(app).post("/api/v1/invoices").send({});

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        "Company name is required",
        "Phone number is required",
        "Date of service is required",
        "Final price is required",
      ]);
    });
  });

  it("a finalPrice that is only partly numeric answers 400", async () => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send(validInvoice({ finalPrice: "12abc" }));

    expect(res.status).toBe(400);
  });

  test.failing("#69: a numeric phoneNumber answers 400", async () => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send(validInvoice({ phoneNumber: 5551234567 }));

    expect(res.status).toBe(400);
  });

  test.failing("#70: a non-date dateOfService answers 400", async () => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send(validInvoice({ dateOfService: "banana" }));

    expect(res.status).toBe(400);
  });

  describe("with an invoice already stored", () => {
    beforeEach(async () => {
      await InvoiceModel.create(validInvoice());
    });

    test.failing("#70: a duplicate invoiceNumber answers 409", async () => {
      const res = await request(app).post("/api/v1/invoices").send(validInvoice());

      expect(res.status).toBe(409);
    });
  });
});

describe("DELETE /api/v1/invoices/:id", () => {
  let invoice;

  beforeEach(async () => {
    invoice = await InvoiceModel.create(validInvoice());
  });

  it("deletes the invoice and answers it", async () => {
    const res = await request(app).delete(`/api/v1/invoices/${invoice._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.INVOICE_DELETED);
    expect(res.body.data._id).toBe(invoice._id.toString());
    expect(await InvoiceModel.countDocuments()).toBe(0);
  });

  it("answers 404 for an id that is not stored", async () => {
    const res = await request(app).delete(`/api/v1/invoices/${unusedId()}`);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      message: RESPONSE_MESSAGES.INVOICE_NOT_FOUND,
      statusCode: 404,
    });
  });

  it("a malformed id answers 400", async () => {
    const res = await request(app).delete("/api/v1/invoices/not-an-id");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.INVALID_ID);
  });
});
