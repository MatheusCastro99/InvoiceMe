# AI Context

Last updated: 2026-10-20

## Project
InvoiceMe is a customer and invoice tracking web application for small businesses: a React frontend, an Express API and MongoDB. Its interface aims to be intuitive and to feel like a financial tool.

- [README](../Docs/README.md): how to install and run it
- [Project Vision](../Docs/Project_Vision.md)
- [Requirements](../Docs/PRD.md)
- [Roadmap](../Docs/Project_Roadmap.md)

## Context documents
| Page | What it answers |
|---|---|
| [Architecture Design](Context/Architecture_Design.md) | How is the project structured, and which files matter? |
| [Current Focus](Context/Current_Focus.md) | What is being worked on now? |
| [Decisions](Context/Decisions_Consistency.md) | Which standing rules must every change follow? |
| [UI Guidelines](Context/UI_Guidelines.md) | What must the interface look and feel like? |
| [Development Workflow](Context/Development_Workflow.md) | Which stages does an issue go through? |
| [Working Agreements](Context/Working_Agreements.md) | Who decides, and how? |
| [Data Flow](Context/DataFlow.md) | How does data move from a page to the API and MongoDB and back, and what happens on an error? |

## Agents and skills
The runnable definitions live in `.claude/agents/` and `.claude/skills/`, kept out of version control.

| Definition | What it is for |
|---|---|
| `.claude/agents/red-team.md` | Independent adversarial review of a finished change, at stage 8 of the workflow |
| `.claude/agents/historian.md` | Applies the stale-docs list to the documentation before the merge, at stage 10 |
| `.claude/skills/guardrails-review/SKILL.md` | Checks a change against the decisions, by ADR number |
| `.claude/skills/ux-design/SKILL.md` | Reviews interface and copy changes against the UI Guidelines |
