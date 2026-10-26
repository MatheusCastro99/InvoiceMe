/**
 * Characterization tests: CORS policy (allowed origin, no origin, disallowed origin).
 */

const request = require("supertest");
const app = require("../app");

describe("CORS", () => {
  it("allows the local frontend origin, with credentials", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:5173");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("answers a request with no Origin and sends no allow-origin header", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test.failing("#69: a disallowed origin answers 403", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://not-allowed.example");

    expect(res.status).toBe(403);
  });
});
