/**
 * Jest per-file setup
 * Connects Mongoose to this worker's own database on the in-memory server,
 * empties every collection after each test, and disconnects after the file.
 * console.error is silenced (the error middleware logs every error answer).
 */

const os = require("os");
const mongoose = require("mongoose");

let errorSpy;

beforeAll(async () => {
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  await mongoose.connect(process.env.MONGO_TEST_URI, {
    // The driver loads `os` with a dynamic import(), which Jest's CommonJS sandbox rejects
    // (the handshake then fails). Handing it over directly avoids the import.
    runtimeAdapters: { os },
    dbName: `test-${process.env.JEST_WORKER_ID}`,
  });
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  errorSpy.mockRestore();
});
