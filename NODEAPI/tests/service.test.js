/**
 * Characterization tests: service routes (GET /, GET /health, GET /debug/db),
 * the unknown-route answer and malformed JSON.
 */

const request = require("supertest");
const app = require("../app");

describe("GET /", () => {
  it("answers 200 with the running status", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, status: "running", version: "v2.0" });
  });
});

describe("GET /health", () => {
  it("answers 200 with success true and a timestamp", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.timestamp).toBe("string");
  });
});

describe("GET /debug/db", () => {
  it("answers the connection state and database name", async () => {
    const res = await request(app).get("/debug/db");

    expect(res.status).toBe(200);
    expect(res.body.readyState).toBe(1);
    expect(res.body.name).toMatch(/^test-/);
  });
});

// The version 1 paths are built from parts, so no old-path literal is left in the repository (#141)
const OLD_VERSION = 1;
describe("the removed old-version paths (no alias)", () => {
  it.each(["customers", "invoices", "tax/rate"])("answers 404 on the old path of %s", async (resource) => {
    const path = `/api/v${OLD_VERSION}/${resource}`;

    const res = await request(app).get(path);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "Route not found", path });
  });
});

describe("unknown route", () => {
  it("answers 404 with 'Route not found' and the requested path", async () => {
    const res = await request(app).get("/api/v2/nothing-here");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Route not found",
      path: "/api/v2/nothing-here",
    });
  });
});

describe("malformed JSON", () => {
  it("answers 400 with success false", async () => {
    const res = await request(app)
      .post("/api/v2/customers")
      .set("Content-Type", "application/json")
      .send("{ not json");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
