/**
 * My Businesses — React Query Hook
 *
 * Fetches the list of businesses the current user has active membership in.
 * Uses GET /api/businesses (authenticated, no tenant scope needed).
 *
 * The backend calls TenancyService.listUserBusinesses({ userId }) internally,
 * using the authenticated session's userId. The frontend does NOT send userId
 * as a query param — the backend extracts it from the Auth.js session.
 *
 * Response is a flat BusinessIdentity[] array.
 *
 * @module
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet, type ApiClientError } from "@/lib/api-client";
import type { BusinessIdentity } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const myBusinessesKeys = {
  all: ["my-businesses"] as const,
  list: () => [...myBusinessesKeys.all, "list"] as const,
};

// ---------------------------------------------------------------------------
// Query hook
// ---------------------------------------------------------------------------

/**
 * Fetches the businesses the current authenticated user is a member of.
 *
 * Requires an authenticated session — the backend reads userId from the
 * Auth.js session cookie. No businessId or tenant scope needed.
 *
 * @param enabled - Whether the query should execute (default: true).
 *   Pass false to defer until auth session is confirmed.
 * @param options - Additional React Query options
 */
export function useMyBusinesses(
  enabled = true,
  options?: Partial<UseQueryOptions<BusinessIdentity[], ApiClientError>>,
) {
  return useQuery<BusinessIdentity[], ApiClientError>({
    queryKey: myBusinessesKeys.list(),
    queryFn: () => apiGet<BusinessIdentity[]>("/api/businesses"),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes — business list rarely changes
    ...options,
  });
}
