CLAUDE.md — Repository guidance for Claude Code and subagents

Purpose
-------
This file tells Claude Code and its subagents how to work in this repository: the essential project facts, the documents to load before making changes, and the rules for the main session and every subagent.

Repository facts
----------------
- InvoiceMe: customer and invoice tracking for small businesses.
- GitHub: MatheusCastro99/InvoiceMe. Default branch: `master`.
- Three npm projects, no workspaces: `FRONTEND/` (React 19, Vite 8, Tailwind CSS 4), `NODEAPI/` (Express 5, Mongoose 9, CommonJS), and the root `package.json` (scripts only).
- Requires Node.js 20.19 or later and a MongoDB instance. The API reads `NODEAPI/.env` (copy it from `NODEAPI/.env.example`; never commit it).

Authoritative docs (always load before making edits)
----------------------------------------------------
When planning or making changes, read these first and follow them:
- Harness_Config/AI_CONTEXT.md, and every page it links to under Harness_Config/Context/
- Docs/Project_Vision.md and Docs/Project_Roadmap.md
- The GitHub issue being worked and its comments (`gh issue view <n> --comments`); decided scope is recorded there.

Commands
--------
- Install: `npm install`, `npm --prefix NODEAPI install`, `npm --prefix FRONTEND install`
- Run both, from the root: `npm run dev` (API on http://localhost:3000, frontend on http://localhost:5173)
- Frontend checks: `npm --prefix FRONTEND run lint` (zero warnings allowed), `npm --prefix FRONTEND run build`
- API checks: `node --check NODEAPI/server.js`, and loading `NODEAPI/app.js` must not open a database connection (see `.github/workflows/node.js.yml`)
- Tests: none yet. `npm test` in NODEAPI is a placeholder that fails. Jest or Supertest is planned.

Workflow
--------
Every issue goes through these stages, in order. Say which stage the work is in when reporting.
1. Gather all relevant information.
2. Settle open questions and decisions. (owner's approval)
3. Plan the issue's sub-phases. (owner's approval)
4. Plan the implementation of each sub-phase. (owner's approval: the go-ahead to implement)
5. Implement one sub-phase.
6. Test and refine. Commit the sub-phase once its checks pass, and report it.
7. Open a PR, and monitor CI and comments with Auto-fix on. (owner's approval: the push and the PR)
8. Last pass and red-team scan.
9. Fix comments and findings: triage each one. (owner's approval)
10. Historian doc pass. (owner's approval)
11. Ready to merge: a note that the PR is ready.
12. Memory flush, only at an epic's close-out or after an isolated issue. (owner's approval)

At a stage marked (owner's approval), report and wait; at the others, report and go on. Do not jump a stage. Details and loops: `Harness_Config/Context/Development_Workflow.md`.

AI tooling (Claude Code)
------------------------
Runnable definitions live in `.claude/agents/` and `.claude/skills/`, which are gitignored (the owner's local tooling).

Subagents:
- red-team: independent adversarial reviewer, read-only. Reviews a finished change against the issue and the standing rules.
- historian: pre-merge doc updater. Applies the stale-docs list, checks each entry against the repository, and reports anything beyond the list without editing it. Never commits.

Skills:
- guardrails-review: checks a change against the ADRs in `Harness_Config/Context/Decisions_Consistency.md`.
- ux-design: reviews interface changes against `Harness_Config/Context/UI_Guidelines.md`.

Subagent invocation
-------------------
- Brief a subagent with: the goal (issue number and decided scope), the target (branch, commit range or PR), the constraints (what is out of scope), and the expected deliverable.
- Agents and skills recommend; the owner makes every decision.

Code rules
----------
- Follow the standing rules in `Harness_Config/Context/Decisions_Consistency.md`. Do not add, reword or change the status of a rule without the owner.
- Follow the patterns already in the code before adding a new one. New interface work uses Tailwind.
- Do not change behaviour the issue's plan does not cover; stop and ask.

Documentation rules
-------------------
- Keep a running stale-docs list for each PR in `.claude/stale-docs.md` (gitignored): ID, file and location, what is stale, what it should say, evidence.
- Before the merge, the historian applies the list; the owner reviews its diff against the list and the change.
- Documents in scope: `README.md`, `CLAUDE.md`, `Docs/`, `Harness_Config/`.

Branching and commits
---------------------
- One issue, one branch, one PR, branched from `master` and squash-merged.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, …), one commit per sub-phase, naming the issue: `feat: add customer search (#12)`.
- Never commit to `master` directly.

Safety and privacy
------------------
- The repository is on GitHub. Never commit secrets: `.env`, connection strings, keys.
- Report an unfixed security finding to the owner directly; do not write it in an issue, a comment or a PR until its fix has landed.

Contacting the user
-------------------
- For decisions that affect direction or scope, present 2–3 options with trade-offs, mark one as recommended, and wait.
- Say so when a path looks sub-optimal, and recommend an alternative; the owner still decides.
- Confirm each outward-facing action (issues, comments, pushes, PRs) before taking it.
- For small implementation choices (naming, formatting), take a reasonable default and proceed.

Change log
----------
- 2026-10-20: Initial CLAUDE.md added during the harness onboarding.
