# InvoiceMe API Documentation

## API Version: v2.0

### Base URL

```
http://localhost:3000/api/v2
```

### Response Format

All endpoints return JSON responses with the following structure:

**Success Response (2xx):**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "pagination": {} // Optional
}
```

**Error Response (4xx/5xx):**

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": [] // Optional, for validation errors
}
```

---

## Customer Endpoints

### 1. Get All Customers

**GET** `/customers`

**Query Parameters:**

- `page` (optional): Page number, default: 1. A value that is not a whole number of 1 or more falls back to 1
- `limit` (optional): Items per page, default: 20, maximum: 100. A value that is not a whole number of 1 or more falls back to 20; a value above 100 is capped at 100. The answer's `pagination.limit` is the value used

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "companyName": "Acme Corp",
      "phoneNumber": "5551234567",
      "companyEmail": "info@acme.com",
      "contactName": "John Doe",
      "streetAddress": "123 Main St",
      "cityAddress": "Springfield",
      "stateAddress": "IL",
      "zipAddress": "62701",
      "image": "https://...",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

### 2. Get Customer by ID

**GET** `/customers/:id`

**Parameters:**

- `id` (required): MongoDB Customer ID

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "companyName": "Acme Corp",
    "phoneNumber": "5551234567",
    ...
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Customer not found",
  "statusCode": 404
}
```

---

### 3. Create Customer

**POST** `/customers`

**Request Body:**

```json
{
  "companyName": "Acme Corp",
  "phoneNumber": "(555) 123-4567",
  "companyEmail": "info@acme.com",
  "contactName": "John Doe",
  "streetAddress": "123 Main St",
  "cityAddress": "Springfield",
  "stateAddress": "IL",
  "zipAddress": "62701",
  "image": "https://..."
}
```

**Validation Rules:**

- `companyName` (required): String, max 100 chars, no special chars except &.,()-
- `phoneNumber` (required): String, valid US phone format (10 digits or formatted). It is stored and answered as its 10 digits (`"(555) 123-4567"` becomes `"5551234567"`)
- `companyEmail` (optional): Valid email format, max 150 chars
- `stateAddress` (optional): 2-letter state abbreviation
- `zipAddress` (optional): Valid 5 or 9-digit zip code

**Response (201):**

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "companyName": "Acme Corp",
    ...
  }
}
```

**Error Response (400 - Validation):**

```json
{
  "success": false,
  "message": "Invalid phone number format; Invalid email format",
  "statusCode": 400,
  "errors": ["Invalid phone number format", "Invalid email format"]
}
```

**Error Response (409 - Duplicate):**

The phone number is compared as its 10 digits, so `"(555) 123-4567"` and `"5551234567"` are the same number. Customers stored before v1.23 keep the number as it was typed, and are matched only once their numbers are normalized, which `npm run migrate:v2` does (see "Migrating a database from before v2.0" in `Docs/README.md`). The database also refuses a duplicate (`unique` index); a duplicate that reaches it answers 409 `A record with this value already exists`.

```json
{
  "success": false,
  "message": "A customer with this phone number already exists",
  "statusCode": 409
}
```

---

### 4. Update Customer

**PUT** `/customers/:id`

**Parameters:**

- `id` (required): MongoDB Customer ID

**Request Body:**

```json
{
  "companyName": "New Company Name",
  "phoneNumber": "(555) 987-6543",
  "contactName": "Jane Smith"
}
```

The body is validated like Create Customer: `companyName` and `phoneNumber` are required on every update.

`phoneNumber` follows the same rules as on create: it is stored as its 10 digits, and a number that another customer already has, in any format, answers 409.

**Response (200):**

```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "companyName": "New Company Name",
    ...
  }
}
```

---

### 5. Delete Customer

**DELETE** `/customers/:id`

**Parameters:**

- `id` (required): MongoDB Customer ID

**Response (200):**

```json
{
  "success": true,
  "message": "Customer deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    ...
  }
}
```

---

## Invoice Endpoints

### 1. Get All Invoices

