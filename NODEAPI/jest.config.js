/**
 * InvoiceMe API - Jest configuration
 * One in-memory MongoDB server per run (globalSetup/globalTeardown);
 * each test file connects to its own database (tests/setup/setupFile.js).
 * Coverage is reported with no threshold.
 */

module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  globalSetup: "<rootDir>/tests/setup/globalSetup.js",
  globalTeardown: "<rootDir>/tests/setup/globalTeardown.js",
  setupFilesAfterEnv: ["<rootDir>/tests/setup/setupFile.js"],
  collectCoverageFrom: [
    "**/*.js",
    "!tests/**",
    "!coverage/**",
    "!node_modules/**",
    "!jest.config.js",
  ],
};
