# InvoiceMe Architecture Overview

This document summarizes the current system architecture and the planned extension points.

## Current architecture

```mermaid
flowchart LR
    U[Business User / Staff] --> F[React Frontend\nVite + Tailwind\nPages: Create / Edit / Home / Invoice / Pdf / Profile]
    F -->|REST JSON requests| A[Express API\n/app.js\n/api/v1]
    A --> R[Routes\ncustomerRoute.js\ninvoiceRoute.js\ntaxRoute.js]
    R --> V[Validation Middleware\nvalidationMiddleware.js]
    V --> C[Controllers\ncustomerController.js\ninvoiceController.js\ntaxController.js]
    C --> M[Mongoose Models\ncustomerModel.js\ninvoiceModel.js]
    M --> D[(MongoDB)]
    C --> T[Tax Logic\nstate rate lookup + final price calculation]
    F --> P[PDF Generation\nPdfPage.jsx + MyDocument]

    subgraph CI[Repository Controls]
        C1[Node.js CI]
        C2[CodeQL]
        C3[Dependabot]
    end
```

## System responsibilities

- Frontend: customer management, invoice workflow UI, PDF-ready views, responsive interactions
- API: versioned REST endpoints, validation, customer/invoice business logic, health checks
- Database: MongoDB persistence for customers, invoices, and business records
- Tax service: state tax lookup and calculation logic used during invoice processing
- CI/CD: automated workflow validation, security scanning, and dependency updates

## Planned extensions

- Redis / in-memory cache for repetitive reads and tax lookups
- AI-assisted development workspace with contextual prompts and agent guidance
- MailTo invoice delivery workflow for sending invoices directly to customer emails

## Diagram notes

The editable architecture drawing is stored in [architecture-overview.excalidraw](./architecture-overview.excalidraw).
