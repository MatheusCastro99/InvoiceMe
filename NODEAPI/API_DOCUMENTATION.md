# Ken-Tech Maintenance API Documentation

## API Version: v1.0

### Base URL

```
http://localhost:3000/api/v1
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

- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 20

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "companyName": "Acme Corp",
      "phoneNumber": "(555) 123-4567",
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
    "phoneNumber": "(555) 123-4567",
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
- `phoneNumber` (required): Valid US phone format (10 digits or formatted)
- `companyEmail` (optional): Valid email format
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
      "finalPrice": 1075.5,
      "jobDescription": "Roof inspection and repairs",
      "taxRate": 7.25,
      "subtotal": 1000,
      "tableData": [],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 25
}
```

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
  "finalPrice": 1075.5,
  "jobDescription": "Roof inspection and repairs",
  "tableData": [
    {
      "description": "Service call",
      "quantity": 1,
      "unitPrice": 500,
      "total": 500
    }
  ],
  "taxRate": 7.25,
  "subtotal": 1000
}
```

**Validation Rules:**

- `companyName` (required): String
- `phoneNumber` (required): Valid US phone format
- `dateOfService` (required): ISO date string
- `finalPrice` (required): Positive number

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

**Request Body:**

```json
{
  "jobPrice": 1000,
  "taxRate": 7.25
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "jobPrice": 1000,
    "taxRate": 7.25,
    "taxAmount": 72.5,
    "finalPrice": 1072.5
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Tax rate must be between 0 and 100",
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
| A customer with this phone number already exists | Phone number is duplicate                   | Use a different phone number               |
| Customer not found                               | ID doesn't exist                            | Verify the customer ID                     |
| Invoice not found                                | Invoice ID doesn't exist                    | Verify the invoice ID                      |

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
curl -X POST http://localhost:3000/api/v1/customers \
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
const response = await fetch("http://localhost:3000/api/v1/tax/rate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ state: "CA" }),
});
const data = await response.json();
console.log(data.data.taxRate); // 7.25
```

---

## Version History

### v1.0 (Current)

- Initial API release
- Customer CRUD operations with validation
- Invoice management
- Tax rate calculations
- Improved error handling
- Input validation
- Pagination support
