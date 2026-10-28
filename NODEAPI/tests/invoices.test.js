/**
 * Characterization tests: /api/v1/invoices (list, create, delete).
 * invoiceNumber is required and unique (#139); the unique index is built once for this file.
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

// The unique invoiceNumber index is built by server.js in production; build it once for this file
beforeAll(() => InvoiceModel.init());

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

    it("answers every dateOfService as YYYY-MM-DD", async () => {
      const res = await request(app).get("/api/v1/invoices");

      expect(res.body.data.map((i) => i.dateOfService)).toEqual(["2026-03-15", "2026-03-15", "2026-03-15"]);
    });

    it("lists the newest invoice first", async () => {
      const res = await request(app).get("/api/v1/invoices");

      expect(res.body.data.map((i) => i.invoiceNumber)).toEqual(["NEWEST", "MIDDLE", "OLDEST"]);
    });
  });
});

describe("GET /api/v1/invoices with a row stored before dateOfService was a date", () => {
  it("answers 200 and the invoice, without breaking the list", async () => {
    await InvoiceModel.collection.insertOne({ ...validInvoice(), dateOfService: "banana" });

    const res = await request(app).get("/api/v1/invoices");

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].invoiceNumber).toBe("INV-001");
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

  it("accepts a finalPrice sent as a numeric string", async () => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send(validInvoice({ finalPrice: "858.50" }));

    expect(res.status).toBe(201);
    expect(res.body.data.finalPrice).toBe(858.5);
  });

  describe("validation", () => {
    it.each([
      ["a missing companyName", { companyName: undefined }, "Company name is required"],
      ["a missing phoneNumber", { phoneNumber: undefined }, "Phone number is required"],
      ["a badly formatted phoneNumber", { phoneNumber: "12345" }, "Invalid phone number format"],
      ["a missing dateOfService", { dateOfService: undefined }, "Date of service is required"],
      ["a missing invoiceNumber", { invoiceNumber: undefined }, RESPONSE_MESSAGES.INVOICE_NUMBER_REQUIRED],
      ["a blank invoiceNumber", { invoiceNumber: "   " }, RESPONSE_MESSAGES.INVOICE_NUMBER_REQUIRED],
      ["an invoiceNumber that is not a string", { invoiceNumber: 42 }, RESPONSE_MESSAGES.INVOICE_NUMBER_REQUIRED],
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
        RESPONSE_MESSAGES.INVOICE_NUMBER_REQUIRED,
        "Final price is required",
      ]);
    });
  });

  it("a finalPrice that is only partly numeric answers 400", async () => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send(validInvoice({ finalPrice: "12abc" }));

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain("Final price must be a valid positive number");
  });

  it("a numeric phoneNumber answers 400", async () => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send(validInvoice({ phoneNumber: 5551234567 }));

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain("Invalid phone number format");
  });

  it("a non-date dateOfService answers 400", async () => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send(validInvoice({ dateOfService: "banana" }));

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain(RESPONSE_MESSAGES.INVALID_DATE_OF_SERVICE);
  });

  it.each([
    ["a date written MM/DD/YYYY", "10/27/2026"],
    ["a date that does not exist", "2026-02-30"],
    ["a month that does not exist", "2026-13-01"],
    ["a year below 100", "0026-01-01"],
    ["a number", 20260315],
  ])("answers 400 for dateOfService as %s", async (_name, dateOfService) => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send(validInvoice({ dateOfService }));

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain(RESPONSE_MESSAGES.INVALID_DATE_OF_SERVICE);
    expect(await InvoiceModel.countDocuments()).toBe(0);
  });

  it("accepts 29 February of a leap year", async () => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send(validInvoice({ dateOfService: "2024-02-29" }));

    expect(res.status).toBe(201);
    expect(res.body.data.dateOfService).toBe("2024-02-29");
  });

  it("stores dateOfService as a Date at UTC midnight and answers YYYY-MM-DD", async () => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send(validInvoice({ dateOfService: "2026-03-15" }));

    expect(res.status).toBe(201);
    expect(res.body.data.dateOfService).toBe("2026-03-15");

    const stored = await InvoiceModel.findById(res.body.data._id).lean();
    expect(stored.dateOfService).toBeInstanceOf(Date);
    expect(stored.dateOfService.toISOString()).toBe("2026-03-15T00:00:00.000Z");
  });

  describe("in another time zone", () => {
    const originalTZ = process.env.TZ;

    afterEach(() => {
      if (originalTZ === undefined) delete process.env.TZ;
      else process.env.TZ = originalTZ;
    });

    it.each(["America/Los_Angeles", "Asia/Tokyo"])("answers the date that was sent (%s)", async (zone) => {
      process.env.TZ = zone;

      const res = await request(app)
        .post("/api/v1/invoices")
        .send(validInvoice({ dateOfService: "2026-03-15" }));

      expect(res.status).toBe(201);
      expect(res.body.data.dateOfService).toBe("2026-03-15");
    });
  });

  describe("with an invoice already stored", () => {
    beforeEach(async () => {
      await InvoiceModel.create(validInvoice());
    });

    it("answers 409 for a duplicate invoiceNumber", async () => {
      const res = await request(app).post("/api/v1/invoices").send(validInvoice());

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        success: false,
        message: RESPONSE_MESSAGES.DUPLICATE_RECORD,
        statusCode: 409,
      });
      expect(await InvoiceModel.countDocuments()).toBe(1);
    });

    it("answers 409 for a duplicate written with surrounding spaces", async () => {
      const res = await request(app)
        .post("/api/v1/invoices")
        .send(validInvoice({ invoiceNumber: "  INV-001  " }));

      expect(res.status).toBe(409);
      expect(res.body.message).toBe(RESPONSE_MESSAGES.DUPLICATE_RECORD);
      expect(await InvoiceModel.countDocuments()).toBe(1);
    });

    it("creates an invoice with a different invoiceNumber", async () => {
      const res = await request(app)
        .post("/api/v1/invoices")
        .send(validInvoice({ invoiceNumber: "INV-002" }));

      expect(res.status).toBe(201);
      expect(await InvoiceModel.countDocuments()).toBe(2);
    });
  });

  it("stores the invoiceNumber trimmed", async () => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send(validInvoice({ invoiceNumber: "  INV-007  " }));

    expect(res.status).toBe(201);
    expect(res.body.data.invoiceNumber).toBe("INV-007");
  });

  it("accepts two old rows without an invoiceNumber (the index is partial)", async () => {
    const { invoiceNumber, ...oldRow } = validInvoice();

    await InvoiceModel.collection.insertMany([{ ...oldRow }, { ...oldRow }]);

    expect(await InvoiceModel.countDocuments()).toBe(2);
    const res = await request(app).post("/api/v1/invoices").send(validInvoice());
    expect(res.status).toBe(201);
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
    expect(res.body.data.dateOfService).toBe("2026-03-15");
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
