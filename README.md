# InvoiceMe

A web app for managing customers and creating invoices.

Stack: MongoDB, Express, React and Node.js, with Vite and Tailwind CSS.

## Run it locally

Requires Node.js 20.19 or later and a MongoDB instance.

1. Install the dependencies:
   ```bash
   npm install
   npm --prefix NODEAPI install
   npm --prefix FRONTEND install
   ```
2. Copy `NODEAPI/.env.example` to `NODEAPI/.env` and set `MONGO_URL`. Without it, the API uses a local MongoDB at `mongodb://127.0.0.1:27017/API-test`.
3. Start the API and the frontend together from the root:
   ```bash
   npm run dev
   ```
   The API listens on http://localhost:3000 and the frontend on http://localhost:5173.
