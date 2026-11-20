# UI Guidelines

Last updated: 2026-11-19

## Purpose
The interface and experience guardrails for InvoiceMe. They keep every screen in line with the [Project Vision](../../Docs/Project_Vision.md): a customer and invoice tracking web application for small businesses.

## Identity
Feels:
- Intuitive: a small-business owner finds and finishes a task without instructions
- Finance-like: the look and palette of a financial tool

## Visual direction
- Color: "Clear emerald", six semantic tokens (below). States such as valid, invalid and selected are never shown by color alone: they also carry text or an icon.
- Typeface: Tailwind's default system sans (`font-sans`); no web font. Money is shown in tabular figures (`tabular-nums`) and right-aligned in tables.
- Type scale: roles on Tailwind's default sizes, with no size tokens.
- Spacing: Tailwind's 4px steps, with no spacing tokens.

### Palette
| Token | Hex | Use | Contrast measured |
|---|---|---|---|
| `primary` | `#047857` | primary buttons, links, header accent, valid-field border, selected state | white text on it 5.48:1 |
| `primary-hover` | `#065F46` | hover and pressed state of `primary` | white text on it 7.68:1 |
| `primary-soft` | `#ECFDF5` | highlighted or selected rows, quiet info surfaces | `primary` on it 5.21:1, `ink` on it 16.95:1 |
| `ink` | `#0F172A` | body text and headings | none measured |
| `muted` | `#475569` | supporting text, labels, captions | on white 7.58:1 |
| `danger` | `#B42318` | delete buttons, invalid-field border and message, error text | white text on it 6.57:1 |

The contrast figures assume content on a white surface; `white` is the text color on `primary`, `primary-hover` and `danger`.

### Type scale
| Role | Classes |
|---|---|
| Page title | `text-2xl font-semibold` |
| Section title | `text-lg font-semibold` |
| Body | `text-base` |
| Label | `text-sm font-medium` |
| Caption | `text-xs` |

### Spacing
- Inside controls: 8px (`p-2`)
- Between fields: 16px (`gap-4`)
- Between sections: 32px (`gap-8`)

## Screens

### Sign in (`/signin`)
Purpose: sign in or create an account; the one screen open to a signed-out visitor, and where the app sends the user when a session ends

Answers:
- How do I get to my customers and invoices?

Messages (the only three; each stays on this screen):
- Session ended: "Your session has ended. Sign in again to pick up where you left off." (comes with `?reason=expired`)
- Sign-in failed: "Sign-in didn't finish. Please try again."
- Not set up: "Sign-in isn't set up yet. Add the VITE_ENTRA_ settings described in the README."

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
- Account: while signed in, the navigation bar shows the signed-in name and a "Sign out" button

## Design system
Lives in: Tailwind utility classes in the JSX, and `FRONTEND/src/index.css` for the few custom classes. Components come from MUI (`@mui/material`, `@mui/x-date-pickers`) and `flowbite-react`, with FontAwesome icons. The six color tokens live in the `@theme` block of `FRONTEND/src/index.css`. New screens use them, and Tailwind's default steps, preferring the roles above. Existing pages keep their current classes until Epic 5.

Rules:
- New screens and components take their components from MUI (ADR-011).
- New screens and components take their colors from these tokens, plus `white` for text on `primary`, `primary-hover` and `danger` and for the surfaces content sits on.

## Review questions
Before approving an interface change, ask:
- Can a small-business owner finish the task without instructions?
- Does it look and feel like a financial tool?
- Does it use the same confirmation and feedback patterns as the other screens?
