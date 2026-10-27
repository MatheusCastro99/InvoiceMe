/**
 * Characterization tests: CORS policy (allowed origin, no origin, disallowed origin).
 */

const request = require("supertest");
const app = require("../app");
const { RESPONSE_MESSAGES } = require("../utils/constants");

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

  it("a disallowed origin answers 403 and the body does not echo the origin", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    const res = await request(app)
      .get("/health")
      .set("Origin", "http://not-allowed.example");

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      message: RESPONSE_MESSAGES.ORIGIN_NOT_ALLOWED,
      statusCode: 403,
    });
    expect(JSON.stringify(res.body)).not.toContain("not-allowed.example");
    expect(warn).toHaveBeenCalledWith("CORS: origin not allowed:", "\"http://not-allowed.example\"");
    warn.mockRestore();
  });
});
