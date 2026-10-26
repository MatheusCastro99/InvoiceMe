/**
 * Characterization tests: /api/v1/customers (list, get, create, update, delete).
 * Known bugs (#69, #70) are pinned as test.failing that asserts the correct behavior.
 */

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const CustomerModel = require("../models/customerModel");
const { RESPONSE_MESSAGES } = require("../utils/constants");

const validCustomer = (overrides = {}) => ({
  companyName: "Acme Plumbing",
  phoneNumber: "5551234567",
  companyEmail: "office@acme.example",
  contactName: "Dana Smith",
  streetAddress: "12 Main St",
  cityAddress: "Springfield",
  stateAddress: "CA",
  zipAddress: "90210",
  ...overrides,
});

const unusedId = () => new mongoose.Types.ObjectId().toString();

describe("GET /api/v1/customers", () => {
  describe("with 25 customers", () => {
    beforeEach(async () => {
      const base = Date.parse("2026-01-01T00:00:00Z");
      await CustomerModel.insertMany(
        Array.from({ length: 25 }, (_, i) => ({
          companyName: `Customer ${i + 1}`,
          phoneNumber: `555000${String(i).padStart(4, "0")}`,
          createdAt: new Date(base + i * 1000),
        }))
      );
    });

    it("answers page 1 with 20 items by default", async () => {
      const res = await request(app).get("/api/v1/customers");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(20);
      expect(res.body.pagination).toEqual({ page: 1, limit: 20, total: 25, pages: 2 });
    });

    it("honours the page and limit parameters", async () => {
      const res = await request(app).get("/api/v1/customers?page=2&limit=10");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(10);
      expect(res.body.pagination).toEqual({ page: 2, limit: 10, total: 25, pages: 3 });
    });

    it("answers the remaining items on the last page", async () => {
      const res = await request(app).get("/api/v1/customers?page=2");

      expect(res.body.data).toHaveLength(5);
    });

    test.failing("#70: limit=1000 is capped at 100", async () => {
      const res = await request(app).get("/api/v1/customers?limit=1000");

      expect(res.body.pagination.limit).toBe(100);
    });
  });

  describe("ordering", () => {
    beforeEach(async () => {
      await CustomerModel.insertMany([
        { companyName: "Middle", phoneNumber: "5550000002", createdAt: new Date("2026-01-02T00:00:00Z") },
        { companyName: "Oldest", phoneNumber: "5550000001", createdAt: new Date("2026-01-01T00:00:00Z") },
        { companyName: "Newest", phoneNumber: "5550000003", createdAt: new Date("2026-01-03T00:00:00Z") },
      ]);
    });

    it("lists the newest customer first", async () => {
      const res = await request(app).get("/api/v1/customers");

      expect(res.body.data.map((c) => c.companyName)).toEqual(["Newest", "Middle", "Oldest"]);
    });
  });

  it("answers an empty list when there are no customers", async () => {
    const res = await request(app).get("/api/v1/customers");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination).toEqual({ page: 1, limit: 20, total: 0, pages: 0 });
  });
});

