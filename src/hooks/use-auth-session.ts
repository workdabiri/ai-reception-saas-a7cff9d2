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
 */
export function useAuthSession(): UseAuthSessionReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchSession = useCallback(async () => {
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
