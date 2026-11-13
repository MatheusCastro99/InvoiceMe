/**
 * Characterization tests: /api/v2/invoices (list, create, delete).
 * invoiceNumber is required and unique (#139); the unique index is built once for this file.
 * Money is integer cents and the server computes every figure (#140, ADR-012).
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
  lineItems: [{ description: "Water heater", quantity: 1, unitPriceCents: 80000 }],
  ...overrides,
});

// What the server stores for validInvoice(): 1 x $800.00 in CA (7.25%)
const computedFigures = {
  lineItems: [{ description: "Water heater", quantity: 1, unitPriceCents: 80000, lineTotalCents: 80000 }],
  subtotalCents: 80000,
  taxRate: 7.25,
  taxCents: 5800,
  finalPriceCents: 85800,
};

// A row as it is stored by the model (what the list tests insert)
const storedInvoice = (overrides = {}) => ({ ...validInvoice(), ...computedFigures, ...overrides });

const unusedId = () => new mongoose.Types.ObjectId().toString();

// The unique invoiceNumber index is built by server.js in production; build it once for this file
beforeAll(() => InvoiceModel.init());

describe("GET /api/v2/invoices", () => {
  it("answers an empty list when there are no invoices", async () => {
    const res = await request(app).get("/api/v2/invoices");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [], count: 0 });
  });

  describe("with three invoices", () => {
    beforeEach(async () => {
      await InvoiceModel.insertMany([
        storedInvoice({ invoiceNumber: "MIDDLE", createdAt: new Date("2026-01-02T00:00:00Z") }),
        storedInvoice({ invoiceNumber: "OLDEST", createdAt: new Date("2026-01-01T00:00:00Z") }),
        storedInvoice({ invoiceNumber: "NEWEST", createdAt: new Date("2026-01-03T00:00:00Z") }),
      ]);
    });

    it("answers a count equal to the number stored", async () => {
      const res = await request(app).get("/api/v2/invoices");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(res.body.data).toHaveLength(3);
    });

    it("answers every dateOfService as YYYY-MM-DD", async () => {
      const res = await request(app).get("/api/v2/invoices");

      expect(res.body.data.map((i) => i.dateOfService)).toEqual(["2026-03-15", "2026-03-15", "2026-03-15"]);
    });

    it("lists the newest invoice first", async () => {
      const res = await request(app).get("/api/v2/invoices");

      expect(res.body.data.map((i) => i.invoiceNumber)).toEqual(["NEWEST", "MIDDLE", "OLDEST"]);
    });
  });
});

describe("GET /api/v2/invoices with a row stored before dateOfService was a date", () => {
  it("answers 200 and the invoice, without breaking the list", async () => {
    await InvoiceModel.collection.insertOne({ ...storedInvoice(), dateOfService: "banana" });

    const res = await request(app).get("/api/v2/invoices");

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].invoiceNumber).toBe("INV-001");
  });
});

describe("GET /api/v2/invoices with a row stored in dollars (before cents)", () => {
  it("answers 200 and the old row with its old keys and none of the new ones (#141 converts it)", async () => {
    const { lineItems, subtotalCents, taxCents, finalPriceCents, taxRate, ...rest } = storedInvoice();
    await InvoiceModel.collection.insertOne({
      ...rest,
      tableData: [{ description: "Water heater", amount: 800 }],
      taxRate: 7.25,
      subtotal: 800,
      finalPrice: 858,
    });

    const res = await request(app).get("/api/v2/invoices");

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0]).toMatchObject({ subtotal: 800, finalPrice: 858, tableData: [{ amount: 800 }] });
    expect(res.body.data[0].finalPriceCents).toBeUndefined();
    expect(res.body.data[0].subtotalCents).toBeUndefined();
  });
});

describe("POST /api/v2/invoices", () => {
  const post = (body) => request(app).post("/api/v2/invoices").send(body);

  it("creates an invoice and answers the server's figures", async () => {
    const res = await post(validInvoice());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.INVOICE_CREATED);
    expect(res.body.data).toMatchObject({ ...validInvoice(), ...computedFigures });
    expect(res.body.data._id).toBeDefined();
    expect(await InvoiceModel.countDocuments()).toBe(1);
  });

  describe("money", () => {
    it("3 x $19.99 in CA is 5997 / 435 / 6432", async () => {
      const res = await post(
        validInvoice({ lineItems: [{ description: "Faucet", quantity: 3, unitPriceCents: 1999 }] })
      );

      expect(res.status).toBe(201);
      expect(res.body.data.lineItems).toEqual([
        { description: "Faucet", quantity: 3, unitPriceCents: 1999, lineTotalCents: 5997 },
      ]);
      expect(res.body.data).toMatchObject({
        subtotalCents: 5997,
        taxRate: 7.25,
        taxCents: 435,
        finalPriceCents: 6432,
      });
    });

    it("rounds the tax half-up: 1000 in CT (6.35) is 64", async () => {
      const res = await post(
        validInvoice({
          stateAddress: "CT",
          lineItems: [{ description: "Part", quantity: 1, unitPriceCents: 1000 }],
        })
      );

      expect(res.body.data).toMatchObject({ taxRate: 6.35, taxCents: 64, finalPriceCents: 1064 });
    });

    it("a rate with 3 decimals is exact: 10000 in MN (6.875) is 688", async () => {
      const res = await post(
        validInvoice({
          stateAddress: "MN",
          lineItems: [{ description: "Part", quantity: 1, unitPriceCents: 10000 }],
        })
      );

      expect(res.body.data).toMatchObject({ taxRate: 6.875, taxCents: 688, finalPriceCents: 10688 });
    });

    it("rounds a line total half-up: 1.5 x 333 is 500", async () => {
      const res = await post(
        validInvoice({ lineItems: [{ description: "Pipe", quantity: 1.5, unitPriceCents: 333 }] })
      );

      expect(res.body.data.lineItems[0].lineTotalCents).toBe(500);
      expect(res.body.data.subtotalCents).toBe(500);
    });

    it("sums the line totals and taxes the subtotal once", async () => {
      const res = await post(
        validInvoice({
          lineItems: [
            { description: "Faucet", quantity: 3, unitPriceCents: 1999 },
            { description: "Pipe", quantity: 1.5, unitPriceCents: 333 },
          ],
        })
      );

      expect(res.body.data).toMatchObject({
        subtotalCents: 6497,
        taxCents: 471,
        finalPriceCents: 6968,
      });
    });

    it("uses the sent subtotalCents when there are no lines", async () => {
      const res = await post(validInvoice({ lineItems: undefined, subtotalCents: 100000 }));

      expect(res.status).toBe(201);
      expect(res.body.data.lineItems).toEqual([]);
      expect(res.body.data).toMatchObject({ subtotalCents: 100000, taxCents: 7250, finalPriceCents: 107250 });
    });

    it("an empty lines list also uses the sent subtotalCents", async () => {
      const res = await post(validInvoice({ lineItems: [], subtotalCents: 2500 }));

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ subtotalCents: 2500, taxCents: 181, finalPriceCents: 2681 });
    });

    it("accepts a subtotal of 0 and a state without sales tax", async () => {
      const res = await post(validInvoice({ stateAddress: "OR", lineItems: undefined, subtotalCents: 0 }));

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ taxRate: 0, subtotalCents: 0, taxCents: 0, finalPriceCents: 0 });
    });

    it("ignores the figures the client sends", async () => {
      const res = await post(
        validInvoice({
          taxRate: 99,
          taxCents: 1,
          finalPriceCents: 1,
          subtotalCents: 1,
          finalPrice: 1,
          lineItems: [{ description: "Water heater", quantity: 1, unitPriceCents: 80000, lineTotalCents: 1 }],
        })
      );

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject(computedFigures);
      expect(res.body.data.finalPrice).toBeUndefined();
    });

    it("stores integer cents and the lines in the database", async () => {
      const res = await post(validInvoice());

      const stored = await InvoiceModel.findById(res.body.data._id).lean();
      expect(stored).toMatchObject(computedFigures);
      expect(stored.finalPrice).toBeUndefined();
      expect(stored.tableData).toBeUndefined();
    });

    it("trims a line description", async () => {
      const res = await post(
        validInvoice({ lineItems: [{ description: "  Pipe  ", quantity: 1, unitPriceCents: 100 }] })
      );

      expect(res.body.data.lineItems[0].description).toBe("Pipe");
    });

    it("answers 400 when a line total is not a safe integer", async () => {
      const res = await post(
        validInvoice({
          lineItems: [{ description: "Gold", quantity: 100, unitPriceCents: Number.MAX_SAFE_INTEGER }],
        })
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(RESPONSE_MESSAGES.AMOUNT_TOO_LARGE);
      expect(await InvoiceModel.countDocuments()).toBe(0);
    });

    it("answers 400 when the sum of the lines is not a safe integer", async () => {
      const big = { description: "Gold", quantity: 1, unitPriceCents: Number.MAX_SAFE_INTEGER };
      const res = await post(validInvoice({ lineItems: [big, big] }));

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(RESPONSE_MESSAGES.AMOUNT_TOO_LARGE);
    });
  });

  describe("validation", () => {
    const line = (overrides = {}) => ({ description: "Pipe", quantity: 1, unitPriceCents: 100, ...overrides });

    it.each([
      ["a missing companyName", { companyName: undefined }, "Company name is required"],
      ["a missing phoneNumber", { phoneNumber: undefined }, "Phone number is required"],
      ["a badly formatted phoneNumber", { phoneNumber: "12345" }, "Invalid phone number format"],
      ["a missing dateOfService", { dateOfService: undefined }, "Date of service is required"],
      ["a missing invoiceNumber", { invoiceNumber: undefined }, RESPONSE_MESSAGES.INVOICE_NUMBER_REQUIRED],
      ["a blank invoiceNumber", { invoiceNumber: "   " }, RESPONSE_MESSAGES.INVOICE_NUMBER_REQUIRED],
      ["an invoiceNumber that is not a string", { invoiceNumber: 42 }, RESPONSE_MESSAGES.INVOICE_NUMBER_REQUIRED],
      ["a missing stateAddress", { stateAddress: undefined }, RESPONSE_MESSAGES.STATE_REQUIRED],
      ["a blank stateAddress", { stateAddress: "" }, RESPONSE_MESSAGES.STATE_REQUIRED],
      ["an unknown stateAddress", { stateAddress: "XX" }, RESPONSE_MESSAGES.STATE_INVALID],
      ["DC, which has no tax rate", { stateAddress: "DC" }, RESPONSE_MESSAGES.STATE_INVALID],
      ["a lowercase stateAddress", { stateAddress: "ca" }, RESPONSE_MESSAGES.STATE_INVALID],
      ["a stateAddress that is an Object.prototype key", { stateAddress: "constructor" }, RESPONSE_MESSAGES.STATE_INVALID],
      ["lineItems that is not a list", { lineItems: "Pipe" }, RESPONSE_MESSAGES.LINE_ITEMS_INVALID],
      ["no lines and no subtotalCents", { lineItems: undefined }, RESPONSE_MESSAGES.SUBTOTAL_REQUIRED],
      ["an empty list and no subtotalCents", { lineItems: [] }, RESPONSE_MESSAGES.SUBTOTAL_REQUIRED],
      ["a float subtotalCents", { lineItems: undefined, subtotalCents: 10.5 }, RESPONSE_MESSAGES.SUBTOTAL_INVALID],
      ["a negative subtotalCents", { lineItems: undefined, subtotalCents: -1 }, RESPONSE_MESSAGES.SUBTOTAL_INVALID],
      ["a string subtotalCents", { lineItems: undefined, subtotalCents: "100" }, RESPONSE_MESSAGES.SUBTOTAL_INVALID],
      [
        "a subtotalCents that is not a safe integer",
        { lineItems: undefined, subtotalCents: 2 ** 60 },
        RESPONSE_MESSAGES.SUBTOTAL_INVALID,
      ],
      ["a blank description", { lineItems: [line({ description: "   " })] }, RESPONSE_MESSAGES.LINE_ITEM_DESCRIPTION_REQUIRED],
      ["a missing description", { lineItems: [line({ description: undefined })] }, RESPONSE_MESSAGES.LINE_ITEM_DESCRIPTION_REQUIRED],
      ["a quantity of 0", { lineItems: [line({ quantity: 0 })] }, RESPONSE_MESSAGES.LINE_ITEM_QUANTITY_INVALID],
      ["a negative quantity", { lineItems: [line({ quantity: -1 })] }, RESPONSE_MESSAGES.LINE_ITEM_QUANTITY_INVALID],
      ["a quantity with 3 decimals", { lineItems: [line({ quantity: 1.005 })] }, RESPONSE_MESSAGES.LINE_ITEM_QUANTITY_INVALID],
      ["a string quantity", { lineItems: [line({ quantity: "2" })] }, RESPONSE_MESSAGES.LINE_ITEM_QUANTITY_INVALID],
      ["a missing quantity", { lineItems: [line({ quantity: undefined })] }, RESPONSE_MESSAGES.LINE_ITEM_QUANTITY_INVALID],
      ["a float unitPriceCents", { lineItems: [line({ unitPriceCents: 19.99 })] }, RESPONSE_MESSAGES.LINE_ITEM_PRICE_INVALID],
      ["a negative unitPriceCents", { lineItems: [line({ unitPriceCents: -100 })] }, RESPONSE_MESSAGES.LINE_ITEM_PRICE_INVALID],
      ["a string unitPriceCents", { lineItems: [line({ unitPriceCents: "1999" })] }, RESPONSE_MESSAGES.LINE_ITEM_PRICE_INVALID],
      ["a partly numeric unitPriceCents", { lineItems: [line({ unitPriceCents: "12abc" })] }, RESPONSE_MESSAGES.LINE_ITEM_PRICE_INVALID],
      ["a line that is not an object", { lineItems: ["Pipe"] }, RESPONSE_MESSAGES.LINE_ITEM_DESCRIPTION_REQUIRED],
    ])("answers 400 for %s", async (_name, overrides, message) => {
      const res = await post(validInvoice(overrides));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toContain(message);
      expect(res.body.message).toContain(message);
      expect(await InvoiceModel.countDocuments()).toBe(0);
    });

    it("lists every failing rule", async () => {
      const res = await post({});

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        "Company name is required",
        "Phone number is required",
        "Date of service is required",
        RESPONSE_MESSAGES.INVOICE_NUMBER_REQUIRED,
        RESPONSE_MESSAGES.STATE_REQUIRED,
        RESPONSE_MESSAGES.SUBTOTAL_REQUIRED,
      ]);
    });

    it("lists each failing line rule once", async () => {
      const res = await post(
        validInvoice({ lineItems: [line({ description: "" }), line({ quantity: 0, unitPriceCents: 1.5 })] })
      );

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        RESPONSE_MESSAGES.LINE_ITEM_DESCRIPTION_REQUIRED,
        RESPONSE_MESSAGES.LINE_ITEM_QUANTITY_INVALID,
        RESPONSE_MESSAGES.LINE_ITEM_PRICE_INVALID,
      ]);
    });
  });

  it("a numeric phoneNumber answers 400", async () => {
    const res = await request(app)
      .post("/api/v2/invoices")
      .send(validInvoice({ phoneNumber: 5551234567 }));

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain("Invalid phone number format");
  });

  it("a non-date dateOfService answers 400", async () => {
    const res = await request(app)
      .post("/api/v2/invoices")
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
      .post("/api/v2/invoices")
      .send(validInvoice({ dateOfService }));

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain(RESPONSE_MESSAGES.INVALID_DATE_OF_SERVICE);
    expect(await InvoiceModel.countDocuments()).toBe(0);
  });

  it("accepts 29 February of a leap year", async () => {
    const res = await request(app)
      .post("/api/v2/invoices")
      .send(validInvoice({ dateOfService: "2024-02-29" }));

    expect(res.status).toBe(201);
    expect(res.body.data.dateOfService).toBe("2024-02-29");
  });

  it("stores dateOfService as a Date at UTC midnight and answers YYYY-MM-DD", async () => {
    const res = await request(app)
      .post("/api/v2/invoices")
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
        .post("/api/v2/invoices")
        .send(validInvoice({ dateOfService: "2026-03-15" }));

      expect(res.status).toBe(201);
      expect(res.body.data.dateOfService).toBe("2026-03-15");
    });
  });

  describe("with an invoice already stored", () => {
    beforeEach(async () => {
      await InvoiceModel.create(storedInvoice());
    });

    it("answers 409 for a duplicate invoiceNumber", async () => {
      const res = await request(app).post("/api/v2/invoices").send(validInvoice());

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
        .post("/api/v2/invoices")
        .send(validInvoice({ invoiceNumber: "  INV-001  " }));

      expect(res.status).toBe(409);
      expect(res.body.message).toBe(RESPONSE_MESSAGES.DUPLICATE_RECORD);
      expect(await InvoiceModel.countDocuments()).toBe(1);
    });

    it("creates an invoice with a different invoiceNumber", async () => {
      const res = await request(app)
        .post("/api/v2/invoices")
        .send(validInvoice({ invoiceNumber: "INV-002" }));

      expect(res.status).toBe(201);
      expect(await InvoiceModel.countDocuments()).toBe(2);
    });
  });

  it("stores the invoiceNumber trimmed", async () => {
    const res = await request(app)
      .post("/api/v2/invoices")
      .send(validInvoice({ invoiceNumber: "  INV-007  " }));

    expect(res.status).toBe(201);
    expect(res.body.data.invoiceNumber).toBe("INV-007");
  });

  it("accepts two old rows without an invoiceNumber (the index is partial)", async () => {
    const { invoiceNumber, ...oldRow } = storedInvoice();

    await InvoiceModel.collection.insertMany([{ ...oldRow }, { ...oldRow }]);

    expect(await InvoiceModel.countDocuments()).toBe(2);
    const res = await request(app).post("/api/v2/invoices").send(validInvoice());
    expect(res.status).toBe(201);
  });
});

describe("DELETE /api/v2/invoices/:id", () => {
  let invoice;

  beforeEach(async () => {
    invoice = await InvoiceModel.create(storedInvoice());
  });

  it("deletes the invoice and answers it", async () => {
    const res = await request(app).delete(`/api/v2/invoices/${invoice._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.INVOICE_DELETED);
    expect(res.body.data._id).toBe(invoice._id.toString());
    expect(res.body.data.dateOfService).toBe("2026-03-15");
    expect(await InvoiceModel.countDocuments()).toBe(0);
  });

  it("answers 404 for an id that is not stored", async () => {
    const res = await request(app).delete(`/api/v2/invoices/${unusedId()}`);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      message: RESPONSE_MESSAGES.INVOICE_NOT_FOUND,
      statusCode: 404,
    });
  });

  it("a malformed id answers 400", async () => {
    const res = await request(app).delete("/api/v2/invoices/not-an-id");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.INVALID_ID);
  });
});
