# Graph Report - install-graphify-for-invoiceme  (2026-08-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 262 nodes · 337 edges · 19 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f32088f9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- App.jsx
- customerController.js
- devDependencies
- dependencies
- NODEAPI/package.json
- invoiceController.js
- package.json
- taxController.js
- validationMiddleware.js
- server.js
- FRONTEND/package.json
- InvoicePage.jsx

## God Nodes (most connected - your core abstractions)
1. `API_ENDPOINTS` - 11 edges
2. `validateCustomerData()` - 8 edges
3. `scripts` - 7 edges
4. `keywords` - 7 edges
5. `express` - 6 edges
6. `scripts` - 6 edges
7. `scripts` - 5 edges
8. `NotFoundError` - 4 edges
9. `ValidationError` - 4 edges
10. `validateInvoiceData()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `validateCustomerInput()` --calls--> `validateCustomerData()`  [EXTRACTED]
  NODEAPI/middlewares/validationMiddleware.js → NODEAPI/utils/validators.js
- `validateInvoiceInput()` --calls--> `validateInvoiceData()`  [EXTRACTED]
  NODEAPI/middlewares/validationMiddleware.js → NODEAPI/utils/validators.js

## Import Cycles
- None detected.

## Communities (19 total, 0 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.05
Nodes (37): axios, dayjs, @emotion/react, @emotion/styled, file-saver, flowbite-react, @fortawesome/fontawesome-svg-core, @fortawesome/free-solid-svg-icons (+29 more)

### Community 1 - "App.jsx"
Cohesion: 0.12
Nodes (19): App(), Customer(), CustomerProfile(), MyDocument(), fas, TableInvoice(), API_ENDPOINTS, CreatePage() (+11 more)

### Community 2 - "customerController.js"
Cohesion: 0.07
Nodes (23): asyncHandler, CustomerModel, delCustomer, getCustomerByID, getCustomers, mongoose, {
  NotFoundError,
  ConflictError,
  RESPONSE_MESSAGES,
}, postCustomer (+15 more)

### Community 3 - "devDependencies"
Cohesion: 0.09
Nodes (23): autoprefixer, eslint, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint (+15 more)

### Community 4 - "dependencies"
Cohesion: 0.11
Nodes (19): cors, dotenv, express, express-async-handler, express-validator, mongoose, dependencies, cors (+11 more)

### Community 5 - "NODEAPI/package.json"
Cohesion: 0.11
Nodes (18): author, description, devDependencies, nodemon, engines, node, npm, license (+10 more)

### Community 6 - "invoiceController.js"
Cohesion: 0.14
Nodes (14): asyncHandler, delInvoice, getInvoice, InvoiceModel, { NotFoundError }, postInvoice, { RESPONSE_MESSAGES }, InvoiceModel (+6 more)

### Community 7 - "package.json"
Cohesion: 0.14
Nodes (13): concurrently, description, devDependencies, concurrently, name, private, scripts, dev (+5 more)

### Community 8 - "taxController.js"
Cohesion: 0.18
Nodes (11): asyncHandler, calculateTax, defineTaxRate, { STATE_TAX_RATES }, { ValidationError }, { calculateTax, defineTaxRate }, express, taxRouter (+3 more)

### Community 9 - "validationMiddleware.js"
Cohesion: 0.25
Nodes (12): {
  validateCustomerData,
  validateInvoiceData,
}, validateCustomerInput(), validateInvoiceInput(), { ValidationError }, validateCompanyName(), validateCustomerData(), validateEmail(), validateInvoiceData() (+4 more)

### Community 10 - "server.js"
Cohesion: 0.15
Nodes (10): allowedOrigins, app, cors, corsOptions, customerRoute, errorMiddleware, express, invoiceRoute (+2 more)

### Community 11 - "FRONTEND/package.json"
Cohesion: 0.17
Nodes (11): name, private, scripts, build, dev, lint, page, preview (+3 more)

### Community 12 - "InvoicePage.jsx"
Cohesion: 0.47
Nodes (3): CustomerInfo(), TableDescription(), InvoicePage()

## Knowledge Gaps
- **117 isolated node(s):** `axios`, `dayjs`, `@emotion/react`, `@emotion/styled`, `file-saver` (+112 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `express` connect `dependencies` to `taxController.js`, `customerController.js`, `server.js`, `invoiceController.js`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `keywords` connect `dependencies` to `NODEAPI/package.json`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `FRONTEND/package.json`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `axios`, `dayjs`, `@emotion/react` to the rest of the system?**
  _117 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12436974789915967 - nodes in this community are weakly interconnected._
- **Should `customerController.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07386363636363637 - nodes in this community are weakly interconnected._