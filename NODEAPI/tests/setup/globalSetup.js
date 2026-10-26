/**
 * Jest global setup
 * Starts one in-memory MongoDB server for the whole run and hands its URI to
 * the test workers through MONGO_TEST_URI. Tests never read .env or MONGO_URL.
 */

const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  globalThis.__MONGOD__ = mongod;
  process.env.MONGO_TEST_URI = mongod.getUri();
};
