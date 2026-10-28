# InvoiceMe

A customer and invoice tracking web application for small businesses: it keeps their customers in one place and turns a job into an invoice they can save and download as a PDF. React frontend, Express API, MongoDB; runs locally only.

## Repository facts

- Stack: three npm projects, no workspaces: the root (dev scripts only), `FRONTEND/` (React + Vite + Tailwind 4 + MUI, ES modules) and `NODEAPI/` (Express + Mongoose, CommonJS). Node.js 20.19 or later
- GitHub: MatheusCastro99/InvoiceMe (public). Default branch: `master`
- CI on every PR: "Node.js CI" (frontend lint and build, API syntax and load check, API tests, on Node 22.x and 24.x) and CodeQL
- Project config for the harness: `.claude/harness.json` (checks, docs, CI checks)

## Where things are

Docs are read when the work needs them, never all up front.

- `FRONTEND/src/pages/` — one file per route; `FRONTEND/src/components/` — tables, cards, the PDF document
- `FRONTEND/src/config/apiConfig.js` — every API URL, as `API_ENDPOINTS`
- `NODEAPI/app.js` — the Express app, with no side effects (loads without a database); `server.js` connects and listens
- `NODEAPI/{routes,controllers,models,middlewares,utils}/` — one router and controller per resource under `/api/v1/`; validators, error classes, the tax table and the response messages in `utils/`
- `Harness_Config/Context/Decisions_Consistency.md` — the standing rules (ADRs) and their status; read the ADRs a change touches
- `Harness_Config/Context/Architecture_Design.md` — structure and key files; `DataFlow.md` — how a request moves and fails
- `Harness_Config/Context/UI_Guidelines.md` — the UI authority (essentials in `.claude/rules/ui.md`)
- `Docs/README.md`, `Docs/PRD.md`, `Docs/Project_Vision.md`, `Docs/Project_Roadmap.md` — the public project docs
- `NODEAPI/API_DOCUMENTATION.md` — the API reference; `NODEAPI/VersionLog.md` — the API's change log

## Commands

Run project checks through the runner, never by hand: `node .claude/scripts/check.cjs <fast|full|id>`. It keeps the real exit code and trims the output. Check IDs are in `.claude/harness.json`; `api-load` checks that `app.js` loads without opening a database connection.

- Install: `npm install` in the root, `NODEAPI/` and `FRONTEND/`; copy `NODEAPI/.env.example` to `NODEAPI/.env`
- Run everything: `npm run dev` from the root (API on port 3000, then the frontend on 5173)
- Tests: `npm test` in `NODEAPI/` runs the Jest + Supertest suite on an in-memory MongoDB (no `.env` or database needed; `npm install` downloads a MongoDB binary the first time), or `node .claude/scripts/check.cjs api-test`. Also `npm run test:watch` and `npm run test:coverage`. Each sub-phase names an observable check, automated through the runner where possible.

## Workflow

Every issue goes through the harness skills, in order. Each block ends where its skill says.

- **Standard:**
  1. `/scope <n>` — plan mode, one plan, gate G1
  2. `build` — autonomous, forked on a Sonnet `builder`; draft PR and handoff. After G1 and `/clear`, "continue <n>" means: invoke `build` for <n> at once. The fork reads the plan; don't read it first or wait for a go.
  3. a fresh Opus session: `/review <n>` — red-team, gate G2
  4. the owner merges, then `/close <n>`
- **Small:** `/scope <n> small` — the same gates, in one session. When the forked build returns, run `review` here: the approved plan's tier decides, not the fork's reply.

Working state lives in `.harness/work/<n>/` (gitignored). The approved plan and the handoff are also posted to the issue. If `.harness/work/<n>/BLOCKED` exists, stop and tell the owner.

When the forked build's reply has a `MAIN SESSION:` line, do what it says before you reply: the fork can't reach the app's PR tools. It drives the browser pane and runs the UI check itself.

Project skills: `guardrails-review` checks a change against the ADRs (the red-team preloads it); `ux-design` reviews interface and copy changes. `frontend-design` guides visual design on UI sub-phases, with `UI_Guidelines.md` as its brief; it is vendored from Anthropic and pinned by the harness installer, so don't edit it here (trial T7).

