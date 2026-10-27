/**
 * InvoiceMe API
 * Server bootstrap: loads the environment, connects to MongoDB, then starts listening.
 * The Express app itself lives in app.js.
 * API v1.0+
 */

require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const CustomerModel = require("./models/customerModel");

// Configuration
const DEFAULT_MONGO_URL = "mongodb://127.0.0.1:27017/API-test";
const MONGO_URL = process.env.MONGO_URL || DEFAULT_MONGO_URL;
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

if (!process.env.MONGO_URL) {
  console.warn(
    "⚠️  MONGO_URL is not defined. Falling back to local MongoDB at:",
    DEFAULT_MONGO_URL
  );
}

// Database Connection & Server Startup
const start = async () => {
  try {
    await mongoose.connect(MONGO_URL);
  } catch (error) {
    console.error("✗ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
  console.log("✓ Connected to MongoDB");

  // The unique phone number index must exist before the API takes requests
  try {
    await CustomerModel.init();
  } catch (error) {
    console.error("✗ Could not build indexes:", error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`✓ InvoiceMe Business Maintenance API running on port ${PORT}`);
    console.log(`✓ Environment: ${NODE_ENV}`);
    console.log(`✓ Frontend URL: ${app.get("frontendUrl")}`);
  });
};

start();
