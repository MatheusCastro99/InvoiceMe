# UI Guidelines

Last updated: 2026-10-20

## Purpose
The interface and experience guardrails for InvoiceMe. They keep every screen in line with the [Project Vision](../../Docs/Project_Vision.md): customer and invoice tracking for small businesses.

## Identity
Feels:
- Modern
- Structured
- Organized
- Finance-like, in its theme and palette

Avoid:
- **Needs the owner:** what the interface must not feel like.

## Principles

Drafted from the identity above. **Needs the owner:** confirm each principle, or replace it.

### Structured
Each screen has one clear job, and its content is grouped into sections the user can scan.

Favor:
- Grouped fields with a heading per group, as in the customer form's Contact Info and Address sections

Avoid:
- **Needs the owner.**

### Finance-like
The interface reads like a financial tool: amounts, dates and invoice numbers are easy to find and easy to trust.

Favor:
- **Needs the owner:** how amounts, totals and tax are shown.

Avoid:
- **Needs the owner.**

## Visual direction
- Color: a finance-like palette. **Needs the owner:** the palette itself. Today the app uses a slate-400 page background, a gray-800 navbar, blue-700 for primary actions and gray-400 for secondary ones.
- Type: **Needs the owner.**
- Layout: centered white cards for forms (`max-w-lg` or `max-w-xl`), a responsive card grid for customers (2 columns, 4 on large screens), and tables for invoices.

## Screens

### Home (`/`)
Purpose: the overview of the business's customers and invoices, and the starting point for every task.

Answers:
- Who are my customers?
- Which invoices have I issued?
- How do I add a customer or start an invoice?

### Create customer (`/create`) and Edit customer (`/edit/:id`)
Purpose: enter or correct a customer's contact and address details.

Answers:
- Which details are required, and in what format?
- Did the save work?

### Customer profile (`/profilePage/:id`)
Purpose: one customer's details and their invoices.

Answers:
- Who is this customer, and how do I reach them?
- Which invoices have I issued to them?

### Generate invoice (`/invoice`)
Purpose: build an invoice for a customer: the date, the invoice number, the job and its line items, the tax and the final price.

Answers:
- Which customer is this for, and are their details right?
- What is the tax rate, and what is the final price?
- Is the invoice number the next one in sequence?

### Invoice PDF (`/pdfPage`)
Purpose: preview the invoice as it will be sent, save it, and download it.

Answers:
- Does the invoice look right before I send it?
- Has it been saved?

## Interaction patterns
- Actions: primary actions are blue-700 buttons, secondary actions gray-400, both with a scale-up on hover.
- Confirmations: deleting a customer or an invoice asks first, in a sweetalert2 dialog.
- Feedback: react-toastify toasts for success and failure. Form fields show a red border when invalid and a green one when valid, and the error toast states the expected format ([ADR-003](Decisions_Consistency.md#adr-003)).

## Design system
Lives in: Tailwind utility classes in the components, and `FRONTEND/src/index.css` for the Tailwind import and the few custom classes. There is no theme file and no design tokens.

Rules:
- Tailwind is the default for new interface work ([ADR-006](Decisions_Consistency.md#adr-006)).
- **Needs the owner:** whether the palette moves into Tailwind theme tokens, and whether repeated class strings (buttons, form inputs) become shared components.

## Accessibility
**Needs the owner:** the baseline to hold new work to. Today the interface has no `aria-` attributes, no `alt` text on images, labels without `htmlFor`, and a navbar link with an icon and no text.

## Anti-patterns
- **Needs the owner.**

## Review questions
Before approving an interface change, ask:
- Does it feel modern, structured, organized and finance-like?
- Does the screen still have one clear job?
- Is it built with Tailwind?
- Does each form field validate on blur and say what format it expects?
- Is the user told, by a toast, whether the action worked?
