/**
 * API Configuration
 * Centralized API endpoint configuration
 * Supports environment-based configuration
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_VERSION = "v2";

export const API_ENDPOINTS = {
  // Base URLs
  BASE: API_BASE_URL,
  VERSION: API_VERSION,

  // Customer Endpoints
  CUSTOMERS: {
    LIST: `${API_BASE_URL}/api/${API_VERSION}/customers`,
    CREATE: `${API_BASE_URL}/api/${API_VERSION}/customers`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/${API_VERSION}/customers/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/${API_VERSION}/customers/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/${API_VERSION}/customers/${id}`,
  },

  // Invoice Endpoints
  INVOICES: {
    LIST: `${API_BASE_URL}/api/${API_VERSION}/invoices`,
    CREATE: `${API_BASE_URL}/api/${API_VERSION}/invoices`,
    DELETE: (id) => `${API_BASE_URL}/api/${API_VERSION}/invoices/${id}`,
  },

  // Tax Endpoints
  TAX: {
    GET_RATE: `${API_BASE_URL}/api/${API_VERSION}/tax/rate`,
    CALCULATE: `${API_BASE_URL}/api/${API_VERSION}/tax/calculate`,
  },

  // Health Check
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_ENDPOINTS;
