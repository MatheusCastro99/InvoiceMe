# Ken-Tech Maintenance Backend API

A production-ready Express.js/Node.js API for managing customers and invoices for a home maintenance business.

## Project Information

- **Version**: 1.0.0
- **API Version**: v1.0
- **Status**: Production Ready
- **Node.js**: v14+ recommended
- **MongoDB**: v4.0+

## Features

✅ **Security & Versioning**

- RESTful API with versioning (`/api/v1/...`)
- Environment-based configuration
- CORS security implementation
- Credentials management via `.env`

✅ **Data Validation**

- Comprehensive input validation middleware
- Phone number, email, zip code validation
- Duplicate customer prevention
- Type-safe MongoDB schemas

✅ **Error Handling**

- Centralized error handling middleware
- Custom error classes
- Meaningful error messages
- Structured error responses

✅ **Customer Management**

- Full CRUD operations
- Pagination support
- Duplicate phone number prevention
- Comprehensive customer profiles

✅ **Invoice Management**

- Invoice generation and tracking
- Tax calculations
- Invoice deletion

✅ **Tax Management**

- State-based tax rates
- Tax calculation utility
- Support for all US states

## Project Structure

```
NODEAPI/
├── controllers/          # Business logic
│   ├── customerController.js
│   ├── invoiceController.js
│   └── taxController.js
├── models/              # MongoDB schemas
│   ├── customerModel.js
│   └── invoiceModel.js
├── routes/              # API route handlers
│   ├── customerRoute.js
│   ├── invoiceRoute.js
│   └── taxRoute.js
├── middlewares/         # Express middlewares
│   ├── errorMiddleware.js
│   └── validationMiddleware.js
├── utils/               # Utility functions
│   ├── errors.js        # Custom error classes
│   ├── validators.js    # Validation functions
│   └── constants.js     # App constants (tax rates, messages)
├── server.js            # Express app configuration
├── package.json         # Dependencies
├── .env.example         # Environment template
└── API_DOCUMENTATION.md # Complete API docs
```

## Getting Started

### Prerequisites

- Node.js v14 or higher
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone and Install Dependencies**

   ```bash
   cd NODEAPI
   npm install
   ```

2. **Configure Environment**

   ```bash
   # Copy the example env file
   cp .env.example .env

   # Edit .env with your values
   nano .env
   ```

3. **Update `.env` file:**
   ```bash
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority&appName=AppName
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   API_VERSION=v1
   ```

### Running the Server

**Development Mode (with auto-reload):**

```bash
npm run dev
```

**Production Mode:**

```bash
npm run api
```

The API will start at `http://localhost:3000`

**Health Check:**

```bash
curl http://localhost:3000/health
```

## API Usage

### Base URL

```
http://localhost:3000/api/v1
```

### Quick Examples

**Get All Customers:**

```bash
curl http://localhost:3000/api/v1/customers
```

**Create a Customer:**

```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Tech Corp",
    "phoneNumber": "(555) 123-4567",
    "companyEmail": "info@techcorp.com"
  }'
```

**Get Tax Rate:**

```bash
curl -X POST http://localhost:3000/api/v1/tax/rate \
  -H "Content-Type: application/json" \
  -d '{"state": "CA"}'
```

**Calculate Tax:**

```bash
curl -X POST http://localhost:3000/api/v1/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{"jobPrice": 1000, "taxRate": 7.25}'
```

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## API Routes Reference

### Customers (`/api/v1/customers`)

| Method | Endpoint | Description                   |
| ------ | -------- | ----------------------------- |
| GET    | `/`      | Get all customers (paginated) |
| GET    | `/:id`   | Get customer by ID            |
| POST   | `/`      | Create new customer           |
| PUT    | `/:id`   | Update customer               |
| DELETE | `/:id`   | Delete customer               |

### Invoices (`/api/v1/invoices`)

