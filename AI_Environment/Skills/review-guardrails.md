# review-guardrails: Skill Documentation

The runnable definition is `.claude/skills/review-guardrails/SKILL.md`. It's gitignored (the maintainer's personal tooling, ADR-009), so this page is the public record of its design. The runnable file is the source of truth.

## Why it exists

A reviewer with no project context reviews against generic taste. This skill gives the [red-team agent](../Agents/red-team.md) InvoiceMe's actual rules: a check for each standing rule in `docs/Decisions.md` (request path, response envelope, errors, `app.js` side effects, money, dates, secrets, agent tooling), plus a list of **known regression traps**. Every trap on that list was reproduced against the running API, not guessed at.

It holds the procedure and the traps, and points to `docs/Decisions.md` for the rules themselves. When the two disagree, the ADRs win and the skill gets fixed.

## Who uses it

- The **red-team** agent preloads it (`skills: [review-guardrails]`) and uses its checks, but its own scoring and output format.
- The main session can load it inline when reviewing a design or deciding whether tech debt should be fixed now. Sections 4 and 5 (the severity scale and output) apply only in that inline mode.

## Keeping it current

- When an ADR is added or changes status, the matching check in section 2 is updated in the same PR.
- When a pinned known bug is fixed, its entry is removed from **Known regression traps**.
- When a new trap is reproduced, it's added with the input that triggers it.

## History

- 2026-09-25: Created for InvoiceMe, modeled on BabyBuddyHelper's `review-guardrails`. It's seeded with ADR-0001 to ADR-0004 and eight traps reproduced during Phase 0 discovery.
- 2026-09-25: Re-keyed to ADR-001 to ADR-009 after `Decisions.md` was rewritten as standing rules. The API-contract and auth checks were dropped along with their ADRs; the known-bugs policy stays as a project policy.
