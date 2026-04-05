# Ken-Tech Maintenance Management System

A complete, production-ready CRUD application for managing customers and generating invoices for a home maintenance business.

**Version:** 1.0.0  
**Status:** Production Ready  
**Stack:** MERN (MongoDB, Express, React, Node.js) + Tailwind CSS

## 🎯 Project Overview

A full-stack application for managing customers and invoices with professional features:

- **API Versioning** - RESTful API with `/api/v1/` routing
- **Production Ready** - Error handling, validation, security
- **Well Documented** - API docs, README files, inline comments
- **Environment Configuration** - `.env` based setup
- **Input Validation** - Backend validation + frontend checks

## 📁 Quick Navigation

- **[Backend Setup](./NODEAPI/README.md)** - Express API setup
- **[API Documentation](./NODEAPI/API_DOCUMENTATION.md)** - Complete API reference
- **[Frontend Setup](./FRONTEND/README.md)** - React app setup

## 🚀 Quick Start

### Prerequisites

- Node.js v14+
- MongoDB Atlas (or local MongoDB)
- npm/yarn

### Backend Setup

```bash
cd NODEAPI
npm install
cp .env.example .env
# Edit .env with your MongoDB URL
npm run dev
# Server runs on http://localhost:3000
```

### Frontend Setup

```bash
cd FRONTEND
npm install
cp .env.example .env.local
npm run dev
# App runs on http://localhost:5173
```

## 📚 Key Documentation Files

| File                                                           | Purpose                                   |
| -------------------------------------------------------------- | ----------------------------------------- |
| [NODEAPI/README.md](./NODEAPI/README.md)                       | Backend setup, routes, validation         |
| [NODEAPI/API_DOCUMENTATION.md](./NODEAPI/API_DOCUMENTATION.md) | Complete API reference with examples      |
| [FRONTEND/README.md](./FRONTEND/README.md)                     | Frontend setup, components, configuration |

## 🔄 API Versioning

All endpoints use versioning: `/api/v1/{resource}`

**Customer Endpoints:**

```
GET    /api/v1/customers              # List
GET    /api/v1/customers/:id          # Get one
POST   /api/v1/customers              # Create
PUT    /api/v1/customers/:id          # Update
DELETE /api/v1/customers/:id          # Delete
```

**Invoice Endpoints:**

```
GET    /api/v1/invoices               # List
POST   /api/v1/invoices               # Create
DELETE /api/v1/invoices/:id           # Delete
```

**Tax Endpoints:**

```
POST   /api/v1/tax/rate               # Get rate
POST   /api/v1/tax/calculate          # Calculate
```

See [API_DOCUMENTATION.md](./NODEAPI/API_DOCUMENTATION.md) for complete reference.

## 📦 Project Structure

```
CRUD1/
├── NODEAPI/
│   ├── controllers/    # Business logic
│   ├── models/         # MongoDB schemas
│   ├── routes/         # Route handlers
│   ├── middlewares/    # Express middlewares
│   ├── utils/          # Errors, validation, constants
│   ├── server.js       # Express app
│   ├── package.json
│   ├── .env.example
│   ├── README.md
│   └── API_DOCUMENTATION.md
├── FRONTEND/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── config/     # API configuration
│   │   └── App.jsx
│   ├── package.json
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
└── README.md
```

## 🔐 Configuration

### Backend (.env)

```bash
MONGO_URL=mongodb+srv://...
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
API_VERSION=v1
```

### Frontend (.env.local)

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## ✅ Features

**Customer Management**

- View customers with pagination
- Create with validation
- Edit profiles
- Delete confirmation
- Duplicate phone prevention

**Invoice Management**

- Generate invoices
- Tax calculations by state
- PDF exports
- Invoice history

**User Interface**

- Responsive design
- Toast notifications
- Sweet alerts
- Smooth animations
- Tailwind styling

## 📋 Validation

**Customer:**

- Phone: Valid US format
- Email: Valid email (optional)
- Zip: 5 or 9 digits (optional)
- State: 2-letter code (optional)

**Invoice:**

- Phone: Valid US format
- Date: ISO format required
- Price: Positive number

## 🧪 Testing

```bash
# Get all customers
curl http://localhost:3000/api/v1/customers

# Create customer
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Tech Corp",
    "phoneNumber": "(555) 123-4567"
  }'
```

## 📊 Response Format

**Success:**

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {},
  "pagination": {}
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": ["Error 1", "Error 2"]
}
```

## 🚀 Deployment

**Build Frontend:**

```bash
cd FRONTEND
npm run build
# Creates dist/ folder
```

**Deploy to Vercel:**

```bash
vercel
# Set VITE_API_BASE_URL environment variable
```

**Deploy Backend to Heroku:**

```bash
heroku create
git push heroku main
# Set Config Vars in Heroku dashboard
```

## 🆘 Troubleshooting

**MongoDB connection error:**

- Verify MONGO_URL in .env
- Check IP whitelist on MongoDB Atlas

**CORS error:**

- Verify FRONTEND_URL matches your frontend domain
- Both must be running

**Validation error:**

- Phone: Use "(555) 123-4567" format
- State: Use 2-letter code like "CA"

## 📞 Support

- Backend issues → [NODEAPI/README.md](./NODEAPI/README.md)
- Frontend issues → [FRONTEND/README.md](./FRONTEND/README.md)
- API questions → [API_DOCUMENTATION.md](./NODEAPI/API_DOCUMENTATION.md)

## 📝 License

ISC

## Version History

### v1.0.0 (Current) - 2024

**Released Features:**

- API versioning (`/api/v1/`)
- Error handling improvements
- Input validation middleware
- Environment configuration
- Customer CRUD with validation
- Invoice management
- Tax calculations
- PDF exports
- Responsive UI
- Comprehensive documentation

**Key Improvements:**

- Centralized error handling
- Custom error classes
- Validation utilities
- Fixed CORS configuration
- API endpoint configuration
- Pagination support
- Duplicate prevention
- Production-ready setup