## Standing rules

The full rules and their status are in `Decisions_Consistency.md`. A pending rule is a target: new code follows it; existing code is brought in line only by an issue that says so. Frontend rules are in `.claude/rules/ui.md`.

- Every `/api/v1/` request takes one path: router, validation middleware where the route has one, a controller wrapped in `express-async-handler`, the Mongoose model. Controllers, middlewares and validators throw the error classes in `NODEAPI/utils/errors.js` and never call `res.status(4xx|5xx)`; `errorMiddleware` builds every error answer. Success answers `{ success: true, data, message? }` (ADR-001).
- A new endpoint adds its route in `NODEAPI/routes/` and its entry in `API_ENDPOINTS` in the same change (ADR-002).
- The server's validators in `NODEAPI/utils/validators.js` are the source of truth; a validation change is made there first, and the client never accepts what the server rejects, or rejects what it accepts (ADR-003).
- The server computes the tax rate and the final price, from `STATE_TAX_RATES` only; the frontend may derive only the displayed subtotal and tax line (ADR-004).
- User-facing API messages come from `RESPONSE_MESSAGES` in `NODEAPI/utils/constants.js` (ADR-005).
- API files are camelCase with their role as suffix; stored-resource handlers are `getX`/`postX`/`updateX`/`delX`; models export `XModel`; new files open with a JSDoc banner and routes carry `@route` (ADR-006).
- Configuration comes from environment variables; a new one is added to its project's `.env.example` in the same change, with no real value; frontend variables start with `VITE_` (ADR-007).
- An invoice stores a copy of the customer's fields; a customer change never updates existing invoices (ADR-008).
- A new or changed endpoint comes with tests for its success and error answers (ADR-010).
- Put new code where `Architecture_Design.md` says it belongs. Prefer small, plain changes: no files, abstractions or dependencies the issue didn't ask for.

## Working agreements

1. The owner makes every project decision: scope, architecture, product, priorities, wording. Recommend; never assume or decide.
2. A decision that affects direction or scope comes as 2–3 options, one marked recommended, each with trade-offs and why it fits this project. Asked for a recommendation, give one clear pick. A large piece of work comes with a recommendation to split it into more issues.
3. Say so when a path looks sub-optimal, and recommend an alternative from evidence. Still don't choose.
4. Anything the plan doesn't cover stops the work: a behaviour change, a new dependency, a scope change. Ask first. A scope change goes into the issue before it goes into the code.
5. Fix what was asked and name what else you found. The owner decides whether the scope grows.
6. For each finding, before proposing a fix: can it be reached today? Does it affect the people who use the project? Is the fix worth its cost? The owner decides on every finding. The same check applies to an issue's acceptance criteria: flag one that conflicts with how the project is used; don't implement it literally.
7. Verify a claim before relying on it (a small test, the source file); don't trust memory.
8. For small implementation choices (naming, formatting), take a reasonable default and proceed.
9. Standing rules belong to the owner. Propose or draft one; don't add, reword or change one yourself, or its status. Directional decisions go on the issue, as a comment titled "Scope decisions (<date>)".

## Branches and commits

- One issue, one branch, one PR into `master`: `<type>/<n>-<short-name>`, with `feat`, `fix`, `docs` or `chore`. When planning spans several issues, the planning docs get their own small PR, merged before the first issue starts.
- One commit per sub-phase: `<type>: <summary> (#<n>)`. Docs that a change makes untrue are updated in the same commit.
- Pushing a feature branch, opening a **draft** PR and commenting on the issue are pre-authorized. Never push to the default branch, force-push, or merge: the owner merges.

## Safety

- Public repository: no secrets (`NODEAPI/.env`, a connection string, a key), no personal notes, no unfixed security findings in commits, comments or PRs. Report security findings to the owner directly.
- Never edit the hooks, `.claude/scripts/` or `harness.json` to make a check pass.

## Compact instructions

When compacting, keep: the issue number and tier, the plan's sub-phase list with each one's status, the last check results, the open owner decisions, and any BLOCKED state. Drop file contents and tool output.
