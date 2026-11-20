import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useAuth } from "../utils/useAuth";
import { SIGN_IN_PATH, hasReturnTarget, rememberReturnTarget, takeReturnTarget } from "../utils/authSession";

export const LoadingState = ({ label }) => (
  <div role="status" className="flex flex-col items-center gap-4 py-16 text-ink">
    <CircularProgress color="inherit" aria-hidden="true" />
    <p className="text-base">{label}</p>
  </div>
);

/**
 * Guards the app's routes: a signed-out visitor goes to the sign-in page, and the path they asked
 * for is remembered. A sign-in comes back to "/" (main.jsx turns off MSAL's own return to the start
 * page), so the remembered path is used there, once.
 */
const RequireAuth = () => {
  const { status } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const signedOut = status === "signedOut" || status === "unconfigured";
  const returning = status === "signedIn" && location.pathname === "/" && hasReturnTarget();

  // Signing out from inside the app is not a request for the page: nothing is remembered for it
  const wasSignedIn = useRef(false);
  useEffect(() => {
    if (signedOut && !wasSignedIn.current) {
      rememberReturnTarget(`${location.pathname}${location.search}`);
    }
    wasSignedIn.current = status === "signedIn";
  }, [status, signedOut, location.pathname, location.search]);

  useEffect(() => {
    if (returning) {
      const target = takeReturnTarget();
      if (target) {
        navigate(target, { replace: true });
      }
    }
  }, [returning, navigate]);

  if (status === "loading") {
    return <LoadingState label="Signing you in..." />;
  }
  if (signedOut) {
    return <Navigate to={SIGN_IN_PATH} replace />;
  }
  if (returning) {
    return <LoadingState label="Opening your page..." />;
  }
  return <Outlet />;
};

export default RequireAuth;
