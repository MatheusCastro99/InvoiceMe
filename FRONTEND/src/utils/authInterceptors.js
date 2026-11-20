/**
 * Auth Interceptors
 * Installed once on the global axios instance, so no call site changes (#172):
 *  - a request to the API (API_ENDPOINTS.BASE) gets `Authorization: Bearer <token>`; a request to any
 *    other host is left alone, so the token is never sent elsewhere
 *  - a 401 from the API, or a session that cannot be renewed, sends the user to the sign-in page with
 *    the expired-session message, once, and the request's promise stays pending: the page that made it
 *    shows no error toast, because the browser is leaving
 * Every other error rejects as before.
 */

import axios from "axios";
import { API_ENDPOINTS } from "../config/apiConfig";
import {
  SIGN_IN_PATH,
  SessionExpiredError,
  getAccessToken,
  rememberReturnTarget,
  setDevSignedIn,
} from "./authSession";

const apiBase = API_ENDPOINTS.BASE.replace(/\/+$/, "");

// The API's own address, not one that merely starts with it (http://localhost:3000.example.com)
const isApiUrl = (url) =>
  typeof url === "string" &&
  url.startsWith(apiBase) &&
  (url.length === apiBase.length || "/?#".includes(url[apiBase.length]));

let leaving = false;

const endSession = () => {
  if (!leaving) {
    leaving = true;
    const { pathname, search } = window.location;
    if (pathname !== SIGN_IN_PATH) {
      rememberReturnTarget(`${pathname}${search}`);
      setDevSignedIn(false);
      // A full navigation: it drops every request still in flight and starts the app clean
      window.location.replace(`${SIGN_IN_PATH}?reason=expired`);
    }
  }
  return new Promise(() => {});
};

let installed = false;

export const installAuthInterceptors = () => {
  if (installed) {
    return;
  }
  installed = true;

  axios.interceptors.request.use(async (config) => {
    if (!isApiUrl(config.url)) {
      return config;
    }
    try {
      const token = await getAccessToken();
      config.headers.set("Authorization", `Bearer ${token}`);
      return config;
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        return endSession();
      }
      throw error;
    }
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && isApiUrl(error.config?.url)) {
        return endSession();
      }
      return Promise.reject(error);
    },
  );
};