**GET** `/invoices`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "companyName": "Acme Corp",
      "phoneNumber": "(555) 123-4567",
      "dateOfService": "2024-01-10",
      "invoiceNumber": "INV-001",
      "stateAddress": "IL",
      "jobDescription": "Roof inspection and repairs",
      "lineItems": [
        { "description": "Service call", "quantity": 2, "unitPriceCents": 50000, "lineTotalCents": 100000 }
      ],
      "subtotalCents": 100000,
      "taxRate": 6.25,
      "taxCents": 6250,
      "finalPriceCents": 106250,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 25
}
```

Every money amount is an integer number of cents (ADR-012): `106250` is $1,062.50. `taxRate` is a percentage (`6.25` is 6.25%). An invoice stored before v1.26 keeps its old dollar fields (`finalPrice`, `subtotal`, `tableData`) as they were and has none of the cents fields, until `npm run migrate:v2` converts it (see "Migrating a database from before v2.0" in `Docs/README.md`).

---

### 2. Create Invoice

**POST** `/invoices`

**Request Body:**

```json
{
  "companyName": "Acme Corp",
  "phoneNumber": "(555) 123-4567",
  "companyEmail": "info@acme.com",
  "streetAddress": "123 Main St",
  "cityAddress": "Springfield",
  "stateAddress": "IL",
  "zipAddress": "62701",
  "dateOfService": "2024-01-10",
  "invoiceNumber": "INV-001",
  "jobDescription": "Roof inspection and repairs",
  "lineItems": [
    {
      "description": "Service call",
      "quantity": 2,
      "unitPriceCents": 50000
    }
  ]
}
```

The server computes every figure. With the lines above in IL (6.25%), the answer holds `lineTotalCents: 100000`, `subtotalCents: 100000`, `taxRate: 6.25`, `taxCents: 6250` and `finalPriceCents: 106250`. A `lineTotalCents`, `subtotalCents` (when there are lines), `taxRate`, `taxCents` or `finalPriceCents` in the request is ignored.

**Validation Rules:**

- `companyName` (required): String
- `phoneNumber` (required): String, valid US phone format
- `dateOfService` (required): a real calendar date written `YYYY-MM-DD` (a string; `10/27/2026`, `2026-02-30` and a number are refused with 400 `Date of service must be a real date in YYYY-MM-DD format`). It is stored as a date at UTC midnight and every answer that returns an invoice (list, create, delete) sends it back as `YYYY-MM-DD`, whatever the server's time zone. An invoice stored before v1.24 with a non-date value in this field still lists, but its answer leaves out `dateOfService`, until `npm run migrate:v2` converts it (see "Migrating a database from before v2.0" in `Docs/README.md`). A value stored as `MM/DD/YYYY` before v1.24 is read in the server's local time and can come back a day off, until `npm run migrate:v2` converts it
- `invoiceNumber` (required): a non-blank string (a missing, blank or non-string value is refused with 400 `Invoice number is required`). It is stored trimmed and must be unique: the comparison is an exact match on the trimmed value, so `"INV-001"` and `" INV-001 "` are the same number, and `"042"` and `"42"` are different. A number that another invoice already has answers 409 `A record with this value already exists`. Invoices stored before v1.25 without a number are kept as they are and do not collide with each other
- `stateAddress` (required): a state code in the tax table (`CA`, `NY`, ...), exactly as written: a missing value answers 400 `State is required`, an unknown one (including `DC` and lowercase) 400 `State must be a valid state code`. The server takes the tax rate from it
- `lineItems` (optional list): each line is `{ description, quantity, unitPriceCents }`. `description` is a non-blank string (stored trimmed); `quantity` is a JSON number above 0 with at most 2 decimals; `unitPriceCents` is an integer of 0 or more. A line that fails answers 400 with `Each line item needs a description`, `Each line item quantity must be more than 0, with at most 2 decimals` or `Each line item price must be a whole number of cents, 0 or more`
- `subtotalCents` (required when there are no `lineItems`, ignored when there are): an integer of 0 or more. A missing value answers 400 `Subtotal is required when there are no line items`; a float, a negative number or a string answers 400 `Subtotal must be a whole number of cents, 0 or more`
- Amounts are JSON integers of cents (`Number.isSafeInteger`). A string (`"1999"`, `"12abc"`), a float or a negative number is refused. A result that is not a safe integer answers 400 `Amount is too large`

**How the server computes the figures** (the same functions as `/tax/calculate`):

- `lineTotalCents` = `quantity` × `unitPriceCents`, rounded half-up to a whole cent (1.5 × 333 is 500)
- `subtotalCents` = the sum of the line totals, or the sent `subtotalCents` when there are no lines
- `taxRate` = the percentage for `stateAddress` in the tax table (7.25 for CA)
- `taxCents` = `subtotalCents` × `taxRate`, rounded half-up once for the whole invoice (1000 in CT at 6.35% is 64). The rate is read as integer thousandths of a percent, so rates such as 6.875 are exact
- `finalPriceCents` = `subtotalCents` + `taxCents`

**Response (201):**

```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    ...
  }
}
```

**Error Response (409 - Duplicate invoice number):**

```json
{
  "success": false,
  "message": "A record with this value already exists",
  "statusCode": 409
}
```

---

### 3. Delete Invoice

**DELETE** `/invoices/:id`

**Parameters:**

- `id` (required): MongoDB Invoice ID

**Response (200):**

```json
{
  "success": true,
  "message": "Invoice deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    ...
  }
}
```

---

## Tax Endpoints

### 1. Get Tax Rate by State

**POST** `/tax/rate`

**Request Body:**

```json
{
  "state": "CA"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "state": "CA",
    "taxRate": 7.25
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid state code: XX",
  "statusCode": 400
}
```

---

### 2. Calculate Tax Amount

**POST** `/tax/calculate`

All amounts are integer cents (ADR-012). `taxRate` is a percentage.

**Request Body:**

```json
{
  "subtotalCents": 5997,
  "taxRate": 7.25
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "subtotalCents": 5997,
    "taxRate": 7.25,
    "taxCents": 435,
    "finalPriceCents": 6432
  }
}
```

**Validation Rules:**

- `subtotalCents` (required): a JSON integer of 0 or more. A missing value answers 400 `Subtotal is required`; a float, a negative number or a string (including `"12abc"`) answers 400 `Subtotal must be a whole number of cents, 0 or more`
- `taxRate` (required): a JSON number from 0 to 100 with at most 3 decimals. A missing value answers 400 `Tax rate is required`; a string, a value outside 0 to 100 or one with 4 decimals answers 400 `Tax rate must be a number from 0 to 100, with at most 3 decimals`
- A result that is not a safe integer answers 400 `Amount is too large`

**Rounding rule** (the same functions that `POST /invoices` uses):

- `taxCents` = `subtotalCents` × `taxRate` / 100, rounded half-up to a whole cent, once. The rate is read as integer thousandths of a percent, so rates such as 6.875 and 4.225 are exact (1000 at 6.35% is 64; 1999 at 6.625% is 132)
- `finalPriceCents` = `subtotalCents` + `taxCents`

**Error Response (400):**

```json
{
  "success": false,
  "message": "Tax rate must be a number from 0 to 100, with at most 3 decimals",
  "statusCode": 400
}
```

---

## Error Status Codes

| Code | Meaning                                                      |
| ---- | ------------------------------------------------------------ |
| 200  | OK - Request succeeded                                       |
| 201  | Created - Resource created successfully                      |
| 400  | Bad Request - Invalid input data                             |
| 403  | Forbidden - Request origin is not allowed (CORS)             |
| 404  | Not Found - Resource not found                               |
| 409  | Conflict - Duplicate resource (e.g., duplicate phone number) |
| 500  | Internal Server Error                                        |

---

## Common Error Messages

| Error                                            | Description                                 | Solution                                   |
| ------------------------------------------------ | ------------------------------------------- | ------------------------------------------ |
| Invalid phone number format                      | Phone number doesn't match expected pattern | Use format: (555) 123-4567 or 5551234567   |
| Invalid email format                             | Email is malformed                          | Use standard email format: user@domain.com |
| Invalid zip code format                          | Zip code is malformed                       | Use format: 12345 or 12345-6789            |
| Invalid state abbreviation                       | State code is not 2 letters                 | Use 2-letter state code (e.g., CA, NY)     |
| A customer with this phone number already exists | Phone number is duplicate, in any format    | Use a different phone number               |
| Customer not found                               | ID doesn't exist                            | Verify the customer ID                     |
| Invoice not found                                | Invoice ID doesn't exist                    | Verify the invoice ID                      |
| Invalid id format                                | The id in the URL is not a valid id         | Use the id the API returned                |
| Invalid request data                             | A value could not be stored as sent         | Check the field types and formats          |
| A record with this value already exists          | A unique value is already stored            | Use a different value                      |
| An error occurred while processing your request  | Unexpected server error (details are logged)| Retry; check the API log if it persists    |

---

## Authentication & Security

**Current Status:** No authentication required (development mode)

**Future Implementation:**

- JWT token authentication
- API key validation
- Rate limiting
- Request logging

---

## Examples

### Create a Customer (cURL)

```bash
curl -X POST http://localhost:3000/api/v2/customers \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Tech Solutions Inc",
    "phoneNumber": "(555) 123-4567",
    "companyEmail": "sales@techsolutions.com",
    "contactName": "John Smith",
    "streetAddress": "456 Oak Ave",
    "cityAddress": "Portland",
    "stateAddress": "OR",
    "zipAddress": "97201"
  }'
```

### Get Tax Rate (JavaScript/Fetch)

```javascript
const response = await fetch("http://localhost:3000/api/v2/tax/rate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ state: "CA" }),
});
const data = await response.json();
console.log(data.data.taxRate); // 7.25
```

---

## Version History

The full history is in [`VersionLog.md`](./VersionLog.md).

### v2.0 (Current)

- Every path is now under `/api/v2/`; the version 1 paths are gone, with no alias.
- Data stored before v2.0 is converted once by `npm run migrate:v2` (see "Migrating a database from before v2.0" in `Docs/README.md`).

### v1.0

- Initial API release
- Customer CRUD operations with validation
- Invoice management
- Tax rate calculations
- Improved error handling
- Input validation
- Pagination support
