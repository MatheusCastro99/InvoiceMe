# red-team: Agent Documentation

The runnable definition is `.claude/agents/red-team.md`. It's gitignored (the maintainer's personal tooling, ADR-009), so this page is the public record of its design. The runnable file is the source of truth for the prompt.

## Why it exists

Its value is **independence**: a fresh context with no stake in the code, challenging work the main session wrote. The main session is the worst-placed reviewer of its own change. The red team starts cold, assumes the change can be broken, and reports only what's worth fixing, each finding scored and backed by evidence.

## When to use it

- Step 9 of the issue workflow: the last pass before the PR goes to the owner
- When a design needs an independent challenge (for example, the Schema epic's money and date migration plan)

## When not to

- Small, mechanical changes, where rebuilding the context costs more than the review returns
- Work the main session still has open. It reviews finished work, not work in progress.

## Configuration

| Field | Value | Why |
|---|---|---|
| `tools` | Read, Grep, Glob, Bash | No Edit or Write. Bash is for `git`/`gh` inspection, `npm test`, lint and build, and throwaway probes in the OS temp directory. "Read-only" is enforced by the prompt, not by permissions |
| `model` | opus | Adversarial review is where depth matters most; the trade-off is cost per run |
| `effort` | high | Same reason |
| `skills` | review-guardrails | Reviews against InvoiceMe's ADRs and reproduced traps, not generic taste. See [review-guardrails](../Skills/review-guardrails.md) |
| No `Agent` tool | — | It can't spawn other agents; it returns one report |

## Brief it with

The goal (issue number and decided scope), the target (branch, commit range, PR or design doc), the constraints (ADRs in play, anything out of scope), and any prior findings on a re-review.

## Output

- A verdict for each dimension: goal, architecture and implementation.
- Findings scored by **Severity + Confidence + Impact − Fix cost**, with `file:line` evidence. A score of 12–14 is Critical, 10–11 High, 7–9 Medium and 4–6 Low; findings scoring 3 or less aren't reported. Wrong money amounts, data loss, broken ADRs and exposed secrets are always escalated.
- The verification results, edge cases for the owner's manual check, and issues next to the change that already existed.
- **Docs made stale**, which feeds the historian's stale-docs list.

It reviews the same change at most twice. It recommends; the owner decides.

## History

- 2026-09-25: Created for InvoiceMe, based on BabyBuddyHelper's red-team agent: the same process, scoring, output and authority model. The checks were changed from .NET MAUI to Express + Mongoose (money in cents, UTC dates, mass assignment, Mongo operator injection, 500s for client errors, `test.failing` narrowness, and CI that can go green without running tests).
- 2026-09-25: Probes re-keyed to the rewritten `Decisions.md` (money is ADR-006, dates ADR-007).
