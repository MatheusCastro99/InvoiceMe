# AI Context

Last updated: 2026-10-20

The page an agent loads first. Read it before planning or editing anything, then the documents it points to.

## Project
InvoiceMe is a customer and invoice tracking application for small businesses: a React frontend and an Express API on MongoDB. It values a modern, structured, finance-like interface, and input that is checked at every layer before it reaches the database.

- [README](../README.md): setup and how to run locally
- [Project Vision](../Docs/Project_Vision.md): what InvoiceMe is, who it is for, and what it is not
- [Roadmap](../Docs/Project_Roadmap.md): the planned work

## Context documents
| Page | What it answers |
|---|---|
| [Architecture Design](Context/Architecture_Design.md) | How is the project structured, and which files matter? |
| [Data Flow](Context/DataFlow.md) | How does data move from a page to the API and MongoDB and back, and what happens on an error? |
| [Decisions](Context/Decisions_Consistency.md) | Which standing rules must every change follow? |
| [UI Guidelines](Context/UI_Guidelines.md) | What must the interface look and feel like? |
| [Working Agreements](Context/Working_Agreements.md) | Who decides, how is a recommendation made, how is a finding triaged, where is a decision recorded? |
| [Development Workflow](Context/Development_Workflow.md) | Which stages does an issue go through, and which of them end with the owner's approval? |
| [Current Focus](Context/Current_Focus.md) | What is being worked on now? |

## Agents and skills
Local tooling for Claude Code, kept out of version control.

| Definition | What it is for |
|---|---|
| `.claude/agents/red-team.md` | An independent, read-only reviewer that tries to break a finished change before it is merged (Development Workflow, stage 8) |
| `.claude/agents/historian.md` | Applies the stale-docs list to the documentation before a merge (stage 10) |
| `.claude/skills/guardrails-review/SKILL.md` | Checks a change against the standing rules in [Decisions](Context/Decisions_Consistency.md) |
| `.claude/skills/ux-design/SKILL.md` | Reviews interface changes against [UI Guidelines](Context/UI_Guidelines.md) |
