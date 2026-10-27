# Project Roadmap

## Epic 0: Automated API tests [CONCLUDED]

- Split the Express App from the Server bootstrap in order to make the app importable without a DB connection
- Every NODEAPI endpoint has automated HTTP-level tests that run locally and in CI
- Harnesses: Jest + Supertest

## Epic 1: Schema Types Correction ([#136](https://github.com/MatheusCastro99/InvoiceMe/issues/136))

Sub-issues, done in order:

1. Client errors answer 4xx, not 500 ([#69](https://github.com/MatheusCastro99/InvoiceMe/issues/69))
2. Customer integrity: normalized phone numbers and a capped page size ([#137](https://github.com/MatheusCastro99/InvoiceMe/issues/137))
3. Date of service as a calendar date, ADR-013 ([#138](https://github.com/MatheusCastro99/InvoiceMe/issues/138))
4. Unique invoice numbers ([#139](https://github.com/MatheusCastro99/InvoiceMe/issues/139))
5. Money in integer cents, ADR-012 ([#140](https://github.com/MatheusCastro99/InvoiceMe/issues/140))
6. Migrate existing data and cut over to `/api/v2` ([#141](https://github.com/MatheusCastro99/InvoiceMe/issues/141))

Sub-issues 2–4 split the integrity gaps in [#70](https://github.com/MatheusCastro99/InvoiceMe/issues/70), which closes when the last of them merges.

## Epic 2: Authentication Overhaul

- Auth is still undecided
- Implementation has to hold support for multiple users, as app is planned to go live publicly

## Epic 3: Dockerization

- Wrap application in several docker containers

## Epic 4: UI Overhaul

- Redesign on all pages to hold clear green (tech) color palette.
- Finance theme design and adoption

## Epic 5: Last Pass before InvoiceMe goes live

- A last pass for UX fixes
- Repo-wide secret scanning
- Deciding where to host. Vercel, AWS, and Azure are some of the considered options so far, open to recommendation.
- Deployment strategy


