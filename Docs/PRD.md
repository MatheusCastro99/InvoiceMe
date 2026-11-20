# Product Requirements Document: InvoiceMe

## Purpose

InvoiceMe is a customer and invoice tracking web application for small businesses. The vision is in [Project Vision](Project_Vision.md).

## Audience

- Small businesses

## Technical Specifications

- **Frontend**: React single-page app, built with Vite and styled with Tailwind CSS
- **API**: Node.js with Express
- **Storage**: MongoDB, through Mongoose
- **Sign-in**: Microsoft Entra External ID; the browser signs in with MSAL and the API checks every access token with `jose` (ADR-014)
- **Runtime**: Node.js 20.19 or later
- **Hosting**: local only; the API and the frontend run on the developer's machine
- **CI**: GitHub Actions (frontend lint and build, API load check and API tests) and CodeQL

The structure and the key files are in [Architecture Design](../Harness_Config/Context/Architecture_Design.md).

## What it does today

### Customers
- List the customers
- Add a customer: the form requires company name, phone, email and ZIP; the API requires only company name and phone. A phone number belongs to one customer only.
- Edit and delete a customer
- Open a customer's profile, with their invoices

### Invoices
- Build an invoice for a customer: date of service, line items, job description and price
- Compute the tax rate from the customer's US state and the final price, on the server
- Preview the invoice, save it, and download it as a PDF
- List and delete invoices

### Sign-in
- Sign up, sign in and sign out with Microsoft Entra External ID; every page needs a signed-in user, and the API refuses any request without a valid access token
- A signed-out visitor lands on the sign-in page; an ended session is explained there, and signing in again returns to the page they asked for

## Not built

- Editing a saved invoice
- Data owned per user: every signed-in user still sees the same customers and invoices
