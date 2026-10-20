# Product Requirements Document: InvoiceMe

## Purpose

InvoiceMe is a customer and invoice tracking web application for small businesses. The vision is in [Project Vision](Project_Vision.md).

## Audience

- Small businesses

## Technical Specifications

- **Frontend**: React single-page app, built with Vite and styled with Tailwind CSS
- **API**: Node.js with Express
- **Storage**: MongoDB, through Mongoose
- **Runtime**: Node.js 20.19 or later
- **Hosting**: local only; the API and the frontend run on the developer's machine
- **CI**: GitHub Actions (frontend lint and build, API load check) and CodeQL

The structure and the key files are in [Architecture Design](../Harness_Config/Context/Architecture_Design.md).

## What it does today

### Customers
- List the customers
- Add a customer, with company name and phone number required; a phone number belongs to one customer only
- Edit and delete a customer
- Open a customer's profile, with their invoices

### Invoices
- Build an invoice for a customer: date of service, line items, job description and price
- Compute the tax rate from the customer's US state and the final price, on the server
- Preview the invoice, save it, and download it as a PDF
- List and delete invoices

## Not built

- Editing a saved invoice
- User accounts and sign-in
