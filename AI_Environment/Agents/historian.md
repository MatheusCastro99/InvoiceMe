# historian: Agent Documentation

The runnable definition is `.claude/agents/historian.md`. It's gitignored (the maintainer's personal tooling, ADR-009), so this page is the public record of its design. The runnable file is the source of truth for the prompt.

## Why it exists

Docs go stale in the gap between "the code changed" and "someone updated the README." While working through an issue, the main session keeps a **stale-docs list** of every doc statement its change made untrue. At step 11 of the issue workflow, the historian applies that list in one focused pass, then sweeps the rest of the project docs and fixes anything else that no longer matches reality.

## When to use it

- Step 11 of the issue workflow, once the PR's code is final (after the red-team findings are fixed)

## When not to

- While code is still changing. Docs written against moving code go stale again immediately.
- To write new documents (a new Roadmap, an architecture doc). That's authoring, not upkeep; the main session does it with the owner.

## Ownership boundaries

| Content | Owner | Historian's role |
|---|---|---|
| Project documentation: `docs/`, `NODEAPI/*.md`, `README.md` files, `AI_Environment/` | Project owner | **Edits it:** applies the list and fixes anything else it can verify is stale |
| `docs/Decisions.md` (the ADRs) | **Project owner, exclusively** | **Never writes it.** It **reports** any ADR text that the change (or its own doc edits) has made untrue, and it may draft ADR candidates in its report |
| Code documentation: JSDoc, route headers, inline comments | Main session (designed with the owner) | **Never edits it.** It reports stale comments for the main session |
| Code, tests, config, CI, `.claude/` | Main session | Never edits it |

## Configuration

| Field | Value | Why |
|---|---|---|
| `tools` | Read, Grep, Glob, Edit, Bash | Edit makes small in-place changes. There's no Write, so it can't create or wholesale-rewrite files. Bash is for read-only `git`/`gh` inspection (the diff, `git ls-files`); "read-only" is enforced by the prompt, not by permissions |
| `model` | sonnet | Doc upkeep is careful, but it doesn't need deep reasoning; this keeps the cost per pass low |
| `effort` | medium | Same reason |
| No `Agent` tool | — | It can't spawn other agents; it returns one report |

## Brief it with

The target (branch or PR), the stale-docs list (items D1, D2, … each with a file and location, what's stale, what it should say, and evidence), and owner notes on anything already rejected.

## Output

A report whose **"What changed → how the docs reflect it"** section maps each change in the diff to the doc update it caused, or to "no doc impact". It also lists the list items applied, fixes made beyond the list, items it didn't apply (with reasons), stale code comments handed back to the main session, draft ADRs (not written), and the files touched. The owner reviews the diff against this report, and then the main session commits it.

## History

- 2026-09-25: Created for InvoiceMe, based on BabyBuddyHelper's historian. It differs in three ways, per the owner's tuning:
  - It **fixes** stale docs beyond the list, where BabyBuddyHelper's only reports them.
  - It **never writes `Decisions.md`**, not even factual corrections.
  - It returns a change → documentation map.
- 2026-09-25: ADR candidates are now limited to recurring patterns and standing rules, matching what `Decisions.md` holds; one-off choices are not ADRs.
- 2026-09-25: Also checks `Decisions.md` against the change and reports any ADR text made untrue (it still never edits the file). This came after the #74 pass, where an ADR sentence contradicted by the historian's own README edit was caught only by Copilot's review.
