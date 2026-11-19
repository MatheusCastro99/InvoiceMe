# Decisions

Last updated: 2026-11-19

The standing rules every change to InvoiceMe must follow. A one-off choice is not a rule: it goes in its issue or pull request.

### ADR-001
Every request to a resource under `/api/v2/` takes one path: router, validation middleware where the route has one, controller wrapped in `express-async-handler`, Mongoose model where the resource is stored. Errors are thrown as the error classes in `NODEAPI/utils/errors.js` and answered by `errorMiddleware`.

Reason:
- One path means one place to add a check, and one shape for every answer the frontend reads.
- A controller that answers an error itself bypasses the logging and the error shape.

Rules:
- A success answers `{ success: true, data, message? }`; a list may add `count` or `pagination`.
- An error answers `{ success: false, message, statusCode, errors? }`, built by `errorMiddleware`.
- A controller, middleware or validator never calls `res.status(4xx|5xx)` itself; it throws `ValidationError`, `NotFoundError`, `ConflictError` or another `AppError` subclass.
- Resource routes are mounted under `/api/v2/`. Only `/`, `/health`, `/debug/db` and the 404 handler live outside it, in `app.js`.

Examples:
- `routes/customerRoute.js` → `validateCustomerInput` → `postCustomer` → `CustomerModel.create`
- `routes/taxRoute.js` → `calculateTax`, which checks its own input and throws `ValidationError`; nothing is stored

Status: Accepted, current

### ADR-002
Every API URL the frontend calls is defined once, in `API_ENDPOINTS` in `FRONTEND/src/config/apiConfig.js`.

Reason:
- The base URL comes from `VITE_API_BASE_URL`; a URL written inside a page ignores it.
- One list shows every endpoint the frontend depends on.

Rules:
- A new endpoint adds its route in `NODEAPI/routes/` and its entry in `API_ENDPOINTS` in the same change.
- Pages and components never write an API URL as a string.

Status: Accepted, current

### ADR-003
The server's validators in `NODEAPI/utils/validators.js` are the source of truth for what a valid customer or invoice is.

Reason:
- Only the server's check protects what is stored.

Rules:
- A change to a validation rule is made on the server first; the client's checks follow it and never accept what the server rejects, or reject what it accepts.

Status: Accepted, pending (the client checks in `CreatePage.jsx`, `EditPage.jsx` and `InvoicePage.jsx` aligned with `utils/validators.js`)

### ADR-004
The server is the source of the tax rate and the invoice's final price. The rate table, `STATE_TAX_RATES` in `NODEAPI/utils/constants.js`, is the only source of tax rates.

Reason:
- A final price computed in two places drifts apart.
- One table to update when a rate changes.

Rules:
- The frontend gets the rate and the final price from `/api/v2/tax/rate` and `/api/v2/tax/calculate`, and never computes either itself.
- The frontend may derive what it only displays: the line totals and the subtotal; the tax and the final price come from the server, except a $0 subtotal, which shows a $0 tax and total without a call (#153).

Status: Accepted, current

### ADR-005
User-facing messages from the API come from `RESPONSE_MESSAGES` in `NODEAPI/utils/constants.js`.

Reason:
- One place to read and change what the user is told.

Status: Accepted, pending (the literal messages in `utils/validators.js`, the `Invalid value for` path messages and the fallback message in `middlewares/errorMiddleware.js`, and the 404 message in `app.js` moved to `RESPONSE_MESSAGES`)

### ADR-006
API files follow one naming pattern.

Reason:
- A reader finds a resource's route, controller and model by name alone.

Rules:
- Files are camelCase with their role as suffix: `customerRoute.js`, `customerController.js`, `customerModel.js`.
- Handlers for a stored resource are named by verb: `getX`, `postX`, `updateX`, `delX`. Other handlers say what they do: `calculateTax`.
- Mongoose models are exported as `XModel`.
- Route, controller, middleware and utility files open with a JSDoc banner, and each route carries `@route` JSDoc.

Status: Accepted, current

### ADR-007
Configuration and secrets come from environment variables. `.env` files are never committed. `NODEAPI/.env.example` lists every API variable by name, and `FRONTEND/.env.example` every frontend variable.

Reason:
- A connection string in the code or in git is exposed to anyone who can read the repository.
- Vite reads `FRONTEND/.env`, not the API's file, so each project lists its own variables.

Rules:
- A new variable is added to its project's `.env.example` in the same change, without a real value.
- Frontend variables use the `VITE_` prefix.

Status: Accepted, pending (`FRONTEND/.env.example` created, listing `VITE_API_BASE_URL`)

### ADR-008
An invoice stores a copy of the customer's fields as they were when it was saved. It does not reference the customer record.

Reason:
- An invoice is a record of what was billed, to whom, at that time; a later change to the customer must not rewrite it.

Rules:
- A change to a customer never updates their existing invoices.

Status: Accepted, current

### ADR-009
Components change what the page shows through React state. They never read or change the DOM directly (`document.getElementById`, `classList`).

Reason:
- Direct DOM changes are lost or overwritten when React renders again, and the page's state can no longer be read from the component.

Rules:
- New code follows this rule now.
- Field validity and its styling are state, rendered through `className`.
- Mounting the app on `#root` in `main.jsx` is the one exception.

Status: Accepted, pending (the direct DOM changes in `CreatePage.jsx`, `EditPage.jsx`, `InvoicePage.jsx` and `components/TableInvoice.jsx` moved to React state)

### ADR-010
Every API endpoint has tests.

Reason:
- Tests pin every endpoint's answers, so a change that alters one (such as the Schema epic's migration) fails a test instead of shipping unnoticed.

Rules:
- A new or changed endpoint comes with tests for its success and its error answers.
- Tests import `app.js`, which opens no database connection on load.

