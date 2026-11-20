/**
 * Tests: the local dev signer (#172). A token from startDevSigner() passes the unchanged sign-in
 * check on a v2 route when the API reads the signer's ENTRA_* values, and the signer listens on
 * 127.0.0.1 only. A token with the wrong audience is still refused: the signer adds no bypass.
 */

const request = require("supertest");
const { SignJWT, generateKeyPair } = require("jose");
const app = require("../app");
const { startDevSigner } = require("../scripts/devAuth");

const ENTRA_NAMES = ["ENTRA_ISSUER", "ENTRA_JWKS_URI", "ENTRA_API_AUDIENCE", "ENTRA_API_SCOPE"];

describe("dev signer (npm run dev:auth)", () => {
  let signer;
  const savedEnv = {};

  beforeAll(async () => {
    signer = await startDevSigner({ port: 0 });
    ENTRA_NAMES.forEach((name) => {
      savedEnv[name] = process.env[name];
      process.env[name] = signer.env[name];
    });
  });

  afterAll(async () => {
    ENTRA_NAMES.forEach((name) => {
      process.env[name] = savedEnv[name];
    });
    await signer.close();
  });

  it("serves its keys on 127.0.0.1 only", () => {
    expect(signer.host).toBe("127.0.0.1");
    expect(new URL(signer.env.ENTRA_JWKS_URI).hostname).toBe("127.0.0.1");
    expect(signer.env.ENTRA_JWKS_URI).toBe(`http://127.0.0.1:${signer.port}/keys`);
  });

  it("answers a token the unchanged sign-in check accepts on a v2 route", async () => {
    const res = await request(app).get("/api/v2/customers").set("Authorization", `Bearer ${signer.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("does not open the API to a request with no token", async () => {
    const res = await request(app).get("/api/v2/customers");

    expect(res.status).toBe(401);
  });

  it("does not open the API to a token signed by another key", async () => {
    const { privateKey } = await generateKeyPair("RS256");
    const forged = await new SignJWT({ oid: "someone", scp: signer.env.ENTRA_API_SCOPE })
      .setProtectedHeader({ alg: "RS256", kid: "dev-signer-key" })
      .setIssuer(signer.env.ENTRA_ISSUER)
      .setAudience(signer.env.ENTRA_API_AUDIENCE)
      .setExpirationTime("1h")
      .sign(privateKey);

    const res = await request(app).get("/api/v2/customers").set("Authorization", `Bearer ${forged}`);

    expect(res.status).toBe(401);
  });
});
