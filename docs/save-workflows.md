# InvoiceMe Save Execution Workflows

These diagrams trace the actual request path from the frontend save button through the API and into MongoDB.

## Customer Save Flow

```mermaid
flowchart TD
    A["CreatePage.jsx\nUser clicks Save"] --> B["CreatePage.jsx\ncheckValidity()"]
    B --> C["CreatePage.jsx\nsaveCustomer()"]
    C --> D["apiConfig.js\nAPI_ENDPOINTS.CUSTOMERS.CREATE"]
    D --> E["app.js\napp.use('/api/v1/customers')"]
    E --> F["customerRoute.js\nrouter.post('/', validateCustomerInput, postCustomer)"]
    F --> G["validationMiddleware.js\nvalidateCustomerInput()"]
    G --> H["validators.js\nvalidateCustomerData()"]
    H --> I["customerController.js\npostCustomer()"]
    I --> J{"customerController.js\nDuplicate phone number?"}
    J -->|Yes| K["utils/errors.js\nConflictError"]
    J -->|No| L["customerModel.js\nCustomerModel.create(req.body)"]
    L --> M["MongoDB\ncustomers collection"]
    K --> N["response\nError returned"]
    M --> O["response\n201 Created"]
```

## Final Invoice Save Flow from PDF Page

```mermaid
flowchart TD
    A["PdfPage.jsx\nUser clicks Save Invoice"] --> B["PdfPage.jsx\nsaveInvoice()"]
    B --> C["PdfPage.jsx\nBuild invoice payload"]
    C --> D["apiConfig.js\nAPI_ENDPOINTS.INVOICES.CREATE"]
    D --> E["app.js\napp.use('/api/v1/invoices')"]
    E --> F["invoiceRoute.js\ninvoiceRouter.post('/', validateInvoiceInput, postInvoice)"]
    F --> G["validationMiddleware.js\nvalidateInvoiceInput()"]
    G --> H["validators.js\nvalidateInvoiceData()"]
    H --> I["invoiceController.js\npostInvoice()"]
    I --> J["invoiceModel.js\nInvoiceModel.create(req.body)"]
    J --> K["MongoDB\ninvoices collection"]
    K --> L["response\n201 Created"]
```

### Notes

- The customer save flow starts from the create form in CreatePage.jsx.
- The invoice save flow shown here is the final save triggered from the PDF preview page, using the payload prepared in PdfPage.jsx.
- Both flows follow the same application pattern: Frontend save handler → Axios request → Express route → Validation → Controller → Mongoose model → MongoDB.
