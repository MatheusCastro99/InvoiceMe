/**
 * Isolation test for the test harness: a document written in one test must be
 * gone in the next, because setupFile.js empties every collection after each test.
 * The two tests depend on running in order.
 */

const CustomerModel = require("../models/customerModel");

describe("database isolation", () => {
  it("writes a document", async () => {
    await CustomerModel.collection.insertOne({ name: "Isolation probe" });

    expect(await CustomerModel.countDocuments()).toBe(1);
  });

  it("starts the next test with an empty collection", async () => {
    expect(await CustomerModel.countDocuments()).toBe(0);
  });
});