Status: Accepted, current

### ADR-011
MUI is the component library for the frontend. New screens and components use MUI components; `flowbite-react` is not used in new code.

Reason:
- Two component libraries give the screens two looks and two ways of doing the same thing.
- MUI is already used on more screens than `flowbite-react`, which provides a single Select.

Rules:
- A component MUI provides is taken from MUI, not rebuilt or taken from another library.

Status: Accepted, pending (the `flowbite-react` Select in `InvoicePage.jsx` replaced with MUI)

### ADR-012
Every money amount (line-item price, subtotal, tax, final price) is an integer number of cents in the database and the API; only the frontend's input and display convert to and from dollars.

Reason:
- Floating-point dollars round inconsistently, and tax math compounds the error.

Status: Accepted, current

### ADR-013
A date of service is a calendar date: stored as a Date at UTC midnight, sent and accepted as ISO `YYYY-MM-DD`.

Reason:
- A string date can't be sorted, compared or validated, and a local-time Date shifts the day across time zones.

Status: Accepted, current

### ADR-014
InvoiceMe runs on Azure: the API as a container on Azure Container Apps, the frontend on Azure Static Web Apps, the data on MongoDB Atlas. People sign up and sign in with Microsoft Entra External ID (sign-in for the public, not the workforce Entra ID).

Reason:
- Epic 2 adds sign-in, and the host decides what Epic 4's containers are for, so both are decided once, before any auth code.
- At this scale the Azure stack costs about $0, runs the API's Docker image as it is, and keeps hosting and sign-in under one subscription and one bill.
- Entra External ID is free to 50,000 MAU (as large a free tier as any sign-in option weighed), with email sign-in included.

Options considered (prices read on 2026-11-19, each on the provider's own page):
- Hosting, Azure (azure.microsoft.com/en-us/pricing/details/container-apps/ and …/app-service/static/): Container Apps gives 180,000 vCPU-s, 360,000 GiB-s and 2M requests free per subscription per month, then $0.000024 per vCPU-s and $0.000003 per GiB-s (active rate), and scales to zero with no charge; one 0.25 vCPU / 0.5 GiB replica always active is about $14/month. Static Web Apps: Free (no SLA, 100 GB, 2 custom domains) or Standard at $9/app/month. Chosen.
- Hosting, Render (render.com/pricing): the free web service spins down after 15 minutes idle and takes about a minute to wake (750 h/month); Starter is $7/month (0.5 CPU, 512 MB); static sites are free.
- Hosting, Fly.io (docs.fly.io/about/pricing): no free tier for new organizations; the smallest machine is $2.19/month.
- Hosting, Vercel (vercel.com/pricing, /docs/frameworks/backend/express, /legal/terms §4): Express deploys with no configuration as one function (4.5 MB body, 300 s maximum on Hobby) or as a container; Hobby is for "personal or non-commercial use" only, so going live means Pro at $20/month.
- Hosting, Cloudflare (developers.cloudflare.com: workers/platform/pricing, containers/platform/pricing, workers/runtime-apis/tcp-sockets): static assets are free; Express is not documented on Workers and a TCP socket can't be shared across requests, so the MongoDB driver's connection pool doesn't fit; Containers need Workers Paid ($5/month, which includes 25 GiB-h memory and 375 vCPU-min).
- Data, MongoDB Atlas (mongodb.com/pricing): M0 is free (512 MB, no backups); Flex is $8–$30/month (5 GB); M10 starts at $56.94/month. Chosen at M0 for now.
- Sign-in, Microsoft Entra External ID (azure.microsoft.com/en-us/pricing/details/microsoft-entra-external-id/): free to 50,000 MAU, then $0.03 per MAU; the SMS add-on is $0.03–$0.35 per attempt; requires an Azure subscription. Chosen.
- Sign-in, Clerk (clerk.com/pricing): Hobby is free to 50,000 retained users, with no MFA, Clerk branding and 7-day sessions; Pro is $25/month.
- Sign-in, Auth0 (auth0.com/pricing): Free to 25,000 MAU without Pro MFA; Essentials starts at $35/month for 500 MAU.
- Sign-in, self-built email and password with JWTs: no vendor, but password reset, email verification and sign-in rate limiting become ours to build and secure, and the API would hold password hashes.
- Neither Vercel (Passport is Enterprise-only and guards deployments) nor Cloudflare (Access guards apps for staff) signs in an app's own public users.

Rules:
- The frontend gets an access token from Entra External ID through Microsoft's browser sign-in SDK, and every `/api/v2/` request sends it as `Authorization: Bearer <token>`. The package is chosen when #172 is scoped.
- The API verifies the token itself: signature against Entra's published signing keys, issuer, audience and expiry, and that it carries the API's scope (or app role). A missing or failing token is answered with 401 through `errorMiddleware` (ADR-001). The package is chosen when #171 is scoped.
- The API stores no passwords, and the frontend holds no client secret.
- Entra settings (tenant authority, client ids, API audience and scope) are environment variables, listed in each project's `.env.example` with no real value, and `VITE_`-prefixed on the frontend (ADR-007).
- The test suite stays offline: it signs its tokens with a local test key and makes no call to Entra.

Consequences:
- Epic 4 builds a production image for Azure Container Apps.
- A scaled-to-zero API answers its first request after a cold start, unless a minimum replica is paid for.
- Atlas M0 has no backups; Epic 6 revisits this.
- Running the app locally with sign-in needs an Entra external tenant and app registrations, which the owner sets up and #172's README describes.
- `JWT_SECRET` in `NODEAPI/.env.example` is used by nothing; #171 removes it.
- Which token claim identifies the user is set in #171.

Status: Accepted, pending (#171 and #172 implement it)
