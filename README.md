# InvoiceMe Business Management System

A comprehensive, production-ready CRUD application for managing customers and generating invoices for a small businesses.

**Version:** 1.0.0  
**Status:** Production Ready  
**Stack:** MERN (MongoDB, Express.js, React.js, Node.js) + Tailwind CSS

## Project Health

[![Dependabot](https://img.shields.io/badge/Dependabot-passing-brightgreen)](./.github/dependabot.yml)
[![CodeQL](https://github.com/MatheusCastro99/InvoiceMe/actions/workflows/codeql.yml/badge.svg?branch=master)](https://github.com/MatheusCastro99/InvoiceMe/actions/workflows/codeql.yml)
[![Node.js CI](https://github.com/MatheusCastro99/InvoiceMe/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/MatheusCastro99/InvoiceMe/actions/workflows/node.js.yml)

[![Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen)](https://github.com/MatheusCastro99/InvoiceMe)

[![Node.js](https://img.shields.io/badge/Node.js-API-blue)](https://nodejs.org/learn/)
[![React](https://img.shields.io/badge/React.js-UI-blue)](https://react.dev/learn)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-blue)](https://learn.mongodb.com)


## Project Overview

A full-stack application for managing customers and invoices with professional features:

- **API Versioning** - RESTful API with `/api/v1/` routing
- **Production Ready** - Error handling, detailed validation, modern security principles
- **Well Documented** - API docs, README files, inline comments
- **Environment Configuration** - `.env` based setup
- **Input Validation** - Front-End Checks for quick user reference + Back-end Validation to enforce standards and business rules

---

# Project Status

## Features

**Customer Management**

- View customers with modular pagination
- Create with validation
- Edit profiles
- Delete confirmation
- Duplicate phone prevention

**Invoice Management**

- Generate invoices
- Tax calculations by state
- PDF exports
- Invoice history
- Invoice Number tracking system and duplicate prevention

**User Interface**

- Responsive design
- Toast notifications
- Sweet alerts
- Smooth animations
- Tailwind styling

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

- API versioning (`/api/v1/`)
- Error handling improvements
- Input validation middleware
- Environment configuration
- Customer CRUD with validation
- Invoice management
- Tax calculations
- PDF exports
- Responsive UI
- Comprehensive documentation

**Key Improvements:**

- Centralized error handling
- Custom error classes
- Validation utilities
- Fixed CORS configuration
- API endpoint configuration
- Pagination support
- Duplicate prevention
- Production-ready setup

---

# Documentation

## Graphify Documentation Support

Graphify is available as a tool to support documentation and exploration of the codebase. It can help surface relationships between modules, identify documentation hotspots, and provide a structured knowledge map for the project.

Generated outputs for this repository are stored in the `graphify-out/` directory, including a persistent graph and report files for documentation-oriented analysis.

## Key Documentation Files

| File                                                           | Purpose                                   |
| -------------------------------------------------------------- | ----------------------------------------- |
| [NODEAPI/API_DOCUMENTATION.md](./NODEAPI/API_DOCUMENTATION.md) | Complete API reference with examples      |

## Project Architecture

  Simple Model-View-Controller Setup
  
```
CRUD1/
├── NODEAPI/
│   ├── controllers/    # Business logic
│   ├── models/         # MongoDB schemas
│   ├── routes/         # Route handlers
│   ├── middlewares/    # Express middlewares
│   ├── utils/          # Errors, validation, constants
│   ├── server.js       # Express app
│   ├── package.json
│   ├── .env.example
│   ├── README.md
│   └── API_DOCUMENTATION.md
├── FRONTEND/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── config/     # API configuration
│   │   └── App.jsx
│   ├── package.json
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
└── README.md
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

- Node.js v14+
- MongoDB Atlas (or local MongoDB)
- npm/yarn

## Backend Setup

```bash
cd NODEAPI
npm install
cp .env.example .env
# Edit .env with your MongoDB URL.
# If you do not have MongoDB Atlas, use a local MongoDB instance:
# MONGO_URL=mongodb://127.0.0.1:27017/ken-tech
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

> Note: This frontend is a Vite application and must be started with `npm run dev` or `npm start` inside the `FRONTEND` folder. Do not use a generic live-server on `index.html` because the app relies on Vite's ES module development server.

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
