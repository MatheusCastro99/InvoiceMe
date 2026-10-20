# Decisions

Last updated: 2026-10-20

The standing rules every change to InvoiceMe must follow. A one-off choice is not a rule: it goes in its issue or pull request.

The rules belong to the owner. The main session may propose or draft one; it does not add, reword, or change the status of one on its own ([Working Agreements](Working_Agreements.md)).

Statuses:

| Status | Meaning |
|---|---|
| `Accepted, current` | In force now. Expected to change as the project grows. |
| `Accepted, permanent` | In force, and not expected to change. |
| `Accepted, pending (<what it waits for>)` | Decided, not in force yet. The code may not follow it until the named work lands. |
| `Proposed, needs the owner` | Drawn from a pattern in the code during onboarding. Not in force until the owner accepts it. This status is temporary and goes away once each rule is decided. |

### ADR-001
Every API request takes one path: route → validation middleware (for writes) → controller → Mongoose model. Every controller is wrapped in `asyncHandler`, and every error reaches the client through `errorMiddleware`.

Reason:
- One path means one place to add a check, and one error format for the frontend to read.

Rules:
- A controller throws an `AppError` subclass from `utils/errors.js`; it never writes an error response itself.
- A success response is `{ success: true, message?, data, count? | pagination? }`.
- An error response is `{ success: false, message, statusCode, errors? }`, with `stack` only when `NODE_ENV` is `development`.
- Response messages come from `RESPONSE_MESSAGES` in `utils/constants.js`.

Status: Proposed, needs the owner

### ADR-002
The frontend builds every API URL from `API_ENDPOINTS` in `FRONTEND/src/config/apiConfig.js`. The base URL comes from `VITE_API_BASE_URL`.

Reason:
- One place to change an endpoint or the API's address for another environment.

Status: Proposed, needs the owner

### ADR-003
Validation is layered: user input is checked in the interface before it is sent, and again on the server before it reaches the database. `CreatePage.jsx` is the pattern to follow for forms.

Reason:
- The interface tells the user what to correct before a request is sent; the server protects the database from any client.

Rules:
- Each validated field has its own validator on `onBlur`, which sets a validity flag in state, marks the field with a red or green border, and shows a toast with the expected format when it fails.
- Submit checks every validity flag and blocks the request until all are valid.
- Every write route has a validation middleware backed by `utils/validators.js`.

Status: Accepted, current

### ADR-004
Non-operational numbers (phone numbers, dates, invoice numbers) are strings. Operational numbers (prices, taxes) are numbers. Dates, prices, phone numbers, emails and the like are checked and formatted with regex.

Reason:
- Stated by the owner in `HomePage.jsx`. The models follow it: `phoneNumber`, `dateOfService` and `invoiceNumber` are `String`; `finalPrice`, `taxRate` and `subtotal` are `Number`.

Status: Accepted, current

### ADR-005
An invoice carries its own copy of the customer's contact and address fields, with no reference to the Customer.

Reason:
- The customer's details prefill the invoice, so the user does not have to enter them by hand.

Status: Accepted, current

### ADR-006
Tailwind CSS is the default for new interface work.

Reason:
- The owner's choice. The interface currently mixes Tailwind, MUI and flowbite-react. **Needs the owner:** whether existing MUI and flowbite-react components stay, or are replaced over time.

Status: Accepted, current

### ADR-007
Debug endpoints, such as `/debug/db`, exist only in development.

Reason:
- `/debug/db` shows the database connection state and name to anyone who can reach the API.

Status: Accepted, pending (a guard that disables `/debug/db` outside development; today it answers in every environment)

### ADR-008
`app.js` has no side effects on require: no database connection and no listening port. `server.js` does the bootstrapping.

Reason:
- Tests can load the app without a database. CI fails if loading `app.js` opens a connection.

Status: Proposed, needs the owner

### ADR-009
Secrets and environment settings live in `NODEAPI/.env`, which is never committed. `NODEAPI/.env.example` lists every variable the API reads, with a placeholder value.

Reason:
- The connection string carries database credentials.

Status: Proposed, needs the owner
