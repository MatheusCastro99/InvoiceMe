/**
 * Auth Session
 * The small pieces of sign-in state outside React: the current account, the API access token,
 * the dev sign-in flag, and the values kept in sessionStorage across the redirect to Microsoft
 * (where to return to, and whether the sign-in failed). sessionStorage can throw (private
 * windows, blocked storage), so every access is guarded and falls back to "nothing stored".
 */

import { AUTH_MODE, DEV_AUTH_TOKEN, loginRequest, msalInstance } from "../config/authConfig";

const RETURN_TARGET_KEY = "invoiceme.returnTo";
const DEV_SIGNED_IN_KEY = "invoiceme.devSignedIn";
const SIGN_IN_FAILED_KEY = "invoiceme.signInFailed";

export const SIGN_IN_PATH = "/signin";

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}

const readStored = (key) => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStored = (key, value) => {
  try {
    if (value === null) {
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // Nothing to do: the value is simply not remembered
  }
};

// Same-origin paths only: one leading "/" (so not "//host" or "/\host"), and not the sign-in page itself
export const isSafeReturnTarget = (target) =>
  typeof target === "string" &&
  /^\/(?![/\\])/.test(target) &&
  target !== SIGN_IN_PATH &&
  !target.startsWith(`${SIGN_IN_PATH}?`) &&
  !target.startsWith(`${SIGN_IN_PATH}/`);

export const rememberReturnTarget = (target) => {
  if (isSafeReturnTarget(target)) {
    writeStored(RETURN_TARGET_KEY, target);
  }
};

export const hasReturnTarget = () => isSafeReturnTarget(readStored(RETURN_TARGET_KEY));

// Reads and clears the remembered path: it is used once
export const takeReturnTarget = () => {
  const target = readStored(RETURN_TARGET_KEY);
  writeStored(RETURN_TARGET_KEY, null);
  return isSafeReturnTarget(target) ? target : null;
};

export const markSignInFailed = () => writeStored(SIGN_IN_FAILED_KEY, "1");

export const takeSignInFailed = () => {
  const failed = readStored(SIGN_IN_FAILED_KEY) === "1";
  writeStored(SIGN_IN_FAILED_KEY, null);
  return failed;
};

export const isDevSignedIn = () => readStored(DEV_SIGNED_IN_KEY) === "1";

export const setDevSignedIn = (signedIn) => writeStored(DEV_SIGNED_IN_KEY, signedIn ? "1" : null);

export const getCurrentAccount = () =>
  msalInstance ? msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0] || null : null;

/**
 * The access token for the API, or a SessionExpiredError when there is no session or MSAL cannot
 * renew it without the user. Any other failure (for example the network) is thrown as it is.
 */
export const getAccessToken = async () => {
  if (AUTH_MODE === "dev") {
    if (!isDevSignedIn()) {
      throw new SessionExpiredError();
    }
    return DEV_AUTH_TOKEN;
  }

  const account = getCurrentAccount();
  if (!msalInstance || !account) {
    throw new SessionExpiredError();
  }
  try {
    const result = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
    return result.accessToken;
  } catch (error) {
    if (error?.name === "InteractionRequiredAuthError") {
      throw new SessionExpiredError();
    }
    throw error;
  }
};
