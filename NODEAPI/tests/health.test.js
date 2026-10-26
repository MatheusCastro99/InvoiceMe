/**
 * Smoke test for the test harness: GET /health through the Express app.
 */

const request = require("supertest");
const app = require("../app");

describe("GET /health", () => {
  it("answers 200 with success true", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
