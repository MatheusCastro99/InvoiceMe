# Decisions

Last updated: 2026-10-26

The standing rules every change to InvoiceMe must follow. A one-off choice is not a rule: it goes in its issue or pull request.

### ADR-001
Every request to a resource under `/api/v1/` takes one path: router, validation middleware where the route has one, controller wrapped in `express-async-handler`, Mongoose model where the resource is stored. Errors are thrown as the error classes in `NODEAPI/utils/errors.js` and answered by `errorMiddleware`.

Reason:
- One path means one place to add a check, and one shape for every answer the frontend reads.
- A controller that answers an error itself bypasses the logging and the error shape.

Rules:
- A success answers `{ success: true, data, message? }`; a list may add `count` or `pagination`.
- An error answers `{ success: false, message, statusCode, errors? }`, built by `errorMiddleware`.
- A controller, middleware or validator never calls `res.status(4xx|5xx)` itself; it throws `ValidationError`, `NotFoundError`, `ConflictError` or another `AppError` subclass.
- Resource routes are mounted under `/api/v1/`. Only `/`, `/health`, `/debug/db` and the 404 handler live outside it, in `app.js`.

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
- The client and the server validate today with rules of their own, and they disagree: the client requires email and ZIP, which the server accepts empty; the client allows company-name characters and lengths the server rejects, does not check the state's format, and requires separators in phone numbers that the server treats as optional.
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
- The frontend gets the rate and the final price from `/api/v1/tax/rate` and `/api/v1/tax/calculate`, and never computes either itself.
- The frontend may derive what it only displays from those figures: the subtotal of the line items, and the tax line (subtotal × rate).

Status: Accepted, current

### ADR-005
User-facing messages from the API come from `RESPONSE_MESSAGES` in `NODEAPI/utils/constants.js`.

Reason:
- One place to read and change what the user is told.

Status: Accepted, pending (the literal messages in `controllers/taxController.js` and `utils/validators.js` moved to `RESPONSE_MESSAGES`)

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

Status: Accepted, pending (the Schema epic converts the model, the API and the frontend; today `subtotal` and `finalPrice` are `Number` dollars)

### ADR-013
A date of service is a calendar date: stored as a Date at UTC midnight, sent and accepted as ISO `YYYY-MM-DD`.

Reason:
- A string date can't be sorted, compared or validated, and a local-time Date shifts the day across time zones.

Status: Accepted, pending (the Schema epic; today `dateOfService` is a String and only its presence is checked, see #70)
