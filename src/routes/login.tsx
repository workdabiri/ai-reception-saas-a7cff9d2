import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AuthLayout, AuthCard } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { useAuthSession, fetchCsrfToken } from "@/hooks/use-auth-session";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — AI Reception" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: sessionLoading } = useAuthSession();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const csrfRef = useRef<HTMLInputElement>(null);

  // If already authenticated, redirect to dashboard.
  useEffect(() => {
    if (!sessionLoading && isAuthenticated) {
      navigate({ to: "/", replace: true });
    }
  }, [sessionLoading, isAuthenticated, navigate]);

  async function handleGoogleSignIn() {
    setSigningIn(true);
    setError(null);
    try {
      const csrfToken = await fetchCsrfToken();
      // Set the hidden CSRF input and submit the form.
      // This triggers a standard browser form POST → Auth.js handles the
      // OAuth redirect to Google, then callback, then session cookie.
      if (csrfRef.current && formRef.current) {
        csrfRef.current.value = csrfToken;
        formRef.current.submit();
      }
    } catch {
      setError("Could not start sign-in. Please try again.");
      setSigningIn(false);
    }
  }

  if (sessionLoading) {
    return (
      <AuthLayout showPreview={false}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  if (isAuthenticated) {
    // Redirect effect will fire — show nothing.
    return null;
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Sign in to your workspace"
        description="AI Reception is a human-first, AI-assisted reception workspace for service businesses. Sign in with your organization's Google account to continue."
        footer={
          <div className="flex items-start gap-2 text-[12px] leading-snug text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <span>
              <span className="text-foreground">Secure access.</span> Only authorized team members
              can sign in. Your data stays private.
            </span>
          </div>
        }
      >
        {/* Hidden form for CSRF-safe POST sign-in */}
        <form ref={formRef} method="POST" action="/api/auth/signin/google" className="hidden">
          <input ref={csrfRef} type="hidden" name="csrfToken" value="" />
        </form>

        <div className="space-y-4">
          <Button
            type="button"
            className="w-full gap-2"
            onClick={handleGoogleSignIn}
            disabled={signingIn}
          >
            {signingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting to Google…
              </>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </Button>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-foreground">
              {error}
            </p>
          )}

          <p className="text-center text-[11.5px] text-muted-foreground">
            By signing in you agree to the <span className="text-foreground">Terms of Service</span>{" "}
            and <span className="text-foreground">Privacy Policy</span>.
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

// Inline Google icon — avoids external dependency.
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
