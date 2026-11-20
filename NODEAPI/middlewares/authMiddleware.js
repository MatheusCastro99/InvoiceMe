/**
 * Auth Middleware
 * Requires a signed-in user on every request it guards (ADR-014).
 * Verifies the Microsoft Entra External ID access token in `Authorization: Bearer <token>`:
 * signature (RS256, keys from the tenant's JWKS), issuer, audience, expiry, the API's scope in `scp`,
 * and a non-empty `oid`. On success sets `req.user = { id: <oid> }`.
 * Every refusal is a 401 with RESPONSE_MESSAGES.SIGN_IN_REQUIRED; a missing configuration or an
 * unreachable key set is a 500. No token, header or claim value goes into a message or a log.
 * Reads its configuration per request and fetches keys lazily, so loading it has no side effects.
 * API v2.0+
 */

const asyncHandler = require("express-async-handler");
const { jwtVerify, createRemoteJWKSet, errors: joseErrors } = require("jose");
const { UnauthorizedError, InternalServerError } = require("../utils/errors");
const { RESPONSE_MESSAGES } = require("../utils/constants");

const REQUIRED_VARIABLES = ["ENTRA_ISSUER", "ENTRA_JWKS_URI", "ENTRA_API_AUDIENCE", "ENTRA_API_SCOPE"];
const BEARER_PATTERN = /^Bearer ([^\s]+)$/i;
const CLOCK_TOLERANCE_SECONDS = 60;

// One remote key set per URI: jose caches the fetched keys inside it
const keySets = new Map();

const getKeySet = (uri) => {
  if (!keySets.has(uri)) {
    keySets.set(uri, createRemoteJWKSet(new URL(uri)));
  }
  return keySets.get(uri);
};

// A failure of the key fetch is the server's problem, not the caller's: timeout, bad answer, network
const isKeyFetchFailure = (err) =>
  !(err instanceof joseErrors.JOSEError) ||
  err.code === "ERR_JWKS_TIMEOUT" ||
  err.code === "ERR_JWKS_INVALID" ||
  err.code === "ERR_JOSE_GENERIC";

const authMiddleware = asyncHandler(async (req, res, next) => {
  const missing = REQUIRED_VARIABLES.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    // Variable names only, never values
    console.error(`AUTH CONFIG: missing environment variables: ${missing.join(", ")}`);
    throw new InternalServerError(RESPONSE_MESSAGES.SERVER_ERROR);
  }

  const match = BEARER_PATTERN.exec(req.headers.authorization || "");
  if (!match) {
    throw new UnauthorizedError(RESPONSE_MESSAGES.SIGN_IN_REQUIRED);
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(match[1], getKeySet(process.env.ENTRA_JWKS_URI), {
      issuer: process.env.ENTRA_ISSUER,
      audience: process.env.ENTRA_API_AUDIENCE,
      algorithms: ["RS256"],
      requiredClaims: ["exp"],
      clockTolerance: CLOCK_TOLERANCE_SECONDS,
    }));
  } catch (err) {
    if (isKeyFetchFailure(err)) {
      // The error's name and code only: its message may carry the key set's address or a response
      console.error(`AUTH: signing keys unavailable: ${err.code || err.name}`);
      throw new InternalServerError(RESPONSE_MESSAGES.SERVER_ERROR);
    }
    throw new UnauthorizedError(RESPONSE_MESSAGES.SIGN_IN_REQUIRED);
  }

  // `scp` is a space-separated list of the scope names the user granted to this API
  const scopes = typeof payload.scp === "string" ? payload.scp.split(" ") : [];
  const hasScope = scopes.includes(process.env.ENTRA_API_SCOPE);
  const hasUserId = typeof payload.oid === "string" && payload.oid.length > 0;
  if (!hasScope || !hasUserId) {
    throw new UnauthorizedError(RESPONSE_MESSAGES.SIGN_IN_REQUIRED);
  }

  req.user = { id: payload.oid };
  next();
});

module.exports = authMiddleware;
