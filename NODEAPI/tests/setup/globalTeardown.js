/**
 * Jest global teardown
 * Stops the in-memory MongoDB server started by globalSetup.
 */

module.exports = async () => {
  if (globalThis.__MONGOD__) {
    await globalThis.__MONGOD__.stop();
  }
};
