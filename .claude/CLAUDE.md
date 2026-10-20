CLAUDE.md — Repository guidance for claude-code and subagents

Purpose
-------
This file tells claude-code and local subagents how to work in this repository. It collects the essential project facts, the documents that must be loaded before making changes, the commands that verify a change, and the behavioral rules for the main session and all subagents.

Repository facts
---------------
- Repo root: the directory containing `README.md`, `FRONTEND/` and `NODEAPI/`
- GitHub: MatheusCastro99/InvoiceMe; default branch `master`
- InvoiceMe: a customer and invoice tracking web application for small businesses
- Three npm projects, no workspaces: the root (dev scripts only), `FRONTEND/` (React + Vite + Tailwind, ES modules) and `NODEAPI/` (Express + Mongoose, CommonJS)
- Node.js 20.19 or later. Runs locally only.
- `Docs/` holds the project documents; `Harness_Config/` holds the context documents.

Authoritative docs (always load before making edits)
---------------------------------------------------
When planning or making changes, the agent MUST read these files first and follow them:
- Harness_Config/AI_CONTEXT.md
- Harness_Config/Context/*
- Docs/Project_Vision.md
- Docs/PRD.md
- Docs/Project_Roadmap.md
- The GitHub issue being worked and its comments (`gh issue view <n> --comments`); the owner records decided scope there.

Workflow
--------
Every issue goes through these stages, in order. Say which stage we are in when reporting.
1. Gather all relevant information.
2. Settle open questions and decisions. (owner's approval)
3. Plan the issue's sub-phases. (owner's approval)
4. Plan the implementation of each sub-phase. (owner's approval: the go-ahead to implement)
5. Implement one sub-phase.
6. Test and refine. Commit the sub-phase once its checks pass, and report it.
7. Open a PR, and monitor CI and comments with Auto-fix on. (owner's approval: the push and the PR)
8. Last pass and red-team scan. Starts as soon as the PR is verified open.
9. Fix comments and findings: triage each one. (owner's approval)
10. Historian doc pass. (owner's approval)
11. Ready to merge: a note that the PR is ready.
12. Memory flush, only at an epic's close-out or after an isolated issue. (owner's approval)

Loops: stage 4 repeats for every sub-phase; stages 5 and 6 repeat for every sub-phase; the fixes approved at stage 9 loop back to stage 4, at most twice. Details in `Harness_Config/Context/Development_Workflow.md`.

At a stage marked (owner's approval), report and wait; at the others, report and go on. Do not jump a stage. A scope change during implementation goes into the issue before the code.

Commands
--------
- Install: `npm install` in the root, `NODEAPI/` and `FRONTEND/`; copy `NODEAPI/.env.example` to `NODEAPI/.env`
- Run everything: `npm run dev` from the root (API on port 3000, then the frontend on 5173)
- Checks to run at stage 6, the same as CI:
  - `npm --prefix FRONTEND run lint` (zero warnings allowed)
  - `npm --prefix FRONTEND run build`
  - In `NODEAPI/`: `node --check server.js`, then load `app.js` and confirm it opens no database connection (see `.github/workflows/node.js.yml`)
- There are no tests yet; `npm test` in `NODEAPI/` is a stub (ADR-010, pending).

AI tooling (Claude Code)
------------------------
Runnable definitions live in `.claude/agents/` and `.claude/skills/` (gitignored, maintainer's personal tooling).

Subagents:
- red-team — independent adversarial reviewer, read-only. Reviews a finished change against the issue, the decisions and the context documents, and returns scored findings.
- historian — pre-merge doc updater. Applies the main session's stale-docs list, checks each item against the repository, reports anything beyond the list without editing it. Never commits.

Skills:
- guardrails-review — checks a change against the decisions, by ADR number. The red-team preloads it.
- ux-design — reviews interface and copy changes against `Harness_Config/Context/UI_Guidelines.md`.

Subagent invocation
-------------------
- Brief the subagent with: goal (issue number and decided scope), target (branch, commit range or PR), constraints (out-of-scope items), and expected deliverable.
- Agents and skills recommend; the maintainer makes every decision.
- Always return a concise summary and list of modified files before committing.

Code rules
----------
- Follow the standing rules in `Harness_Config/Context/Decisions_Consistency.md`. A change that needs a new rule, or breaks one, stops for the owner.
- Put new code where `Harness_Config/Context/Architecture_Design.md` says it belongs; do not build a second home for something that has one.
- Prefer small, plain changes. Do not add files, abstractions or dependencies the issue did not ask for.

Documentation rules
-------------------
- The main session keeps a running stale-docs list per PR (ID, file and location, what's stale, what it should say, evidence), in `.claude/stale-docs.md` when the work spans several sessions.
- Right before merge, the historian subagent applies the list to `README.md`, `Docs/`, `Harness_Config/` and `NODEAPI/.env.example`; the maintainer reviews its diff against the list and the change. The historian only reports this file when it is stale; the main session updates it.
- Keep `README.md`, `Docs/`, `Harness_Config/`, `.claude/CLAUDE.md` and `NODEAPI/.env.example` consistent with the code.

Branching and commits
---------------------
- One issue, one branch, one PR into `master`. Branches are named `<type>/<issue>-<name>`, for example `feat/12-edit-invoice`.
- Commit messages follow Conventional Commits and name the issue: `feat: add invoice editing (#12)`.
- One commit per sub-phase.

Safety and privacy
------------------
- Never commit `NODEAPI/.env`, a connection string or a secret (ADR-007).
- An unfixed security finding goes to the owner directly, not into an issue, a comment or a PR.

Contacting the user
-------------------
- For decisions that affect direction or scope, present options (2–3) with trade-offs, mark one as recommended, and wait.
- Confirm each outward-facing action (issues, comments, pushes, PRs) before taking it.
- For small implementation choices (naming, formatting) prefer reasonable defaults and proceed.

Change log
----------
- 2026-10-20: Initial CLAUDE.md added by the harness onboarding.
