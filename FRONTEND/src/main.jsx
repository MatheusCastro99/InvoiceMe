import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./config/authConfig";
import { installAuthInterceptors } from "./utils/authInterceptors";
import { markSignInFailed } from "./utils/authSession";

installAuthInterceptors();

const root = ReactDOM.createRoot(document.getElementById('root'));

const render = () => {
  const app = msalInstance ? (
    <MsalProvider instance={msalInstance}>
      <App/>
    </MsalProvider>
  ) : (
    <App/>
  );

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        {app}
      </BrowserRouter>
    </React.StrictMode>,
  );
};

if (msalInstance) {
  // Finish a sign-in that just came back from Microsoft before the first render, so the pages
  // never flash a signed-out state. A failed return is remembered for the sign-in page.
  msalInstance
    .initialize()
    .then(() => msalInstance.handleRedirectPromise())
    .then((result) => {
      if (result?.account) {
        msalInstance.setActiveAccount(result.account);
      }
    })
    .catch(() => markSignInFailed())
    .finally(render);
} else {
  render();
}
