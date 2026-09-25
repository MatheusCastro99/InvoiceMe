# Current Architectural Decisions

### ADR-001
Every API call follows one fixed path, from the user's click to MongoDB and back.

Request path:
Page or component (a click; deletes ask for confirmation through SweetAlert2 first)
-> axios, with a URL from `API_ENDPOINTS` (ADR-005)
-> `app.js` (JSON body parsing, CORS)
-> route
-> validation middleware (on customer and invoice create/update)
-> controller
-> Mongoose model
-> MongoDB

Tax endpoints stop at the controller; they don't touch the database.

Response path:
MongoDB returns the result
-> the controller sends the response envelope (ADR-002)
-> axios resolves
-> the page reads the payload from `data`
-> the page updates its local state, confirms with `toast.success`, then navigates or re-fetches

Failure path:
Validation middleware or a controller throws an `AppError` (ADR-003), or anything else throws
-> `errorMiddleware` sends `{ success: false, ... }`
-> axios rejects
-> the page reports it with `toast.error`

Read path:
Pages fetch what they need on mount and keep it in local component state.
There's no client-side cache or global store, so the API is the only source of truth.

Rules:
- No layer is skipped. Pages don't hardcode URLs, routes don't contain logic, and only controllers touch Mongoose models.
- Nothing reaches MongoDB except through a controller.

Reason:
- Each concern has one home: URLs, validation, business logic, persistence and error shaping.
- Input is validated before any business logic or database access.
- The UI shows what the API returned, never its own copy of the data.

Diagrams: docs/save-workflows.md

Status: Accepted, current.

### ADR-002
Every `/api` response is JSON with a `success` flag.
- Success: `{ success: true, data, message?, pagination? | count? }`
- Failure: `{ success: false, message, ... }`, shaped only by the two terminal handlers in `app.js`: the 404 handler and `errorMiddleware` (which adds `statusCode` and `errors?`).

Reason:
- The frontend is the only client and reads one shape.
- Controllers never build error JSON by hand.

Status: Accepted, current.

### ADR-003
Expected failures are thrown (or passed to `next`) as an `AppError` subclass from `utils/errors.js`.
`errorMiddleware` turns the error's `statusCode` into the response. Any error without a `statusCode` becomes a 500.

Reason:
- One place maps errors to HTTP status codes.
- A 500 then always means "unexpected", never "the client sent bad input".

Status: Accepted, current.

### ADR-004
`app.js` builds and exports the Express app and nothing else: no database connection and no `listen()`.
`server.js` is the only bootstrap (environment, MongoDB connection, listen).

Reason:
- Tests import the app without a database or an open port.
- CI loads the composed app and fails if it opens a connection.

Status: Accepted, permanent.

### ADR-005
The frontend builds every API URL from `API_ENDPOINTS` in `FRONTEND/src/config/apiConfig.js`.
The base URL comes from `VITE_API_BASE_URL`.

Reason:
- The base URL and API version live in one place, so moving to a new API version touches one file.

Status: Accepted, current.

### ADR-006
Money is integer cents end to end: stored, computed and sent over the API.
The server computes totals and tax, with one rounding rule in one place. Clients only format cents for display.

Reason:
- Floats can't represent most decimal amounts exactly.
- One rounding path means stored and displayed totals can't disagree.

Status: Accepted, pending (Schema epic).

### ADR-007
Date-only values (such as `dateOfService`) are Mongoose `Date` at UTC midnight, read with UTC accessors,
and sent over the API as ISO `YYYY-MM-DD`.

Reason:
- The database can sort and range-query them.
- UTC midnight keeps the day from shifting to the previous one for users west of UTC.

Status: Accepted, pending (Schema epic).

### ADR-008
Secrets are never committed.
- Real values live in untracked `.env` files (`NODEAPI/.env`, `FRONTEND/.env.local`).
- `.env.example` holds placeholders only.
- `VITE_*` variables are bundled into the browser build, so they're public and never hold secrets.

Status: Accepted, permanent.

### ADR-009
Runnable agent and skill definitions in `.claude/` are gitignored; their documentation in `AI_Environment/` is public.

Status: Accepted, pending (agent-files PR).
