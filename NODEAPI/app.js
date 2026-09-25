/**
 * InvoiceMe API
 * Express application: middleware, routes, and error handling.
 * Has no side effects on require (no database connection, no listening port),
 * so tests can import it directly. server.js does the bootstrapping.
 * API v1.0+
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const customerRoute = require("./routes/customerRoute");
const taxRoute = require("./routes/taxRoute");
const invoiceRoute = require("./routes/invoiceRoute");
const errorMiddleware = require("./middlewares/errorMiddleware");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Initialize Express App
const app = express();
app.set("frontendUrl", FRONTEND_URL);

// CORS Configuration
const allowedOrigins = new Set([
  FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
]);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy block: origin '${origin}' not allowed`), false);
  },
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
    message: "InvoiceMe Business Maintenance API",
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

// Debug endpoint: expose minimal DB connection metadata to assist debugging
app.get('/debug/db', (req, res) => {
  const conn = mongoose.connection;
  res.status(200).json({
    readyState: conn.readyState, // 0 disconnected, 1 connected
    name: conn.name || null,
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

module.exports = app;