| Method | Endpoint | Description        |
| ------ | -------- | ------------------ |
| GET    | `/`      | Get all invoices   |
| POST   | `/`      | Create new invoice |
| DELETE | `/:id`   | Delete invoice     |

### Tax (`/api/v1/tax`)

| Method | Endpoint     | Description                   |
| ------ | ------------ | ----------------------------- |
| POST   | `/rate`      | Get tax rate by state         |
| POST   | `/calculate` | Calculate tax and final price |

## Validation Rules

### Customer Fields

- **companyName**: Required, 1-100 chars, alphanumeric + spaces and basic symbols
- **phoneNumber**: Required, valid US phone format
- **companyEmail**: Optional, valid email format
- **stateAddress**: Optional, 2-letter state abbreviation
- **zipAddress**: Optional, 5 or 9-digit zip code

### Invoice Fields

- **companyName**: Required
- **phoneNumber**: Required, valid US phone format
- **dateOfService**: Required, ISO date format
- **finalPrice**: Required, positive number

## Error Handling

The API uses centralized error handling with consistent response format:

**Error Response Example:**

```json
{
  "success": false,
  "message": "Invalid phone number format; Invalid email format",
  "statusCode": 400,
  "errors": ["Invalid phone number format", "Invalid email format"]
}
```

## Environment Variables

| Variable       | Default               | Description               |
| -------------- | --------------------- | ------------------------- |
| `MONGO_URL`    | -                     | MongoDB connection string |
| `PORT`         | 3000                  | Server port               |
| `NODE_ENV`     | development           | Environment mode          |
| `FRONTEND_URL` | http://localhost:5173 | Frontend domain for CORS  |
| `API_VERSION`  | v1                    | API version (for routing) |

## Dependencies

### Production

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **express-async-handler**: Async error handling

### Development

- **nodemon**: Auto-reload server during development

## Version Management

### Current Version: 1.0.0

**Versioning Strategy:**

- All routes prefixed with `/api/v1/`
- Version changes require migration guide
- Backward compatibility maintained within major version
- Breaking changes only in major version bumps

**Future Versions:**

- v2.0: Authentication & authorization
- v2.1: Advanced filtering & search
- v3.0: Rate limiting & analytics

## Security Considerations

✅ Implemented:

- Input validation & sanitization
- Environment variable protection (.env.example)
- CORS configuration
- Error middleware (no stack traces in production)

⏳ TODO for Production:

- JWT authentication
- API key validation
- Rate limiting
- Request logging & monitoring
- HTTPS enforcement
- Helmet.js for security headers

## Deployment Checklist

- [ ] Update `.env` with production credentials
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas with SSL
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/SSL certificate
- [ ] Set up environment variables on hosting platform
- [ ] Test all endpoints with production credentials
- [ ] Set up error logging (Sentry/LogRocket)
- [ ] Configure monitoring & alerts
- [ ] Create backup strategy for MongoDB

## Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED
```

- Verify MONGO_URL in .env
- Check MongoDB Atlas IP whitelist
- Ensure network connectivity

### CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

- Verify FRONTEND_URL in .env matches your frontend domain
- Check CORS options in server.js

### Validation Errors

```
"Invalid phone number format"
```

- Use format: `(555) 123-4567` or `5551234567`
- Reference validation rules section

## Contributing

When contributing code:

1. Follow existing code style
2. Add documentation to new functions
3. Update API_DOCUMENTATION.md for new endpoints
4. Test all changes locally
5. Update version number in package.json

## Support & Documentation

- **API Docs**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Frontend Setup**: See ../FRONTEND/README.md
- **Error Messages**: See API_DOCUMENTATION.md "Common Error Messages" section

## License

ISC

## Version History

### v1.0.0 (Current) - 2024

- ✨ Initial production-ready release
- ✨ API versioning (`/api/v1/`)
- ✨ Comprehensive input validation
- ✨ Centralized error handling
- ✨ Complete API documentation
- ✨ Pagination support
- ✨ Duplicate prevention for customers
- ✨ Environment-based configuration
