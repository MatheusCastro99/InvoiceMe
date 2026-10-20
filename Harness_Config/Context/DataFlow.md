# Data Flow

Last updated: 2026-10-20

Every request goes from a page, through axios with a URL from `API_ENDPOINTS`, to an Express route, the validation middleware where there is one, a controller and a Mongoose model. Every error the API raises ends in `errorMiddleware` ([ADR-001](Decisions_Consistency.md#adr-001)).

## Save a customer

Creating (`CreatePage.jsx`, `POST /api/v1/customers`) and editing (`EditPage.jsx`, `PUT /api/v1/customers/:id`) follow the same path. An edit first loads the customer by ID, and its handler also answers 404 when the customer no longer exists.

```mermaid
flowchart TD
    A["CreatePage / EditPage<br/>the user leaves a field"] --> B{"field validator (onBlur)<br/>is the format valid?"}
    B -- "no" --> B1["red border on the field<br/>toast with the expected format"]
    B -- "yes" --> B2["green border<br/>validity flag set"]
    B2 --> S{"Save: checkValidity<br/>are all flags valid?"}
    S -- "no" --> S1["toast: check name, phone, email, zip<br/>red borders on the invalid fields"]
    S -- "yes" --> C["axios POST / PUT<br/>API_ENDPOINTS.CUSTOMERS"]
    C -- "no answer" --> C1["toast with the axios error message<br/>the form keeps what the user entered"]
    C --> D["customerRoute"]
    D --> E{"validateCustomerInput<br/>utils/validators.js"}
    E -- "no" --> E1["ValidationError 400<br/>errorMiddleware"]
    E -- "yes" --> F{"customerController<br/>is the phone number already used?"}
    F -- "yes" --> F1["ConflictError 409<br/>errorMiddleware"]
    F -- "no" --> G[("CustomerModel<br/>create / findByIdAndUpdate")]
    G -- "fails" --> G1["500<br/>errorMiddleware"]
    G -- "succeeds" --> H["201 / 200<br/>{ success, message, data }"]
    E1 --> I["toast with the axios error message"]
    F1 --> I
    G1 --> I
    H --> K["success toast<br/>navigate to /"]
```

Notes:
- The client and the server check different things. The client requires email and zip code; the server treats both as optional. The client and server phone patterns are not the same regex.
- An error toast shows axios's `error.message` ("Request failed with status code …"), not the `message` the API puts in its error envelope.
- After a create, the success toast reads `response.data.companyName`. The customer is under `response.data.data`, so the name is likely missing from the toast. **Needs the owner:** an open bug, or intended?
- A customer image left empty is replaced in the browser by a placeholder image URL on an external site before the request.

## Generate and save an invoice

```mermaid
flowchart TD
    A["InvoicePage<br/>the user picks a company"] --> B["GET /customers/:id"]
    B -- "fails" --> B1["customer details cleared"]
    B --> T["POST /tax/rate { state }<br/>rate from STATE_TAX_RATES"]
    T -- "400: no or unknown state" --> T1["tax rate left unset<br/>no message to the user"]
    T --> P["the user enters the price or line items"]
    P --> Q["POST /tax/calculate { jobPrice, taxRate }<br/>taxController rounds to 2 decimals"]
    Q --> V{"date and invoice number validators (onBlur)<br/>Generate PDF: checkValidity"}
    V -- "no" --> V1["red border, toast<br/>navigation blocked"]
    V -- "yes" --> R["navigate to /pdfPage<br/>with the invoice in router state"]
    R --> PDF["PdfPage<br/>renders the invoice with PDFViewer"]
    PDF --> DL["Download<br/>PDF built in the browser, saved with file-saver"]
    PDF --> SV["Save Invoice<br/>axios POST /invoices"]
    SV -- "no answer" --> SV1["toast with the axios error message"]
    SV --> VI{"validateInvoiceInput"}
    VI -- "no" --> VI1["ValidationError 400<br/>toast with the axios error message"]
    VI -- "yes" --> M[("InvoiceModel.create")]
    M -- "fails" --> M1["500<br/>toast with the axios error message"]
    M -- "succeeds" --> OK["201: success toast<br/>Save button disabled"]
```

Notes:
- The customer's contact and address fields are copied into the invoice when it is saved. The invoice keeps no reference to the customer ([ADR-005](Decisions_Consistency.md#adr-005)).
- The tax calls have no error handling of their own. A customer with no state, or a state not in `STATE_TAX_RATES`, leaves the tax rate unset without telling the user.
- The invoice number is checked only in the browser, against the last element of the invoice list. The API returns that list newest first, so the last element is the oldest invoice. With no invoices at all, the check has nothing to compare against. **Needs the owner:** confirm the intended check.
- The invoice data reaches `PdfPage` only through router state. Opening `/pdfPage` directly, or reloading it, leaves the page without an invoice.
- Downloading the PDF does not call the API; saving it does.

## Load and delete

- **Lists.** `HomePage` loads the customers (`GET /customers`, paginated, 20 by default) and all invoices (`GET /invoices`, newest first) on mount. `ProfilePage` loads one customer and the invoice list. Each page reads the payload defensively, as `response.data.data` with a fallback to `response.data`, and shows a toast on failure.
- **Delete.** `Customer`, `CustomerProfile`, `TableCustomer` and `TableInvoice` ask for confirmation with a sweetalert2 dialog, then call `DELETE /customers/:id` or `DELETE /invoices/:id`. A missing record answers 404 through `errorMiddleware`. Deleting a customer leaves their invoices in place, since an invoice holds its own copy of the customer's details.
- **IDs.** No route checks the ID format. An ID that is not a valid MongoDB ObjectId makes Mongoose throw a cast error with no status code, which `errorMiddleware` answers as 500.