describe("GET /api/v1/customers/:id", () => {
  let customer;

  beforeEach(async () => {
    customer = await CustomerModel.create(validCustomer());
  });

  it("answers the customer", async () => {
    const res = await request(app).get(`/api/v1/customers/${customer._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      _id: customer._id.toString(),
      companyName: "Acme Plumbing",
      phoneNumber: "5551234567",
    });
  });

  it("answers 404 for an id that is not stored", async () => {
    const res = await request(app).get(`/api/v1/customers/${unusedId()}`);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      message: RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND,
      statusCode: 404,
    });
  });

  test.failing("#69: a malformed id answers 400", async () => {
    const res = await request(app).get("/api/v1/customers/not-an-id");

    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/customers", () => {
  it("creates a customer", async () => {
    const res = await request(app).post("/api/v1/customers").send(validCustomer());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.CUSTOMER_CREATED);
    expect(res.body.data).toMatchObject(validCustomer());
    expect(res.body.data._id).toBeDefined();
    expect(await CustomerModel.countDocuments()).toBe(1);
  });

  it("creates a customer with only the required fields", async () => {
    const res = await request(app)
      .post("/api/v1/customers")
      .send({ companyName: "Bare Minimum", phoneNumber: "(555) 123-4567" });

    expect(res.status).toBe(201);
  });

  describe("validation", () => {
    it.each([
      ["a missing companyName", { companyName: undefined }, "Company name is required"],
      ["a companyName with invalid characters", { companyName: "Acme @ Plumbing!" }, "Invalid company name format"],
      ["a companyName over 100 characters", { companyName: "a".repeat(101) }, "Invalid company name format"],
      ["a missing phoneNumber", { phoneNumber: undefined }, "Phone number is required"],
      ["a badly formatted phoneNumber", { phoneNumber: "12345" }, "Invalid phone number format"],
      ["a badly formatted companyEmail", { companyEmail: "not-an-email" }, "Invalid email format"],
      ["a badly formatted zipAddress", { zipAddress: "9021" }, "Invalid zip code format"],
      ["a lowercase stateAddress", { stateAddress: "ca" }, "Invalid state abbreviation (use 2-letter code)"],
      ["a 3-letter stateAddress", { stateAddress: "CAL" }, "Invalid state abbreviation (use 2-letter code)"],
    ])("answers 400 for %s", async (_name, overrides, message) => {
      const res = await request(app)
        .post("/api/v1/customers")
        .send(validCustomer(overrides));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toContain(message);
      expect(res.body.message).toContain(message);
      expect(await CustomerModel.countDocuments()).toBe(0);
    });

    it("lists every failing rule", async () => {
      const res = await request(app).post("/api/v1/customers").send({});

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(["Company name is required", "Phone number is required"]);
      expect(res.body.message).toBe("Company name is required; Phone number is required");
    });
  });

  describe("with a customer already stored", () => {
    beforeEach(async () => {
      await CustomerModel.create(validCustomer());
    });

    it("answers 409 for a duplicate phone number", async () => {
      const res = await request(app)
        .post("/api/v1/customers")
        .send(validCustomer({ companyName: "Another Co" }));

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        success: false,
        message: RESPONSE_MESSAGES.DUPLICATE_CUSTOMER,
        statusCode: 409,
      });
    });

    test.failing("#70: a duplicate phone number in another format answers 409", async () => {
      const res = await request(app)
        .post("/api/v1/customers")
        .send(validCustomer({ companyName: "Another Co", phoneNumber: "(555) 123-4567" }));

      expect(res.status).toBe(409);
    });
  });

  test.failing("#69: a companyEmail over 150 characters answers 400", async () => {
    const res = await request(app)
      .post("/api/v1/customers")
      .send(validCustomer({ companyEmail: `${"a".repeat(145)}@x.com` }));

    expect(res.status).toBe(400);
  });

  test.failing("#69: a numeric companyName answers 400", async () => {
    const res = await request(app)
      .post("/api/v1/customers")
      .send(validCustomer({ companyName: 123 }));

    expect(res.status).toBe(400);
  });

  test.failing("#69: a numeric phoneNumber answers 400", async () => {
    const res = await request(app)
      .post("/api/v1/customers")
      .send(validCustomer({ phoneNumber: 5551234567 }));

    expect(res.status).toBe(400);
  });
});

describe("PUT /api/v1/customers/:id", () => {
  let customer;
  let other;

  beforeEach(async () => {
    customer = await CustomerModel.create(validCustomer());
    other = await CustomerModel.create(
      validCustomer({ companyName: "Other Co", phoneNumber: "5559876543" })
    );
  });

  it("updates the customer and answers the new document", async () => {
    const res = await request(app)
      .put(`/api/v1/customers/${customer._id}`)
      .send(validCustomer({ companyName: "Acme Renamed", phoneNumber: "5550001111" }));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.CUSTOMER_UPDATED);
    expect(res.body.data).toMatchObject({
      _id: customer._id.toString(),
      companyName: "Acme Renamed",
      phoneNumber: "5550001111",
    });

    const stored = await CustomerModel.findById(customer._id);
    expect(stored.companyName).toBe("Acme Renamed");
  });

  it("accepts the customer's own phone number unchanged", async () => {
    const res = await request(app)
      .put(`/api/v1/customers/${customer._id}`)
      .send(validCustomer({ companyName: "Acme Renamed" }));

    expect(res.status).toBe(200);
    expect(res.body.data.phoneNumber).toBe("5551234567");
  });

  it("answers 404 for an id that is not stored", async () => {
    const res = await request(app)
      .put(`/api/v1/customers/${unusedId()}`)
      .send(validCustomer());

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND);
  });

  it("answers 400 when the body fails validation", async () => {
    const res = await request(app)
      .put(`/api/v1/customers/${customer._id}`)
      .send({ companyName: "Acme Renamed" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(["Phone number is required"]);
  });

  it("answers 409 when the phone number belongs to another customer", async () => {
    const res = await request(app)
      .put(`/api/v1/customers/${customer._id}`)
      .send(validCustomer({ phoneNumber: other.phoneNumber }));

    expect(res.status).toBe(409);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.DUPLICATE_CUSTOMER);
  });

  test.failing("#70: a phone number of another customer in another format answers 409", async () => {
    const res = await request(app)
      .put(`/api/v1/customers/${other._id}`)
      .send(validCustomer({ companyName: "Other Co", phoneNumber: "(555) 123-4567" }));

    expect(res.status).toBe(409);
  });

  test.failing("#69: a malformed id answers 400", async () => {
    const res = await request(app)
      .put("/api/v1/customers/not-an-id")
      .send(validCustomer());

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/v1/customers/:id", () => {
  let customer;

  beforeEach(async () => {
    customer = await CustomerModel.create(validCustomer());
  });

  it("deletes the customer and answers it", async () => {
    const res = await request(app).delete(`/api/v1/customers/${customer._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.CUSTOMER_DELETED);
    expect(res.body.data._id).toBe(customer._id.toString());
    expect(await CustomerModel.countDocuments()).toBe(0);
  });

  it("answers 404 for an id that is not stored", async () => {
    const res = await request(app).delete(`/api/v1/customers/${unusedId()}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.CUSTOMER_NOT_FOUND);
  });

  test.failing("#69: a malformed id answers 400", async () => {
    const res = await request(app).delete("/api/v1/customers/not-an-id");

    expect(res.status).toBe(400);
  });
});
