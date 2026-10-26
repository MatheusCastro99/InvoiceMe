---
name: guardrails-review
description: InvoiceMe's project-specific review checklist. Covers the checks behind each standing rule, the known regression traps, the verification limits and a severity scale for findings and tech debt. Use when reviewing a diff or pull request, evaluating a design or refactor, or deciding whether tech debt should be fixed now. Preloaded by the red-team agent.
---

# Guardrails Review

This is the checklist for judging a change against **this project's** rules rather than generic taste. It holds the procedure and the traps. The rules themselves live in the project's documents, so read those instead of trusting any restatement here.

## 1. Load the rules first

Read these before judging anything. If a check below disagrees with them, the documents win. Say so in the output so this skill can be fixed.

- `Harness_Config/Context/Decisions_Consistency.md`: the standing rules and their current status
- `.claude/CLAUDE.md`: what the project is, and the working agreements
- The issue and its plan: what is being worked on, and what is out of scope

A rule whose status says it is not in force yet (pending) describes a target, not the current state. Don't report the gap as a defect unless the change under review claims to close it. A change that moves the code further from that target is a finding.

## 2. Project checks

Confirm each check with evidence from the code (`file:line`), not from memory.

### Request path and errors (ADR-001, ADR-005)
- A new resource router is mounted under `/api/v1/` in `NODEAPI/app.js`, before the 404 handler and `errorMiddleware`.
- Every handler in `NODEAPI/controllers/` is wrapped in `asyncHandler`.
- Errors are thrown as classes from `NODEAPI/utils/errors.js`; search the diff for `res.status(4` and `res.status(5` in controllers, middlewares and validators.
- Successful answers carry `success` and `data`; error answers from `/api/v1/` handlers come only from `NODEAPI/middlewares/errorMiddleware.js` (the 404 handler in `app.js` is the one exception).
- New user-facing messages are added to `RESPONSE_MESSAGES` in `NODEAPI/utils/constants.js`, not written as literals.

### Frontend API calls (ADR-002)
- No page or component in `FRONTEND/src/` writes an API URL as a string; search the diff outside `apiConfig.js` for `http://`, `localhost` and `/api/`.
- A new route in `NODEAPI/routes/` has its entry in `API_ENDPOINTS` in `FRONTEND/src/config/apiConfig.js`, in the same change.

### Validation (ADR-003)
- A changed validation rule is changed in `NODEAPI/utils/validators.js`, and the route applies it through `NODEAPI/middlewares/validationMiddleware.js` or the controller's own checks.
- A client check added or changed in `CreatePage.jsx`, `EditPage.jsx` or `InvoicePage.jsx` accepts and rejects the same input as `validators.js`.

### Tax and totals (ADR-004)
- The frontend computes no tax rate or final price; it reads them from `/api/v1/tax/rate` and `/api/v1/tax/calculate`. A displayed subtotal or tax line derived from them is allowed.
- A tax rate exists only in `STATE_TAX_RATES` in `NODEAPI/utils/constants.js`.

### Naming (ADR-006)
- New API files are camelCase with their role as suffix, handlers follow `getX`/`postX`/`updateX`/`delX` for stored resources, models are exported as `XModel`.
- New route, controller, middleware and utility files open with a JSDoc banner, and new routes carry `@route` JSDoc.

### Configuration and secrets (ADR-007)
- The diff holds no connection string, password or key, and does not add `NODEAPI/.env`.
- A new `process.env` variable is listed in `NODEAPI/.env.example`; a new `import.meta.env` variable starts with `VITE_` and is listed in `FRONTEND/.env.example`.

### Invoices (ADR-008)
- `NODEAPI/models/invoiceModel.js` keeps its own copy of the customer's fields, and a customer update in `customerController.js` does not touch invoices.

### Frontend state and components (ADR-009, ADR-011)
- New or changed code in `FRONTEND/src/` adds no `document.getElementById`, `querySelector` or `classList` call.
- New screens and components use MUI components, and add no `flowbite-react` import.

### Tests (ADR-010)
- Pending until `NODEAPI` has a test runner. A change that adds the runner, or claims to close ADR-010, comes with tests for each endpoint's success and error answers, importing `NODEAPI/app.js`.

### Simplicity
- The following are **not** defects: a global state store, a data-fetching library, TypeScript, and a service or repository layer between controllers and models. Recommend one only when a concrete, present problem needs it, and name that problem.
- Prefer the simplest change that fits. Speculative future-proofing is a finding in its own right.

## 3. Known regression traps

These have already happened in this project. Check the change against each one.

- None recorded yet.

## 4. Verification you can do

- Build: `node .claude/scripts/check.cjs full` runs the frontend lint (zero warnings allowed) and build, `node --check server.js` and the `app.js` load check, the same as CI. Report new warnings, not just errors.
- Tests: `node .claude/scripts/check.cjs api-test` runs the NODEAPI Jest suite on an in-memory MongoDB: the harness isolation test and the `/health` smoke test so far. Endpoint tests come with #73.
- The owner checks by hand: the change in the running app, their own way, before the merge. Don't list those paths as "needs testing". List only what the tests and that pass would miss: invalid or unknown ids, empty optional fields, a duplicate phone number, a state missing from `STATE_TAX_RATES`, an invoice with many line items, and MongoDB being unreachable.

## 5. Severity scale (findings and tech debt)

Sections 5 and 6 apply when this skill is used inline. The red-team agent uses its own scoring and output instead.

| Level | Meaning | Examples here | Action |
|---|---|---|---|
| **Critical** | Wrong or lost data, a crash, exposed secrets, or a broken standing rule | A connection string committed (ADR-007); a customer update that rewrites saved invoices (ADR-008); a final price computed in the frontend instead of by the server (ADR-004) | Fix before merge |
| **Major** | A real reliability or maintainability risk | An API URL written in a page (ADR-002); a new client check that disagrees with `validators.js` (ADR-003); a controller that answers an error itself (ADR-001) | Fix before the next issue |
| **Minor** | Friction, clarity, naming | A handler named outside the pattern (ADR-006); a leftover `console.log` | Mention; fix if cheap |
| **Accepted trade-off** | Intentional, per the documents | The existing code that a pending rule (ADR-003, ADR-005, ADR-007, ADR-009, ADR-010, ADR-011) has not brought in line yet; the project runs locally only | Don't raise it again |

## 6. Output

- **Verdict:** Approve / Approve with changes / Rework recommended
- **Findings:** list them most severe first. Each one gets a title, the evidence (`file:line`), its impact, a fix, the severity, and the rule or trap it violates.
- **Verification results**
- **Edge cases for manual check** (only the kind named in section 4)
- **Docs made stale** by the change (file and section) that the change did not update.

These are recommendations. The project owner makes every decision, including the status of a standing rule.
