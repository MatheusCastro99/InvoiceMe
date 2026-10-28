# UI Guidelines

Last updated: 2026-10-20

## Purpose
The interface and experience guardrails for InvoiceMe. They keep every screen in line with the [Project Vision](../../Docs/Project_Vision.md): a customer and invoice tracking web application for small businesses.

## Identity
Feels:
- Intuitive: a small-business owner finds and finishes a task without instructions
- Finance-like: the look and palette of a financial tool

## Visual direction
- Color: a finance-like palette

## Screens

### Home (`/`)
Purpose: the list of customers, and the starting point for every other task

Answers:
- Who are my customers?

### Create customer (`/create`)
Purpose: add a customer: company, contact, phone, email and address

### Edit customer (`/edit/:id`)
Purpose: change a customer's details

### Invoice (`/invoice`)
Purpose: build an invoice: pick the customer, the date of service and the line items; the tax follows the customer's state

Answers:
- What does this job cost, with tax?

### Invoice preview (`/pdfPage`)
Purpose: check the invoice, save it, and download it as a PDF, or go back to change it

### Customer profile (`/profilePage/:id`)
Purpose: one customer's details and their invoices

Answers:
- What have I billed this customer?

## Interaction patterns
- Confirmations: a sweetalert2 dialog before a customer or an invoice is deleted
- Feedback: react-toastify toasts for success and failure

## Design system
Lives in: Tailwind utility classes in the JSX, and `FRONTEND/src/index.css` for the few custom classes. Components come from MUI (`@mui/material`, `@mui/x-date-pickers`) and `flowbite-react`, with FontAwesome icons. There is no theme or token file yet.

Rules:
- New screens and components take their components from MUI (ADR-011).

## Review questions
Before approving an interface change, ask:
- Can a small-business owner finish the task without instructions?
- Does it look and feel like a financial tool?
- Does it use the same confirmation and feedback patterns as the other screens?
