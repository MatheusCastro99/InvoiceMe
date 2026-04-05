# Ken-Tech Maintenance Frontend

Modern React application for managing customers and generating invoices for a home maintenance business.

## Project Information

- **Version**: 1.0.0
- **Framework**: React 18.2+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Library**: Material-UI (MUI)

## Features

✅ **Customer Management**

- View all customers with pagination
- Create new customers with validation
- Edit customer information
- Delete customers with confirmation
- Customer profile pages

✅ **Invoice Generation**

- Create detailed invoices for customers
- Tax rate calculation by state
- Dynamic pricing with tax calculation
- Table-based invoice items
- Invoice history and deletion

✅ **PDF Exports**

- Generate PDF invoices
- Customizable PDF styling
- Professional invoice templates

✅ **User Interface**

- Responsive design (mobile-friendly)
- Modern UI with Tailwind CSS
- Toast notifications
- Sweet Alert dialogs
- Smooth transitions and animations

✅ **Environment Configuration**

- Dynamic API endpoint configuration
- Support for different environments
- Easy deployment configuration

## Getting Started

### Prerequisites

- Node.js v14 or higher
- npm or yarn
- Backend API running on http://localhost:3000

### Installation

1. **Install Dependencies**

   ```bash
   cd FRONTEND
   npm install
   ```

2. **Configure Environment**

   ```bash
   # Copy the example env file
   cp .env.example .env.local
   ```

3. **Update `.env.local` (if needed):**
   ```bash
   VITE_API_BASE_URL=http://localhost:3000
   ```

### Running the Application

**Development Mode:**

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

**Build for Production:**

```bash
npm run build
```

**Preview Production Build:**

```bash
npm run preview
```

## Environment Configuration

### .env.local Variables

| Variable            | Default               | Description          |
| ------------------- | --------------------- | -------------------- |
| `VITE_API_BASE_URL` | http://localhost:3000 | Backend API base URL |

### Using Environment Variables

The `src/config/apiConfig.js` automatically reads environment variables:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
```

## API Integration

All API calls use the centralized configuration in `src/config/apiConfig.js`:

```javascript
import { API_ENDPOINTS, apiRequest } from "./config/apiConfig";

// Get all customers
const response = await apiRequest(API_ENDPOINTS.CUSTOMERS.LIST);

// Create customer
const response = await apiRequest(API_ENDPOINTS.CUSTOMERS.CREATE, {
  method: "POST",
  body: JSON.stringify(customerData),
});
```

## Dependencies

### UI & Styling

- **react**: JavaScript library for UI
- **tailwindcss**: Utility-first CSS framework
- **@mui/material**: Material Design components

### Utilities

- **react-router-dom**: Client-side routing
- **axios**: HTTP client
- **react-toastify**: Toast notifications
- **sweetalert2**: Alert dialogs
- **@react-pdf/renderer**: PDF generation
- **dayjs**: Date manipulation

## Building & Deployment

### Production Build

```bash
npm run build
# Creates optimized build in 'dist' folder
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel
# Set VITE_API_BASE_URL during deployment
```

## Troubleshooting

### API Connection Error

- Verify backend is running on port 3000
- Check `VITE_API_BASE_URL` in `.env.local`
- Ensure CORS is properly configured in backend

### Phone Number Validation Error

- Use format: `(555) 123-4567` or `5551234567`

### Build Failures

```bash
rm -rf node_modules
npm install
npm run build
```

## Support & Documentation

- **API Docs**: See ../NODEAPI/API_DOCUMENTATION.md
- **Backend Setup**: See ../NODEAPI/README.md
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev

## License

ISC

## Version History

### v1.0.0 (Current) - 2024

- ✨ Initial production-ready release
- ✨ Centralized API configuration
- ✨ Environment-based setup
- ✨ Complete customer management UI
- ✨ Invoice generation system
- ✨ PDF export functionality
- ✨ Form validation
- ✨ Responsive design
