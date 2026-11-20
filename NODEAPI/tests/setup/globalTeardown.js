/**
 * Jest global teardown
 * Stops the in-memory MongoDB server and the loopback JWKS server started by globalSetup.
 */

module.exports = async () => {
  if (globalThis.__MONGOD__) {
    await globalThis.__MONGOD__.stop();
  }
  if (globalThis.__JWKS_SERVER__) {
    await new Promise((resolve) => globalThis.__JWKS_SERVER__.close(resolve));
  }
};
