/**
 * Auth Configuration
 * Sign-in settings for the frontend (ADR-014: Microsoft Entra External ID).
 * Everything comes from VITE_ environment variables (ADR-007); the frontend holds no secret.
 *
 * AUTH_MODE is one of:
 *   "entra": the three VITE_ENTRA_* values are set, and msalInstance signs the user in by redirect
 *   "dev":   a dev-server run with VITE_DEV_AUTH_TOKEN (printed by `npm run dev:auth` in NODEAPI);
 *            no MSAL, and "signed in" is a flag in sessionStorage. Never present in a production build
 *   "none":  no sign-in is configured; the sign-in page says so
 */

import { PublicClientApplication } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID;
const authority = import.meta.env.VITE_ENTRA_AUTHORITY;

// The full scope the browser asks for: api://<api-client-id>/<scope-name>
export const API_SCOPE = import.meta.env.VITE_ENTRA_API_SCOPE;

// Both dev values sit behind the DEV flag, which Vite replaces with `false` in a production build,
// so the token (even when set in the build's environment) and the label are removed from it
export const DEV_AUTH_TOKEN = import.meta.env.DEV ? import.meta.env.VITE_DEV_AUTH_TOKEN || "" : "";
export const DEV_ACCOUNT_NAME = import.meta.env.DEV ? "Dev user" : "";

const authorityHost = (() => {
  try {
    return new URL(authority).hostname;
  } catch {
    return "";
  }
})();

const isEntraConfigured = Boolean(clientId && authorityHost && API_SCOPE);

export const AUTH_MODE = DEV_AUTH_TOKEN ? "dev" : isEntraConfigured ? "entra" : "none";

export const msalInstance =
  AUTH_MODE === "entra"
    ? new PublicClientApplication({
        auth: {
          clientId,
          authority,
          knownAuthorities: [authorityHost],
          redirectUri: `${window.location.origin}/`,
          postLogoutRedirectUri: `${window.location.origin}/signin`,
        },
        // The tab's sessionStorage (MSAL's default): the token goes when the tab closes
        cache: { cacheLocation: "sessionStorage" },
      })
    : null;

export const loginRequest = { scopes: [API_SCOPE] };
