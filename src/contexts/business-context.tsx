/* eslint-disable react-refresh/only-export-components -- co-exports of provider + hook are intentional in this context file. */
/**
 * Business Context — provides the active business ID to all downstream hooks.
 *
 * Current implementation: reads from VITE_DEV_BUSINESS_ID env var.
 * Future: will source from Auth.js session / workspace membership.
 *
 * @module
 */

import { createContext, useContext, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface BusinessContextValue {
  /** UUID of the active business, or undefined if not resolved yet */
  businessId: string | undefined;
}

const BusinessContext = createContext<BusinessContextValue>({
  businessId: undefined,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Wraps the app tree and provides the active businessId.
 *
 * For development: reads `VITE_DEV_BUSINESS_ID` from environment.
 * For production: will be replaced with session-derived business membership.
 */
export function BusinessProvider({ children }: { children: ReactNode }) {
  const businessId =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_DEV_BUSINESS_ID) || undefined;

  return <BusinessContext.Provider value={{ businessId }}>{children}</BusinessContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the active business ID from context.
 *
 * All R3B hooks accept `businessId: string | undefined` and disable
 * themselves when undefined, so this is always safe to call.
 */
export function useBusinessId(): string | undefined {
  return useContext(BusinessContext).businessId;
}
