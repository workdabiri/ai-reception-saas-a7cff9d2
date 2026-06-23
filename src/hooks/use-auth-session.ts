import { useState, useEffect, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Auth session hook — fetches /api/auth/session and exposes auth state.
// Uses same-origin fetch with credentials so the session cookie is sent.
// ---------------------------------------------------------------------------

export interface AuthUser {
  /** Internal user UUID — threaded from Auth.js JWT `token.sub` into `session.user.id` */
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface AuthSession {
  user?: AuthUser;
  expires?: string;
}

export interface UseAuthSessionReturn {
  /** The authenticated user, or null if unauthenticated. */
  user: AuthUser | null;
  /** True while the initial session fetch is in-flight. */
  isLoading: boolean;
  /** True when a valid user object was returned. */
  isAuthenticated: boolean;
  /** Error message if the session fetch failed. */
  error: string | null;
  /** Re-fetch the session (e.g. after sign-in). */
  refresh: () => void;
}

// ---------------------------------------------------------------------------
// Dev-only auth session bypass (LOCAL SMOKE TESTING ONLY)
//
// Lets the local frontend be smoke-tested without Google OAuth credentials by
// short-circuiting the route guard with a synthetic development user.
//
// SAFETY BOUNDARY — this is dev-only and production-INACTIVE:
//   - It activates ONLY when BOTH conditions hold (see isDevAuthSessionEnabled).
//   - `import.meta.env.DEV` is statically `true` only under `vite dev`; in any
//     production build it is statically `false`, so the bypass branch is
//     dead-code-eliminated from prod bundles even if VITE_DEV_AUTH_SESSION is
//     accidentally set to "true".
//   - It adds NO real auth, NO OAuth, NO network call, and NO secrets.
// ---------------------------------------------------------------------------

/** Synthetic, clearly non-production development user. */
const DEV_AUTH_USER: AuthUser = {
  id: "dev-user-local",
  name: "Local Dev User",
  email: "dev.user.local@example.test",
  image: null,
};

/**
 * Whether the dev-only auth session bypass is active.
 *
 * Requires BOTH:
 *   1. `import.meta.env.DEV === true`  → only `vite dev`; always false in prod builds.
 *   2. `import.meta.env.VITE_DEV_AUTH_SESSION === "true"` → explicit local opt-in.
 *
 * Both gates are required so production behavior never changes, even if the env
 * var is mistakenly set. Local smoke testing only.
 */
export function isDevAuthSessionEnabled(): boolean {
  return import.meta.env.DEV === true && import.meta.env.VITE_DEV_AUTH_SESSION === "true";
}

/**
 * Builds the synthetic development session used when the bypass is active.
 * Deterministic; no network, no real credentials. Dev-only.
 */
export function createDevAuthSession(): AuthSession {
  return {
    user: { ...DEV_AUTH_USER },
    // Far-future, fixed expiry — deterministic and clearly synthetic.
    expires: "9999-12-31T23:59:59.000Z",
  };
}

/**
 * Fetches the Auth.js session from the same-origin backend.
 *
 * The session endpoint is proxied via Vercel rewrites:
 *   /api/auth/session → backend Auth.js handler
 *
 * Returns `{ user: null, isAuthenticated: false }` when:
 *   - Response body is `null` (Auth.js "no session")
 *   - Response body has no `user` property
 *   - Fetch fails
 *
 * Dev-only bypass: when `isDevAuthSessionEnabled()` is true this returns a
 * synthetic authenticated session immediately and never calls
 * `/api/auth/session`. Production-inactive via `import.meta.env.DEV`.
 */
export function useAuthSession(): UseAuthSessionReturn {
  // Evaluated once per render; statically false in production builds.
  const devBypass = isDevAuthSessionEnabled();

  const [user, setUser] = useState<AuthUser | null>(
    devBypass ? (createDevAuthSession().user ?? null) : null,
  );
  // No initial loading flash when bypassing — the session is known synchronously.
  const [isLoading, setIsLoading] = useState(!devBypass);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchSession = useCallback(async () => {
    // Dev-only bypass: re-apply the synthetic session deterministically and
    // skip the network entirely. Production-inactive via import.meta.env.DEV.
    if (isDevAuthSessionEnabled()) {
      if (mountedRef.current) {
        setUser(createDevAuthSession().user ?? null);
        setError(null);
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        // Auth.js returns 200 for valid sessions and null body for
        // unauthenticated. A non-200 status is unexpected but safe
        // to treat as unauthenticated.
        if (mountedRef.current) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      const text = await res.text();
      if (!text || text === "null") {
        if (mountedRef.current) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      const data: AuthSession = JSON.parse(text);
      if (mountedRef.current) {
        setUser(data?.user ?? null);
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Session fetch failed");
        setUser(null);
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchSession();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchSession]);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    error,
    refresh: fetchSession,
  };
}

// ---------------------------------------------------------------------------
// CSRF helper — fetches the Auth.js CSRF token for sign-in POST requests.
// ---------------------------------------------------------------------------

/**
 * Fetches the CSRF token from `/api/auth/csrf`.
 * Required for safe form-POST sign-in to Auth.js providers.
 */
export async function fetchCsrfToken(): Promise<string> {
  const res = await fetch("/api/auth/csrf", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch CSRF token");
  const data = await res.json();
  return data.csrfToken;
}
