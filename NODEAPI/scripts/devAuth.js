/**
 * Local dev signer (#172, ADR-014)
 * Lets you run the app on your machine with no Microsoft Entra tenant. It generates an RS256 key in
 * memory, serves its public key as a JWKS on 127.0.0.1 only, and signs one access token (8 h) that the
 * unchanged sign-in check (middlewares/authMiddleware.js) accepts. The API code has no dev path: this
 * script only supplies the values the API already reads (the four ENTRA_* variables).
 *
 * Run it with `npm run dev:auth`. It listens on a fixed port, prints the four ENTRA_* lines for
 * NODEAPI/.env and VITE_DEV_AUTH_TOKEN=<token> for FRONTEND/.env.development.local, and stays up
 * until Ctrl+C: the API fetches the key from it. The key dies with the process, so a restart means
 * new values. Never run it where the API is reachable from other machines.
 * startDevSigner() is exported for the tests; only the command line prints and listens on port 3999.
 * API v2.1+
 */

const http = require("http");
const { generateKeyPair, exportJWK, SignJWT } = require("jose");

const DEV_PORT = 3999;
const DEV_HOST = "127.0.0.1";
const DEV_KEY_ID = "dev-signer-key";
const DEV_USER_ID = "00000000-0000-4000-8000-0000000d0001";
const DEV_AUDIENCE = "dev-api-client-id";
const DEV_SCOPE = "dev.access";
const TOKEN_LIFETIME = "8h";

/**
 * Starts the signer.
 * @param {object} [options]
 * @param {number} [options.port] port to listen on (0 picks a free one; default 3999)
 * @returns {Promise<{ env: object, token: string, host: string, port: number, close: () => Promise<void> }>}
 *   `env` holds the four ENTRA_* values for the API.
 */
const startDevSigner = async ({ port = DEV_PORT } = {}) => {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const publicJwk = { ...(await exportJWK(publicKey)), kid: DEV_KEY_ID, alg: "RS256", use: "sig" };

  const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ keys: [publicJwk] }));
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, DEV_HOST, resolve);
  });

  const listeningPort = server.address().port;
  const origin = `http://${DEV_HOST}:${listeningPort}`;
  const env = {
    ENTRA_ISSUER: `${origin}/dev-tenant/v2.0`,
    ENTRA_JWKS_URI: `${origin}/keys`,
    ENTRA_API_AUDIENCE: DEV_AUDIENCE,
    ENTRA_API_SCOPE: DEV_SCOPE,
  };

  const token = await new SignJWT({ oid: DEV_USER_ID, scp: DEV_SCOPE, iss: env.ENTRA_ISSUER, aud: DEV_AUDIENCE })
    .setProtectedHeader({ alg: "RS256", kid: DEV_KEY_ID })
    .setIssuedAt()
    .setExpirationTime(TOKEN_LIFETIME)
    .sign(privateKey);

  const close = () => new Promise((resolve) => server.close(() => resolve()));
  return { env, token, host: server.address().address, port: listeningPort, close };
};

const main = async () => {
  const signer = await startDevSigner();
  console.log("Dev signer running on 127.0.0.1 (Ctrl+C to stop). The key and the token die with this process.\n");
  console.log("Paste into NODEAPI/.env:");
  Object.entries(signer.env).forEach(([name, value]) => console.log(`${name}=${value}`));
  console.log("\nPaste into FRONTEND/.env.development.local:");
  console.log(`VITE_DEV_AUTH_TOKEN=${signer.token}`);
  console.log("\nThe token is valid for 8 hours. Restart the API after changing NODEAPI/.env.");

  const stop = () => signer.close().then(() => process.exit(0));
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err.code === "EADDRINUSE" ? `Port ${DEV_PORT} is already in use: is the dev signer already running?` : err.message);
    process.exit(1);
  });
}

module.exports = { startDevSigner };
