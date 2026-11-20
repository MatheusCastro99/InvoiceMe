/**
 * Jest global setup
 * Starts one in-memory MongoDB server for the whole run and hands its URI to
 * the test workers through MONGO_TEST_URI. Tests never read .env or MONGO_URL.
 * Also starts the sign-in test fixtures (ADR-014): an RSA key pair generated here, its public key served
 * as a JWKS from a loopback http server, and the matching ENTRA_* values. The tests never call Entra.
 * The private key goes to the workers through TEST_AUTH_PRIVATE_JWK, and a valid token (12 h) through
 * TEST_AUTH_TOKEN, which tests/setup/authedRequest.js sends.
 */

const http = require("http");
const { generateKeyPair, exportJWK } = require("jose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { signTestToken } = require("./tokenHelper");

const TEST_KEY_ID = "test-key-1";

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  globalThis.__MONGOD__ = mongod;
  process.env.MONGO_TEST_URI = mongod.getUri();

  const { publicKey, privateKey } = await generateKeyPair("RS256", { extractable: true });
  const publicJwk = { ...(await exportJWK(publicKey)), kid: TEST_KEY_ID, alg: "RS256", use: "sig" };
  const privateJwk = { ...(await exportJWK(privateKey)), kid: TEST_KEY_ID, alg: "RS256", use: "sig" };

  const jwksServer = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ keys: [publicJwk] }));
  });
  await new Promise((resolve) => jwksServer.listen(0, "127.0.0.1", resolve));
  globalThis.__JWKS_SERVER__ = jwksServer;

  process.env.TEST_AUTH_PRIVATE_JWK = JSON.stringify(privateJwk);
  process.env.ENTRA_JWKS_URI = `http://127.0.0.1:${jwksServer.address().port}/keys`;
  process.env.ENTRA_ISSUER = "https://test-tenant.example.test/test-tenant/v2.0";
  process.env.ENTRA_API_AUDIENCE = "test-api-client-id";
  process.env.ENTRA_API_SCOPE = "test.access";
  process.env.TEST_AUTH_TOKEN = await signTestToken({}, { expiresIn: "12h" });
};
