# Data Flow

Last updated: 2026-10-28

Every request to `/api/v1/` takes the same path: a page calls the API with axios, using a URL from `API_ENDPOINTS` (`FRONTEND/src/config/apiConfig.js`); an Express router under `/api/v1/` runs the validation middleware, where the route has one, then a controller wrapped in `express-async-handler`; the controller reads or writes through a Mongoose model, for customers and invoices, and answers with `{ success, data, message? }`. Any error a controller throws or passes on reaches `errorMiddleware`, which answers with `{ success: false, message, statusCode, errors? }`. It turns a Mongoose cast or validation error into 400 and a duplicate-key error into 409; any other unexpected error answers 500 with a generic message, and the real message is only logged.

## Save a new customer

```mermaid
flowchart TD
    A["CreatePage.jsx<br/>the user fills the form and clicks Save"] --> B{"checkValidity<br/>did name, phone, email and ZIP<br/>pass their on-blur checks?"}
    B -- "no" --> B1["CreatePage.jsx<br/>shows a toast and a red border on each invalid field"]
    B -- "yes" --> C["saveCustomer, axios.post<br/>API_ENDPOINTS.CUSTOMERS.CREATE"]
    C --> D["customerRoute.js<br/>POST /api/v1/customers"]
    C -- "no answer" --> C1["CreatePage.jsx<br/>toast with the axios error message;<br/>the form keeps what was entered"]
    D --> E{"validateCustomerInput<br/>utils/validators.js"}
    E -- "no" --> E1["errorMiddleware<br/>400 with the list of errors"]
    E -- "yes" --> F{"postCustomer<br/>is the phone number, as its 10 digits,<br/>already used?"}
    F -- "yes" --> F1["errorMiddleware<br/>409, duplicate customer"]
    F -- "no" --> G[("CustomerModel.create<br/>MongoDB")]
    G -- "fails" --> G1["errorMiddleware<br/>400 (invalid value), 409 (duplicate key)<br/>or 500 with a generic message"]
    G -- "succeeds" --> H["postCustomer<br/>201 with the new customer"]
    E1 --> I["CreatePage.jsx<br/>toast with the axios error message"]
    F1 --> I
    G1 --> I
    H --> K["CreatePage.jsx<br/>success toast, then the home page"]
```

Notes:
- The client and the server validate separately, with their own rules. The client requires email and ZIP, which the server accepts empty. The server rejects company names with characters such as `'` or accented letters, or longer than 100 characters, and states not given as two capital letters, all of which the client lets through: those saves end in a 400.
- The page shows `error.message` from axios, such as "Request failed with status code 409", not the `message` the API returns.
- Editing a customer (`EditPage.jsx`, `PUT /api/v1/customers/:id`) takes the same path through `validateCustomerInput` and `updateCustomer`, which also returns 404 when the customer does not exist.

## Save an invoice

```mermaid
flowchart TD
    A["InvoicePage.jsx<br/>the user picks a customer and enters a price;<br/>the state comes from the customer's address"] --> T["InvoicePage.jsx, axios.post<br/>tax/rate, then tax/calculate"]
    T --> T1["taxController.js<br/>rate from STATE_TAX_RATES, final price"]
    T1 --> A2["InvoicePage.jsx<br/>Generate PDF: navigates to /pdfPage<br/>with the invoice in router state"]
    A2 --> B{"PdfPage.jsx, saveInvoice<br/>are company, date and final price set?"}
    B -- "no" --> B1["PdfPage.jsx<br/>toast: fill out all input"]
    B -- "yes" --> C["axios.post<br/>API_ENDPOINTS.INVOICES.CREATE"]
    C --> D["invoiceRoute.js<br/>POST /api/v1/invoices"]
    C -- "no answer" --> C1["PdfPage.jsx<br/>toast with the axios error message"]
    D --> E{"validateInvoiceInput<br/>utils/validators.js"}
    E -- "no" --> E1["errorMiddleware<br/>400 with the list of errors"]
    E -- "yes" --> F["postInvoice"]
    F --> G[("InvoiceModel.create<br/>MongoDB")]
    G -- "fails" --> G1["errorMiddleware<br/>400 (invalid value), 409 (duplicate key)<br/>or 500 with a generic message"]
    G -- "succeeds" --> H["postInvoice<br/>201 with the new invoice"]
    E1 --> I["PdfPage.jsx<br/>toast with the axios error message"]
    G1 --> I
    H --> K["PdfPage.jsx<br/>success toast"]
```

Notes:
- The server computes the tax rate and the final price. The page sums the line items into the subtotal it sends, and shows a tax line it derives as subtotal × rate.
- The date of service travels as `YYYY-MM-DD` (ADR-013). `InvoicePage.jsx` enters it with a date picker and checks it with `isValidDateOfService` (`utils/date.js`, the server's rule); the invoice table and the PDF show it as `MM/DD/YYYY` by cutting the string. The server stores it as a date at UTC midnight and sends it back as `YYYY-MM-DD`.
- The invoice stores a copy of the customer's name, phone, email and address at the time it is saved. A later change to the customer does not change the invoice.
- Downloading the PDF (`saveFile` in `PdfPage.jsx`) happens in the browser with `@react-pdf/renderer` and does not call the API.
