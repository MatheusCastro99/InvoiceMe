# InvoiceMe Business Management System

A comprehensive, production-ready CRUD application for managing customers and generating invoices for a small businesses.

**Version:** 1.26
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

- **API versioning** with `/api/v2/` routes
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
- Prevent duplicate phone numbers on create/update, whatever the format they are typed in

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
- Date of service: required, a real date written YYYY-MM-DD
- Price: a number, 0 or more

## API Testing Example

```bash
# Get all customers
curl http://localhost:3000/api/v2/customers

# Create customer
curl -X POST http://localhost:3000/api/v2/customers \
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

### v2.0 (current)

The full history is in [`NODEAPI/VersionLog.md`](../NODEAPI/VersionLog.md).

**Released Features:**

- API versioning via `/api/v2/`
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

The project roadmap is tracked in [Project_Roadmap.md](../Docs/Project_Roadmap.md). Current focus areas include:

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
| [./PRD.md](./PRD.md) | Product requirements: what InvoiceMe does and for whom |
| [./Project_Vision.md](./Project_Vision.md) | Why the project exists and where it is heading |
| [../Docs/Project_Roadmap.md](../Docs/Project_Roadmap.md) | Planned improvements and near-term feature roadmap |
| [../Harness_Config/Context/Decisions_Consistency.md](../Harness_Config/Context/Decisions_Consistency.md) | Architecture and engineering decisions (ADRs) |
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
│   ├── tests/          # Jest + Supertest suite; setup in tests/setup/
│   ├── app.js          # Express app: middleware, routes, error handling
│   ├── server.js       # Bootstrap: env, MongoDB connection, customer and invoice indexes, listen
│   ├── jest.config.js
│   ├── API_DOCUMENTATION.md # API reference
│   ├── VersionLog.md   # API change log
│   ├── package.json
│   └── .env.example
├── FRONTEND/
│   ├── src/
│   │   ├── components/ # UI blocks and reusable views
│   │   ├── pages/      # Page-level screens
│   │   ├── config/     # API configuration
│   │   ├── utils/      # Phone number check and display format
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── public/
├── Docs/
│   ├── README.md           # This file
│   ├── PRD.md              # Product requirements
│   ├── Project_Vision.md   # Vision and direction
│   └── Project_Roadmap.md  # Planned work
├── Harness_Config/Context/
│   ├── Architecture_Design.md   # Structure and key files
│   ├── DataFlow.md              # How a request moves and fails
│   ├── Decisions_Consistency.md # Standing rules (ADRs)
│   └── UI_Guidelines.md         # UI authority
├── package.json        # Root scripts to run API + frontend together
└── .github/
    ├── workflows/
    └── dependabot.yml
```

## API Versioning

All endpoints use versioning: `/api/v2/{resource}`

**Customer Endpoints:**

```
GET    /api/v2/customers              # List
GET    /api/v2/customers/:id          # Get one
POST   /api/v2/customers              # Create
PUT    /api/v2/customers/:id          # Update
DELETE /api/v2/customers/:id          # Delete
```

**Invoice Endpoints:**

```
GET    /api/v2/invoices               # List
POST   /api/v2/invoices               # Create
DELETE /api/v2/invoices/:id           # Delete
```

**Tax Endpoints:**

```
POST   /api/v2/tax/rate               # Get state rate
POST   /api/v2/tax/calculate          # Calculate
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

This uses the root scripts, which run the API and the frontend together with `concurrently`.

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

# Tests (no .env or database needed; npm install downloads a MongoDB binary the first time)
npm test
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
API_VERSION=v2          # in .env.example, not read by the code yet; routes are fixed at /api/v2/
```

### Frontend (.env.local)

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## Migrating a database from before v2.0

API v2.0 stores phone numbers as 10 digits, dates at UTC midnight and money as integer cents, and every path is under `/api/v2/`. A database written before v2.0 is converted once, by hand, with `NODEAPI/scripts/v2Migration.js`. The script deletes and merges nothing: a record it cannot convert is left as it is and listed with its `_id` and the reason, and you fix it by hand. It never prints a stored value, so look a record up by its `_id` in `mongosh` or Compass.

Use your own connection string in place of the placeholders below, and keep it out of commits and chats.

1. **Stop the API.** Nothing should write to the database during the migration.
2. **Back up.** The backup is the only way back, because the migration removes the old money fields. This needs the [MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/):

   ```bash
   mongodump --uri "<your MONGO_URL>" --out <backup-folder>
   ```

3. **Dry run.** It writes nothing, not even the indexes, and lists every change, every record it cannot convert, and every invoice whose final price changes because the money is recomputed by today's rules:

   ```bash
   cd NODEAPI
   npm run migrate:v2 -- --dry-run
   ```

   `MONGO_URL` comes from `NODEAPI/.env` or the environment; without it the script refuses to run. It prints the host and database it will use, never the credentials. Fix each problem by hand, for example two customers with the same phone number or two invoices with the same number, and run the dry run again. It exits 0 only when nothing is reported and the unique indexes can be built.
4. **Run.**

   ```bash
   npm run migrate:v2
   ```

   It prints the same report and then writes. A record that was reported stays untouched, and a unique index that duplicates block is not built; fix the data and run it again, which builds it.
5. **Check.** A second dry run lists no changes and exits 0. Then start the API with `npm start`: it builds the unique indexes before it listens. Open an old invoice in the app and check its date and amounts.
6. **Restore, if it went wrong.** Stop the API and restore the backup over the database (`--drop` replaces what is there). The backup folder holds one subfolder per database, so the address has no database name. Keep the query options in your `MONGO_URL`, such as `?authSource=<database>`:

   ```bash
   mongorestore --uri "<your MONGO_URL with the database name removed and its query options kept>" --drop <backup-folder>
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

- API questions → [API_DOCUMENTATION.md](../NODEAPI/API_DOCUMENTATION.md)
