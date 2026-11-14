# Project Roadmap

InvoiceMe is being reworked to go live publicly, for many small businesses at once. The epics run in the order below; each one is planned when the one before it closes.

## Epic 0: Automated API tests [CONCLUDED]

- Split the Express App from the Server bootstrap in order to make the app importable without a DB connection
- Every NODEAPI endpoint has automated HTTP-level tests that run locally and in CI
- Harnesses: Jest + Supertest

## Epic 1: Schema Types Correction ([#136](https://github.com/MatheusCastro99/InvoiceMe/issues/136)) [CONCLUDED]

Sub-issues, done in order:

1. Client errors answer 4xx, not 500 ([#69](https://github.com/MatheusCastro99/InvoiceMe/issues/69))
2. Customer integrity: normalized phone numbers and a capped page size ([#137](https://github.com/MatheusCastro99/InvoiceMe/issues/137))
3. Date of service as a calendar date, ADR-013 ([#138](https://github.com/MatheusCastro99/InvoiceMe/issues/138))
4. Unique invoice numbers ([#139](https://github.com/MatheusCastro99/InvoiceMe/issues/139))
5. Money in integer cents, ADR-012 ([#140](https://github.com/MatheusCastro99/InvoiceMe/issues/140))
6. Migrate existing data and cut over to `/api/v2` ([#141](https://github.com/MatheusCastro99/InvoiceMe/issues/141))

Sub-issues 2–4 split the integrity gaps in [#70](https://github.com/MatheusCastro99/InvoiceMe/issues/70), which closed when the last of them merged.

## Before the next epic: small fixes

Independent issues, each small:

- Turn on GitHub secret scanning and push protection (the repository is already public), and scan the git history once.
- Fix the open `npm audit` finding in the API's dependencies.
- Pagination on the customer list and the invoice's customer picker: today both see only the first 20 customers.

## Decision: hosting and authentication

One decision, recorded as an ADR before Epic 2 starts, because the host shapes both the auth provider and what Dockerization is for. Options considered:

- **A.** Azure Container Apps (API) + Azure Static Web Apps (frontend) + MongoDB Atlas + Microsoft Entra External ID (sign-in for the public, not the workforce Entra ID).
- **B.** A simple container host (Render, Fly) + a static host + MongoDB Atlas + a hosted auth service (Auth0, Clerk).
- **C.** Self-built email and password sign-in with JWTs, on either host. No vendor, but password reset, email verification and sign-in rate limiting become ours to build and secure.

Vercel was also considered: it suits the frontend, but the Express API would need reworking for serverless, which leaves Dockerization with little purpose.

## Epic 2: Authentication

- Sign-up, sign-in and sign-out with the chosen provider.
- The API checks every `/api/v2/` request for a signed-in user.
- The new screens follow the palette and tokens of Epic 5, agreed in `UI_Guidelines.md` before they are built.

## Epic 3: Multiple users (data ownership)

- Every customer and invoice belongs to one user; every query is scoped to the signed-in user.
- Uniqueness becomes per user: a customer's phone number and an invoice number are unique within one user's data, not across the database.
- A business profile per user (company name, address, contact, payment methods), printed on the invoice PDF in place of today's placeholders.
- From the bug backlog ([#153](https://github.com/MatheusCastro99/InvoiceMe/issues/153)): a customer id on invoices, so a renamed customer's older invoices stay on their profile (ADR-008 keeps the copy of the customer's fields).
- A migration that gives existing data to a first user.

## Epic 4: Dockerization and staging

- Containers for local development (API, frontend, MongoDB) with Docker Compose.
- Production images shaped by the hosting decision.
- A deploy pipeline from CI to a live staging environment, so the go-live epic starts from a running deployment.

## Epic 5: UI Overhaul

- Redesign on all pages to hold clear green (tech) color palette.
- Finance theme design and adoption
- Can overlap with Epic 4. The palette and tokens are settled early, before Epic 2's screens.

## Epic 6: Last pass before InvoiceMe goes live

- Security hardening: rate limiting (sign-in especially), security headers, request size limits, CORS for the production domain.
- Operations: database backups, logging and error monitoring, a production environment and its deploy.
- Privacy: a privacy policy and terms, account deletion and data export (users store their own customers' personal details).
- End-to-end tests of the main flows (sign in, create a customer, create an invoice, open the PDF).
- A last pass for UX fixes.

## Open product questions

- Sales tax: `STATE_TAX_RATES` holds one rate per state, but real rates vary by city and county, and services are often not taxed. Whether users may override the rate is to be decided before going live.

## Deferred from the bug backlog ([#153](https://github.com/MatheusCastro99/InvoiceMe/issues/153))

- A renamed customer's older invoices drop off their profile, because invoices store only a copied customer name. Planned in Epic 3.
- A saved invoice can't be updated in place: there is no update endpoint, so "Edit Invoice" makes a copy that must take a new invoice number. Add an update endpoint and use it from the edit flow.
