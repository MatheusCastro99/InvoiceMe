/**
 * Test token helper
 * Signs Entra-style access tokens with the key globalSetup generated, so the tests need no
 * call to Entra. `signTestToken()` is a valid token; `claims` overrides claims (a value of
 * `undefined` removes one) and `options` changes how it is signed.
 */

const { SignJWT, importJWK, base64url } = require("jose");

const TEST_OID = "00000000-0000-4000-8000-000000000001";

const validClaims = () => ({
  oid: TEST_OID,
  scp: process.env.ENTRA_API_SCOPE,
  iss: process.env.ENTRA_ISSUER,
  aud: process.env.ENTRA_API_AUDIENCE,
});

/**
 * @param {object} [claims] claim overrides, `undefined` removes a claim
 * @param {object} [options]
 * @param {string} [options.alg] signing algorithm (default RS256)
 * @param {CryptoKey|Uint8Array} [options.key] signing key (default: the test key the JWKS serves)
 * @param {string} [options.expiresIn] jose time span (default "1h")
 */
const signTestToken = async (claims = {}, { alg = "RS256", key, expiresIn = "1h" } = {}) => {
  const merged = { ...validClaims(), ...claims };
  Object.keys(merged).forEach((name) => merged[name] === undefined && delete merged[name]);

  const signingKey = key || (await importJWK(JSON.parse(process.env.TEST_AUTH_PRIVATE_JWK), "RS256"));
  return new SignJWT(merged)
    .setProtectedHeader({ alg, kid: "test-key-1" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(signingKey);
};

// An unsigned token (`alg: none`), built by hand because jose refuses to sign one
const unsignedTestToken = (claims = {}) => {
  const header = base64url.encode(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = base64url.encode(JSON.stringify({ ...validClaims(), ...claims, exp: Math.floor(Date.now() / 1000) + 3600 }));
  return `${header}.${payload}.`;
};

// The header every test sends to pass the sign-in check
const authHeader = async (claims, options) => `Bearer ${await signTestToken(claims, options)}`;

module.exports = { signTestToken, unsignedTestToken, authHeader, TEST_OID };
