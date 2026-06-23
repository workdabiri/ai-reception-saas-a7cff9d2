/* eslint-disable react-refresh/only-export-components -- co-exports of provider + hook are intentional in this context file. */
/**
 * Business Context — provides the active business ID to all downstream hooks.
 *
 * Resolution order:
 * 1. VITE_DEV_BUSINESS_ID env var (local dev shortcut — skips auth)
 * 2. Auth.js session → GET /api/businesses → auto-select or localStorage pref
 *
 * When neither source resolves, businessId is undefined and all downstream
 * hooks disable themselves safely.
 *
 * Security note: businessId from this context is a UX hint only. Backend
 * validates membership on every tenant-scoped request via
 * resolveTenantContext — frontend selection cannot escalate access.
 *
 * @module
 */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useMyBusinesses } from "@/hooks/use-my-businesses";
import type { BusinessIdentity } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** localStorage key for persisting the user's last active business */
const ACTIVE_BUSINESS_KEY = "aia:activeBusinessId";

// ---------------------------------------------------------------------------
// Context types
// ---------------------------------------------------------------------------

export interface BusinessContextValue {
  /** UUID of the active business, or undefined if not resolved yet */
  businessId: string | undefined;

  /** Full list of businesses the user is a member of */
  businesses: BusinessIdentity[];

  /** True while session or business list is loading */
  isLoading: boolean;

  /** True when the user is authenticated but has no business memberships */
  isEmpty: boolean;

  /** Error from the businesses fetch, if any */
  error: Error | null;

  /** Switch to a different business (multi-business users) */
  switchBusiness: (businessId: string) => void;
}

const BusinessContext = createContext<BusinessContextValue>({
  businessId: undefined,
  businesses: [],
  isLoading: true,
  isEmpty: false,
  error: null,
  switchBusiness: () => {},
});

// ---------------------------------------------------------------------------
// Dev env shortcut
// ---------------------------------------------------------------------------

function getDevBusinessId(): string | undefined {
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.DEV &&
    import.meta.env?.VITE_DEV_BUSINESS_ID
  ) {
    return import.meta.env.VITE_DEV_BUSINESS_ID;
  }
  return undefined;
}

/** Local display name for the dev business shortcut (optional override). */
function getDevBusinessName(): string {
  const fromEnv =
    typeof import.meta !== "undefined" ? import.meta.env?.VITE_DEV_BUSINESS_NAME : undefined;
  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) return fromEnv.trim();
  return "Local Smoke Business";
}

/**
 * Builds a synthetic, clearly-local BusinessIdentity for the dev shortcut.
 *
 * Display-only: it lets the app shell render a real workspace name/initials
 * during local smoke testing instead of falling back to "No workspace". It does
 * NOT change the resolved businessId and grants no access — the backend still
 * validates real membership on every tenant-scoped request via
 * resolveTenantContext, so this cannot escalate scope.
 *
 * Dev-only: only reachable when getDevBusinessId() resolves (which itself
 * requires import.meta.env.DEV === true), so this whole path is statically
 * dead-code-eliminated from production builds.
 */
function getDevBusiness(businessId: string): BusinessIdentity {
  return {
    id: businessId,
    name: getDevBusinessName(),
    slug: "local-smoke-business",
    status: "ACTIVE",
    timezone: "UTC",
    locale: "en-US",
    createdByUserId: businessId, // synthetic placeholder; never sent to the backend
    createdAt: "1970-01-01T00:00:00.000Z",
    updatedAt: "1970-01-01T00:00:00.000Z",
  };
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function readStoredPreference(): string | null {
  try {
    return localStorage.getItem(ACTIVE_BUSINESS_KEY);
  } catch {
    return null;
  }
}

function writeStoredPreference(businessId: string): void {
  try {
    localStorage.setItem(ACTIVE_BUSINESS_KEY, businessId);
  } catch {
    // localStorage may be unavailable in some contexts
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Wraps the app tree and provides the active businessId.
 *
 * Resolution:
 * 1. If VITE_DEV_BUSINESS_ID is set → use it directly (dev shortcut).
 * 2. Otherwise, wait for Auth.js session → fetch GET /api/businesses →
 *    select the stored preference or first available business.
 */
export function BusinessProvider({ children }: { children: ReactNode }) {
  const devBusinessId = getDevBusinessId();

  // If dev override is set, skip all auth-based resolution
  if (devBusinessId) {
    return (
      <BusinessContext.Provider
        value={{
          businessId: devBusinessId,
          // Synthetic, display-only identity so the shell shows a workspace name
          // (e.g. "Local Smoke Business") instead of "No workspace" during local
          // smoke testing. Backend still validates real membership per request.
          businesses: [getDevBusiness(devBusinessId)],
          isLoading: false,
          isEmpty: false,
          error: null,
          switchBusiness: () => {},
        }}
      >
        {children}
      </BusinessContext.Provider>
    );
  }

  return <AuthBasedBusinessProvider>{children}</AuthBasedBusinessProvider>;
}

/**
 * Auth-based business provider — sources businessId from real session + membership.
 *
 * Separated from the main provider so the dev shortcut path avoids
 * any auth/query hook calls (hooks must be called unconditionally).
 */
function AuthBasedBusinessProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: sessionLoading } = useAuthSession();

  // Only fetch businesses when authenticated
  const {
    data: businesses = [],
    isLoading: businessesLoading,
    error: businessesError,
  } = useMyBusinesses(isAuthenticated);

  // Selected business ID — derived from localStorage preference or first available
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  // Auto-select when businesses load
  useEffect(() => {
    if (businesses.length === 0) {
      setSelectedId(undefined);
      return;
    }

    // Check localStorage preference
    const stored = readStoredPreference();
    const storedIsValid = stored && businesses.some((b) => b.id === stored);

    if (storedIsValid) {
      setSelectedId(stored);
    } else {
      // Auto-select first business
      setSelectedId(businesses[0].id);
      writeStoredPreference(businesses[0].id);
    }
  }, [businesses]);

  const switchBusiness = useCallback(
    (businessId: string) => {
      const valid = businesses.some((b) => b.id === businessId);
      if (valid) {
        setSelectedId(businessId);
        writeStoredPreference(businessId);
      }
    },
    [businesses],
  );

  const isLoading = sessionLoading || (isAuthenticated && businessesLoading);
  const isEmpty =
    !sessionLoading && isAuthenticated && !businessesLoading && businesses.length === 0;

  return (
    <BusinessContext.Provider
      value={{
        businessId: selectedId,
        businesses,
        isLoading,
        isEmpty,
        error: businessesError,
        switchBusiness,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Returns the active business ID from context.
 *
 * All tenant-scoped hooks accept `businessId: string | undefined` and disable
 * themselves when undefined, so this is always safe to call.
 */
export function useBusinessId(): string | undefined {
  return useContext(BusinessContext).businessId;
}

/**
 * Returns the full business context including the list of businesses,
 * loading state, and switch function.
 *
 * Use this in components that need to display the business switcher
 * or handle the no-business empty state.
 */
export function useBusinessContext(): BusinessContextValue {
  return useContext(BusinessContext);
}
