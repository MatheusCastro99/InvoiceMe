/**
 * Ken-Tech Maintenance API
 * Express Server Configuration
 * API v1.0+
 */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const customerRoute = require("./routes/customerRoute");
const taxRoute = require("./routes/taxRoute");
const invoiceRoute = require("./routes/invoiceRoute");
const errorMiddleware = require("./middlewares/errorMiddleware");

// Configuration
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Initialize Express App
const app = express();

// CORS Configuration
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// Health Check Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ken-Tech Maintenance API",
    version: "v1.0",
    status: "running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Health check passed",
    timestamp: new Date().toISOString(),
  });
});

// API Routes - v1.0
app.use("/api/v1/customers", customerRoute);
app.use("/api/v1/tax", taxRoute);
app.use("/api/v1/invoices", invoiceRoute);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global Error Handler (MUST be last)
app.use(errorMiddleware);

// Database Connection & Server Startup
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✓ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✓ Ken-Tech API running on port ${PORT}`);
      console.log(`✓ Environment: ${NODE_ENV}`);
      console.log(`✓ Frontend URL: ${FRONTEND_URL}`);
    });
  })
  .catch((error) => {
    console.error("✗ MongoDB Connection Error:", error.message);
    process.exit(1);
  });

module.exports = app;
