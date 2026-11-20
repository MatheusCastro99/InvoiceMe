/**
 * Unit tests: authMiddleware (ADR-014) with a fake req and next. Tokens are signed with the key
 * globalSetup generated and verified against its loopback JWKS: no call to Entra.
 */

const http = require("http");
const { generateKeyPair, SignJWT, importJWK } = require("jose");
const authMiddleware = require("../middlewares/authMiddleware");
const { UnauthorizedError, InternalServerError } = require("../utils/errors");
const { RESPONSE_MESSAGES } = require("../utils/constants");
const { signTestToken, unsignedTestToken, TEST_OID } = require("./setup/tokenHelper");

const nowSeconds = () => Math.floor(Date.now() / 1000);

// Runs the middleware once and answers what it passed to next
const run = async (authorization) => {
  const req = { headers: authorization === undefined ? {} : { authorization }, method: "GET", path: "/x" };
  const next = jest.fn();
  await authMiddleware(req, {}, next);
  expect(next).toHaveBeenCalledTimes(1);
  return { req, error: next.mock.calls[0][0] };
};

const expectSignInRequired = (error) => {
  expect(error).toBeInstanceOf(UnauthorizedError);
  expect(error.statusCode).toBe(401);
  expect(error.message).toBe(RESPONSE_MESSAGES.SIGN_IN_REQUIRED);
};

const expectServerError = (error) => {
  expect(error).toBeInstanceOf(InternalServerError);
  expect(error.statusCode).toBe(500);
  expect(error.message).toBe(RESPONSE_MESSAGES.SERVER_ERROR);
};

const loggedText = () => console.error.mock.calls.flat().join(" ");

