/**
 * useAuth
 * One hook for the sign-in state, whichever way the app signs in (see AUTH_MODE in config/authConfig.js).
 * Returns { status, name, signIn, signUp, signOut }:
 *   status: "loading" (MSAL is busy), "signedIn", "signedOut" or "unconfigured" (no sign-in is set up)
 *   name:   the account's display name, or its username when it has no name
 *   signIn, signUp, signOut: start the redirect to Microsoft (or, in a dev-server run, the dev session).
 *     signIn and signUp resolve to true only when the user is signed in without leaving the page (dev session)
 * The implementation is picked once, at load, so a component always calls the same hooks.
 */

import { useSyncExternalStore } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { AUTH_MODE, DEV_ACCOUNT_NAME, loginRequest } from "../config/authConfig";
import { SIGN_IN_PATH, isDevSignedIn, setDevSignedIn, subscribeDevSignedIn } from "./authSession";

const useEntraAuth = () => {
  const { instance, inProgress, accounts } = useMsal();
  const account = instance.getActiveAccount() || accounts[0] || null;

  let status = "signedOut";
  if (inProgress !== InteractionStatus.None) {
    status = "loading";
  } else if (account) {
    status = "signedIn";
  }

  return {
    status,
    name: account ? account.name || account.username : "",
    signIn: () => instance.loginRedirect(loginRequest),
    // Opens Microsoft's sign-up form directly
    signUp: () => instance.loginRedirect({ ...loginRequest, prompt: "create" }),
    signOut: () => instance.logoutRedirect({ account, postLogoutRedirectUri: `${window.location.origin}${SIGN_IN_PATH}` }),
  };
};

const useDevAuth = () => {
  const signedIn = useSyncExternalStore(subscribeDevSignedIn, isDevSignedIn);
  return {
    status: signedIn ? "signedIn" : "signedOut",
    name: signedIn ? DEV_ACCOUNT_NAME : "",
    signIn: async () => {
      setDevSignedIn(true);
      return true;
    },
    signUp: async () => {
      setDevSignedIn(true);
      return true;
    },
    signOut: async () => setDevSignedIn(false),
  };
};

const useUnconfiguredAuth = () => ({
  status: "unconfigured",
  name: "",
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

// The dev branch is behind import.meta.env.DEV, which a production build replaces with false, so useDevAuth
// and its sessionStorage flag are dropped from the build
const pickAuth = () => {
  if (import.meta.env.DEV && AUTH_MODE === "dev") {
    return useDevAuth;
  }
  return AUTH_MODE === "entra" ? useEntraAuth : useUnconfiguredAuth;
};

export const useAuth = pickAuth();
