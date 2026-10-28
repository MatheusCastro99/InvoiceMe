---
name: ux-design
description: UX and UI lens for InvoiceMe. Checks screens, interface changes, flows and copy against the product identity, the UI guidelines, the shared style tokens and basic accessibility. Use when designing or reviewing a screen or component, touching styling, writing user-facing text (messages, labels, empty states), or planning a redesign.
---

# UX Design

This skill adds a UX lens on top of the session context. It produces a **recommendation**. The project owner decides.

## 1. Load context

- `Harness_Config/Context/UI_Guidelines.md` is **the authority**: identity, principles, palette, typography, screen purposes. Don't restate it; apply it.
- Styles: Tailwind utility classes in the JSX, with Tailwind v4's default theme (there is no `tailwind.config` and no token file), and the few custom classes in `FRONTEND/src/index.css`. The PDF has its own styles in `FRONTEND/src/pdfStyle.jsx`.
- The source of the screen or component being changed, in `FRONTEND/src/pages/` and `FRONTEND/src/components/`.

This lens works from the source. Base findings on it and say what the owner should look at on screen; the builder's UI check (section 4) is where the running app is seen.

## 2. Check

**Identity.** Does it feel the way the guidelines say the product should feel? Name the guideline a finding goes against.

**Screen purpose.** Does the screen still answer the question the guidelines give it?

**Design system.**
- Use the existing styles and tokens. A hardcoded color or size in **new or changed** interface code is a finding.
- Known existing debt; don't report it as a regression: the custom colors in `FRONTEND/src/index.css`, the sweetalert2 button colors in `Customer.jsx` and `TableInvoice.jsx`, and the colors in `pdfStyle.jsx`.
- A new color or size uses a Tailwind default class. One that Tailwind's defaults do not provide is raised with the owner before it is added.
- Prefer reusing an existing layout pattern over a one-off.

**Accessibility.** This is never traded for looks.
- Text contrast is at least 4.5:1 (3:1 for large text).
- Touch targets are at least 24×24 CSS pixels.
- Interactive elements carry an accessible name or description where the visual isn't self-explanatory.
- State is never shown by color alone.

**Flow.** One clear primary action per screen, and no hidden actions or deep navigation. The tax rate and the final price shown on screen come from the API; a component may only derive the subtotal and the tax line from them (ADR-004). Field state and styling live in React state, not in the DOM (ADR-009). New components come from MUI (ADR-011).

**Copy.** Short and specific, in the voice the guidelines set.

**Platform caveats.** InvoiceMe runs in a desktop browser on the developer's machine. Narrow window widths and the downloaded PDF can differ from what the screen shows.

## 3. Output

- **Design goal:** the problem being solved
- **Identity alignment:** Low / Medium / High
- **Findings,** each with `file:line`, what's wrong, and the suggested change to the interface code or the copy
- **Accessibility result:** pass, or the specific failures
- **Recommendation:** Approve / Adjust / Redesign, with advantages and disadvantages
- **Check on screen:** the specific things the owner should look at while running the app

## 4. The UI check (T6)

A UI sub-phase's check drives the app in the built-in browser pane. The builder runs it, on either tier (harness D25).

- **Data:** a throwaway database, never the owner's. Start a `MongoMemoryServer` from `NODEAPI/node_modules/mongodb-memory-server` on a free port, from a script in the session's scratchpad, and seed what the plan needs. The check never writes to the owner's database, even to undo a change.
- **Run:** in `NODEAPI/`, `MONGO_URL=<the memory server's URL> PORT=3000 node server.js`, so the real `.env` database isn't used; in `FRONTEND/`, `npm run dev`. Then drive each step the plan names in the browser pane, and stop both servers afterwards.
- **Evidence:** a screenshot per step under `.harness/work/<n>/ui/`, listed under the handoff's Checks.
- **Limits:**
  - The pane may not draw the PDF viewer or the invoice table. Check the PDF through the component tree or the page's contents, and say so in the handoff.
  - The browser runs in one time zone. A date shown on screen in a zone ahead of UTC needs a Node check of the display helpers.