// A loopback server that answers every request with the given status and body
const startServer = async (status, body) => {
  const server = http.createServer((req, res) => {
    res.statusCode = status;
    res.end(body);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, uri: `http://127.0.0.1:${server.address().port}/keys` };
};

const stopServer = (server) => new Promise((resolve) => server.close(resolve));

describe("authMiddleware", () => {
  const savedEnv = {};
  const variables = ["ENTRA_ISSUER", "ENTRA_JWKS_URI", "ENTRA_API_AUDIENCE", "ENTRA_API_SCOPE"];

  beforeEach(() => {
    variables.forEach((name) => (savedEnv[name] = process.env[name]));
    console.error.mockClear();
  });

  afterEach(() => {
    variables.forEach((name) => (process.env[name] = savedEnv[name]));
  });

  describe("a valid token", () => {
    it("passes and sets req.user.id to the oid claim", async () => {
      const { req, error } = await run(`Bearer ${await signTestToken()}`);

      expect(error).toBeUndefined();
      expect(req.user).toEqual({ id: TEST_OID });
    });

    it("accepts the scheme in any letter case, and the scope among several", async () => {
      const token = await signTestToken({ scp: `other.read ${process.env.ENTRA_API_SCOPE} other.write` });

      const { req, error } = await run(`bearer ${token}`);

      expect(error).toBeUndefined();
      expect(req.user.id).toBe(TEST_OID);
    });

    it("accepts a token that expired less than the 60 s clock tolerance ago", async () => {
      const token = await signTestToken({}, { expiresIn: nowSeconds() - 30 });

      const { error } = await run(`Bearer ${token}`);

      expect(error).toBeUndefined();
    });
  });

  describe("a malformed or missing header", () => {
    it.each([
      ["no Authorization header", undefined],
      ["an empty header", ""],
      ["a scheme other than Bearer", "Basic dXNlcjpwYXNz"],
      ["Bearer without a token", "Bearer"],
      ["Bearer with an empty token", "Bearer "],
      ["a bare token without the scheme", "abc.def.ghi"],
      ["a token with extra parts", "Bearer abc def"],
      ["a token that is not a JWT", "Bearer not-a-jwt"],
      ["a token with three empty parts", "Bearer .."],
      ["a token with undecodable parts", "Bearer !!!.@@@.###"],
    ])("answers 401 for %s", async (label, header) => {
      const { req, error } = await run(header);

      expectSignInRequired(error);
      expect(req.user).toBeUndefined();
    });
  });

  describe("a token that fails verification", () => {
    it("answers 401 for a signature made with another key", async () => {
      const { privateKey } = await generateKeyPair("RS256");
      const token = await signTestToken({}, { key: privateKey });

      expectSignInRequired((await run(`Bearer ${token}`)).error);
    });

    it("answers 401 for a tampered payload", async () => {
      const [header, , signature] = (await signTestToken()).split(".");
      const forgedPayload = Buffer.from(
        JSON.stringify({ oid: "someone-else", scp: process.env.ENTRA_API_SCOPE }),
      ).toString("base64url");

      expectSignInRequired((await run(`Bearer ${header}.${forgedPayload}.${signature}`)).error);
    });

    it("answers 401 for an expired token", async () => {
      const token = await signTestToken({}, { expiresIn: nowSeconds() - 3600 });

      expectSignInRequired((await run(`Bearer ${token}`)).error);
    });

    it("answers 401 for a token that expired just past the clock tolerance", async () => {
      const token = await signTestToken({}, { expiresIn: nowSeconds() - 120 });

      expectSignInRequired((await run(`Bearer ${token}`)).error);
    });

    it("answers 401 for a token with no expiry", async () => {
      const key = await importJWK(JSON.parse(process.env.TEST_AUTH_PRIVATE_JWK), "RS256");
      const token = await new SignJWT({
        oid: TEST_OID,
        scp: process.env.ENTRA_API_SCOPE,
        iss: process.env.ENTRA_ISSUER,
        aud: process.env.ENTRA_API_AUDIENCE,
      })
        .setProtectedHeader({ alg: "RS256", kid: "test-key-1" })
        .sign(key);

      expectSignInRequired((await run(`Bearer ${token}`)).error);
    });

    it("answers 401 for a wrong issuer", async () => {
      const token = await signTestToken({ iss: "https://other-tenant.example.test/other/v2.0" });

      expectSignInRequired((await run(`Bearer ${token}`)).error);
    });

    it("answers 401 for a wrong audience", async () => {
      const token = await signTestToken({ aud: "another-api-client-id" });

      expectSignInRequired((await run(`Bearer ${token}`)).error);
    });

    it("answers 401 for a token with no audience", async () => {
      const token = await signTestToken({ aud: undefined });

      expectSignInRequired((await run(`Bearer ${token}`)).error);
    });

    it("answers 401 for an unsigned token (alg none)", async () => {
      expectSignInRequired((await run(`Bearer ${unsignedTestToken()}`)).error);
    });

    it("answers 401 for an HS256 token", async () => {
      const secret = new TextEncoder().encode("x".repeat(64));
      const token = await signTestToken({}, { alg: "HS256", key: secret });

      expectSignInRequired((await run(`Bearer ${token}`)).error);
    });
  });

  describe("a verified token without what the API needs", () => {
    it.each([
      ["no scp claim", { scp: undefined }],
      ["an empty scp claim", { scp: "" }],
      ["another scope only", { scp: "other.read" }],
      ["a scope that only starts with the API scope", { scp: "test.access.more" }],
      ["an scp that is not a string", { scp: ["test.access"] }],
      ["no oid claim", { oid: undefined }],
      ["an empty oid claim", { oid: "" }],
      ["an oid that is not a string", { oid: 12345 }],
    ])("answers 401 for %s", async (label, claims) => {
      const token = await signTestToken(claims);

      const { req, error } = await run(`Bearer ${token}`);

      expectSignInRequired(error);
      expect(req.user).toBeUndefined();
    });
  });

  describe("missing configuration", () => {
    it.each(variables)("answers 500 and logs the name when %s is missing", async (name) => {
      const token = await signTestToken();
      delete process.env[name];

      const { error } = await run(`Bearer ${token}`);

      expectServerError(error);
      expect(loggedText()).toContain(name);
      expect(loggedText()).not.toContain(token);
    });

    it("names every missing variable", async () => {
      variables.forEach((name) => delete process.env[name]);

      const { error } = await run(undefined);

      expectServerError(error);
      variables.forEach((name) => expect(loggedText()).toContain(name));
    });
  });

  describe("an unavailable key set", () => {
    it("answers 500, not 401, when nothing listens at the key set's address", async () => {
      const { server, uri } = await startServer(200, "{}");
      await stopServer(server);
      process.env.ENTRA_JWKS_URI = uri;
      const token = await signTestToken();

      const { error } = await run(`Bearer ${token}`);

      expectServerError(error);
      expect(loggedText()).not.toContain(token);
    });

    it("answers 500 when the key set's server answers an error", async () => {
      const { server, uri } = await startServer(503, "unavailable");
      process.env.ENTRA_JWKS_URI = uri;
      try {
        expectServerError((await run(`Bearer ${await signTestToken()}`)).error);
      } finally {
        await stopServer(server);
      }
    });

    it("answers 500 when the key set is malformed", async () => {
      const { server, uri } = await startServer(200, JSON.stringify({ nope: true }));
      process.env.ENTRA_JWKS_URI = uri;
      try {
        expectServerError((await run(`Bearer ${await signTestToken()}`)).error);
      } finally {
        await stopServer(server);
      }
    });
  });

  it("puts no token or claim value in an error message or a log", async () => {
    const token = await signTestToken({ aud: "another-api-client-id", oid: "secret-user-id" });

    const { error } = await run(`Bearer ${token}`);

    expect(error.message).toBe(RESPONSE_MESSAGES.SIGN_IN_REQUIRED);
    expect(loggedText()).not.toMatch(/secret-user-id|another-api-client-id/);
    expect(loggedText()).not.toContain(token);
  });
});
