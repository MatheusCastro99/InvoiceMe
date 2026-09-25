# InvoiceMe Business Management System

A comprehensive, production-ready CRUD application for managing customers and generating invoices for a small businesses.

**Version:** 1.0.0
**Status:** Production-ready MVP
**Stack:** MERN (MongoDB, Express.js, React.js, Node.js) + Tailwind CSS

## Project Health

[![Dependabot](https://img.shields.io/badge/Dependabot-passing-brightgreen)](../.github/dependabot.yml)
[![CodeQL](https://github.com/MatheusCastro99/InvoiceMe/actions/workflows/codeql.yml/badge.svg?branch=master)](https://github.com/MatheusCastro99/InvoiceMe/actions/workflows/codeql.yml)
[![Node.js CI](https://github.com/MatheusCastro99/InvoiceMe/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/MatheusCastro99/InvoiceMe/actions/workflows/node.js.yml)

[![Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen)](https://github.com/MatheusCastro99/InvoiceMe)
[![Node.js](https://img.shields.io/badge/Node.js-API-blue)](https://nodejs.org/learn/)
[![React](https://img.shields.io/badge/React.js-UI-blue)](https://react.dev/learn)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-blue)](https://learn.mongodb.com)

## Project Overview

InvoiceMe is a full-stack business management app for small businesses that need a lightweight way to manage customer records and generate invoice workflows.

Current delivery includes:

- **API versioning** with `/api/v1/` routes
- **Customer CRUD** with validation and duplicate protection
- **Invoice creation and lookup** with tax-aware business logic
- **PDF-ready invoice flow** and frontend invoice views
- **MongoDB-backed persistence** and health checks for runtime validation
- **Responsive React UI** built with Vite + Tailwind
- **Environment-based configuration** for local development and deployment

---

# Project Status

## Current Release Status

The project is currently in an active MVP / production-ready iteration for small-business workflows. Core backend and frontend capabilities are implemented, and the repository includes automated dependency and security checks alongside the main Node.js workflow.

## Features

**Customer Management**

- View customers with pagination support
- Create customer records with validation
- Edit existing profiles
- Delete records with confirmation flows
- Prevent duplicate phone numbers on create/update

**Invoice Management**

- Create invoices from customer and service data
- Calculate tax by state
- Maintain invoice history and lookup endpoints
- Generate invoice data ready for export and PDF rendering
- Track invoice numbers to avoid duplicates

**User Interface**

- Responsive layout for desktop and tablet usage
- Toast notifications and alert dialogs
- Smooth interaction feedback
- Tailwind-driven styling and modern React components

## Validation

**Customer:**

- Phone: Valid US format
- Email: Valid email (optional)
- Zip: 5 or 9 digits (optional)
- State: 2-letter code (optional)

**Invoice:**

- Phone: Valid US format
- Date: ISO format required
- Price: Positive number

## API Testing Example

```bash
# Get all customers
curl http://localhost:3000/api/v1/customers

# Create customer
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Tech Corp",
    "phoneNumber": "(555) 123-4567"
  }'
```

## Expected Response Format

**Success:**

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {},
  "pagination": {}
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": ["Error 1", "Error 2"]
}
```

## Version History

### v1.0.0 (Current) - 2024

**Released Features:**

- API versioning via `/api/v1/`
- Centralized error handling and validation middleware
- Environment-based backend configuration
- Customer CRUD with duplicate prevention
- Invoice management and tax-aware calculations
- React frontend for customer and invoice workflows
- Documentation and roadmap structure in the repo

**Key Improvements:**

- CORS and runtime-health support for local app development
- Backend route organization by resource
- Pagination and validation for customer listing and create flows
- Security and dependency update checks via GitHub workflows

## Planned Improvements

The project roadmap is tracked in [ROADMAP.md](./ROADMAP.md). Current focus areas include:

- AI-assisted development environment
- In-memory cache for customer list and tax lookups
- MailTo share/email invoice capability
- Optional Redis-backed cache layer for production use
- Potential architecture refactor for greater modularity
---

# Documentation

## Graphify Documentation Support

Graphify is available as a tool to support documentation and exploration of the codebase. It can help surface relationships between modules, identify documentation hotspots, and provide a structured knowledge map for the project.

Generated outputs are written to a local `graphify-out/` directory, including a persistent graph and report files for documentation-oriented analysis. That directory is gitignored and not committed; regenerate it locally when you need it.

## Key Documentation Files

| File | Purpose |
| --- | --- |
| [../README.md](./README.md) | Repository overview and project entry point |
| [./ROADMAP.md](./ROADMAP.md) | Planned improvements and near-term feature roadmap |
| [./Decisions.md](./Decisions.md) | Architecture and engineering decisions (ADRs) |
| [../NODEAPI/API_DOCUMENTATION.md](../NODEAPI/API_DOCUMENTATION.md) | Complete API reference with examples |

## Project Architecture

The current codebase follows a small full-stack MVC-style layout with separate API and frontend concerns.

```
InvoiceMe/
├── NODEAPI/
│   ├── controllers/    # Business logic
│   ├── models/         # MongoDB schemas
│   ├── routes/         # Route handlers
│   ├── middlewares/    # Validation and error handling
│   ├── utils/          # Shared helpers and constants
│   ├── app.js          # Express app: middleware, routes, error handling
│   ├── server.js       # Bootstrap: env, MongoDB connection, listen
│   ├── package.json
│   └── .env.example
├── FRONTEND/
│   ├── src/
│   │   ├── components/ # UI blocks and reusable views
│   │   ├── pages/      # Page-level screens
│   │   ├── config/     # API configuration
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docs/
│   ├── README.md
│   ├── ROADMAP.md
│   ├── Decisions.md
│   ├── architecture-overview.md
│   └── save-workflows.md
├── package.json        # Root scripts to run API + frontend together
└── .github/
    ├── workflows/
    └── dependabot.yml
```

## API Versioning

All endpoints use versioning: `/api/v1/{resource}`

**Customer Endpoints:**

```
GET    /api/v1/customers              # List
GET    /api/v1/customers/:id          # Get one
POST   /api/v1/customers              # Create
PUT    /api/v1/customers/:id          # Update
DELETE /api/v1/customers/:id          # Delete
```

**Invoice Endpoints:**

```
GET    /api/v1/invoices               # List
POST   /api/v1/invoices               # Create
DELETE /api/v1/invoices/:id           # Delete
```

**Tax Endpoints:**

```
POST   /api/v1/tax/rate               # Get state rate
POST   /api/v1/tax/calculate          # Calculate
```

---

# Quick Start

### Prerequisites

- Node.js 20.19+ required (Mongoose 9)
- MongoDB Atlas or local MongoDB instance
- npm

## Quick Start (recommended)

From the repository root, install dependencies and run the app in development mode:

```bash
npm install
npm run dev
```

This uses the root workspace scripts to start both the API and frontend together.

## Backend Setup

```bash
cd NODEAPI
npm install
cp .env.example .env
# Edit .env with your MongoDB URL.
# If you do not have MongoDB Atlas, use a local MongoDB instance:
# MONGO_URL=mongodb://127.0.0.1:27017/API-test
npm run dev
# Server runs on http://localhost:3000
```

## Frontend Setup

```bash
cd FRONTEND
npm install
npm run dev
# App runs on http://localhost:5173
```

> Note: The frontend is a Vite app and should be started with `npm run dev` or `npm start` inside the `FRONTEND` folder. Avoid launching `index.html` directly because the app relies on Vite's module system.

## Configuration

### Backend (.env)

```bash
MONGO_URL=mongodb+srv://...
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
API_VERSION=v1 (api/v1/)
```

### Frontend (.env.local)

```bash
VITE_API_BASE_URL=http://localhost:3000
```

---

# Troubleshooting First steps

**MongoDB connection error:**

- Verify MONGO_URL in .env
- Check IP whitelist on MongoDB Atlas

**CORS error:**

- Verify FRONTEND_URL matches your frontend domain
- Both must be running

## Documentation Support

- API questions → [API_DOCUMENTATION.md](./NODEAPI/API_DOCUMENTATION.md)
