# Project Roadmap

The planned work for InvoiceMe. There are no dates. **Needs the owner:** the order, if any.

## Planned

- **Customer search.** A search bar with autocomplete to filter customers, on the Home page and the Generate Invoice page.
- **"Today" for the date of service.** An option on the Generate Invoice page that fills in the current date (with dayjs).
- **Discount.** A percentage off the subtotal, on the invoice's line items and the Generate Invoice page.
- **Format checks on save.** Check the format of every field again when the customer form's Save button is clicked.
- **Duplicate customers.** Partly built: the API rejects a phone number already in use, on create and on update. **Needs the owner:** whether anything is left to do.
- **Authentication.** Planned. **Needs the owner:** the approach and its scope.
- **Automated tests,** with Jest or Supertest.
- **Debug endpoints only in development.** `/debug/db` answers in every environment today ([ADR-007](../Harness_Config/Context/Decisions_Consistency.md#adr-007)).

The first five items come from the to-do comments at the top of `FRONTEND/src/pages/HomePage.jsx`, and in `CreatePage.jsx`.

The roadmap is directional; planned items should not be read as available today.
