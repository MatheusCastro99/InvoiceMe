# Project Roadmap

## Epic 0: Automated API tests [CONCLUDED]

- Split the Express App from the Server bootstrap in order to make the app importable without a DB connection
- Every NODEAPI endpoint has automated HTTP-level tests that run locally and in CI
- Harnesses: Jest + Supertest

## Epic 1: Schema Types Correction

- API validation for duplicate customers/invoice numbers, invalid dates, and uncapped page sizes (#70)
- Correct API return calls ([#69](https://github.com/MatheusCastro99/InvoiceMe/issues/69))
- Int cents for money calculations

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


