/**
 * Customer list helpers
 * The API answers the customer list one page at a time. fetchAllCustomers walks every page and returns one array,
 * for the pages that need the whole list (the home page and the invoice picker).
 */
import axios from "axios";
import API_ENDPOINTS from "../config/apiConfig";

// The server caps `limit` at PAGINATION.MAX_LIMIT (NODEAPI/utils/constants.js); keep the two in step.
const PAGE_SIZE = 100;

// Every customer, newest first, from all of the API's pages. Errors propagate to the caller.
export const fetchAllCustomers = async () => {
    const byId = new Map();
    let page = 1;
    let pages;
    do {
        const response = await axios.get(API_ENDPOINTS.CUSTOMERS.LIST, { params: { page, limit: PAGE_SIZE } });
        const body = response?.data;
        const batch = body?.data ?? body;
        // A malformed answer fails loudly: the callers show it as a toast, not an empty list that looks like no customers.
        if (!Array.isArray(batch)) throw new Error("The customer list could not be read");
        // A customer created while the pages are fetched shifts the later pages, so one can arrive twice.
        batch.forEach((customer) => {
            if (!byId.has(customer._id)) byId.set(customer._id, customer);
        });
        // An answer with no pagination block counts as the only page.
        pages = body?.pagination?.pages ?? 1;
        page += 1;
    } while (page <= pages);
    return [...byId.values()];
};
