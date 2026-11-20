import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@mui/material";
import { LoadingState } from "../components/RequireAuth";
import { useAuth } from "../utils/useAuth";
import { takeSignInFailed } from "../utils/authSession";

const primaryButton = "w-full bg-primary! hover:bg-primary-hover! text-white! normal-case! text-base! font-medium! py-2!";
const secondaryButton = "w-full border-primary! text-primary! hover:bg-primary-soft! normal-case! text-base! font-medium! py-2!";

/**
 * The page a signed-out visitor lands on. It hands the sign-in to Microsoft's hosted page by redirect;
 * "Create account" opens the sign-up form there. The expired-session message comes with ?reason=expired.
 */
const SignInPage = () => {
  const { status, signIn, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const [failed, setFailed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [signedInHere, setSignedInHere] = useState(false);
  const expired = searchParams.get("reason") === "expired";

  // A sign-in that came back from Microsoft with an error leaves a note, read once
  useEffect(() => {
    if (takeSignInFailed()) {
      setFailed(true);
    }
  }, []);

  if (status === "loading") {
    return <LoadingState label="Signing you in..." />;
  }
  // Someone who is already signed in has nothing to do here, unless they were sent back because the API refused their session
  if (status === "signedIn" && (!expired || signedInHere)) {
    return <Navigate to="/" replace />;
  }

  const start = async (action) => {
    setStarting(true);
    setFailed(false);
    try {
      // A dev session starts right here and answers true; a redirect to Microsoft leaves the page
      if (await action()) {
        setSignedInHere(true);
      }
    } catch {
      setFailed(true);
    }
    setStarting(false);
  };

  return (
    <main className="mx-auto mt-8 w-full max-w-md rounded-lg border-t-4 border-t-primary bg-white p-8 shadow-md sm:mt-16">
      <h1 className="text-2xl font-semibold text-ink">Sign in to InvoiceMe</h1>
      <p className="mt-2 text-base text-muted">Your customers and invoices, in one place.</p>

      {expired && (
        <p role="status" className="mt-8 rounded-lg border border-primary bg-primary-soft p-4 text-base text-ink">
          Your session has ended. Sign in again to pick up where you left off.
        </p>
      )}
      {failed && (
        <p role="alert" className="mt-8 rounded-lg border border-danger p-4 text-base text-danger">
          Sign-in didn't finish. Please try again.
        </p>
      )}

      {status === "unconfigured" ? (
        <p role="alert" className="mt-8 rounded-lg border border-danger p-4 text-base text-danger">
          Sign-in isn't set up yet. Add the VITE_ENTRA_ settings described in the README.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          <Button variant="contained" disableElevation className={primaryButton} disabled={starting} onClick={() => start(signIn)}>
            Sign in
          </Button>
          <Button variant="outlined" className={secondaryButton} disabled={starting} onClick={() => start(signUp)}>
            Create account
          </Button>
        </div>
      )}
    </main>
  );
};

export default SignInPage;
