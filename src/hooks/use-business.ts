/**
 * Business — React Query Hook
 *
 * Tenant-scoped hook for fetching a single business by ID.
 * Uses GET /api/businesses/:businessId (requires business.read permission).
 *
 * Permission: business.read — granted to ALL roles (OWNER, ADMIN, OPERATOR, VIEWER).
 * Feature gate: areApiHandlersEnabled() on the backend.
 *
 * @module
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet, type ApiClientError } from "@/lib/api-client";
import type { BusinessIdentity } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const businessKeys = {
  all: ["business"] as const,
  detail: (businessId: string) => [...businessKeys.all, businessId] as const,
};

// ---------------------------------------------------------------------------
// Query hook
// ---------------------------------------------------------------------------

/**
 * Fetches a single business by ID.
 *
 * Requires an authenticated session with active membership in the business.
 * The backend validates membership via resolveTenantRequestContext.
 *
 * @param businessId - The business UUID to fetch. Hook disables itself when undefined.
 * @param options - Additional React Query options
 */
export function useBusiness(
  businessId: string | undefined,
  options?: Partial<UseQueryOptions<BusinessIdentity, ApiClientError>>,
) {
  return useQuery<BusinessIdentity, ApiClientError>({
    queryKey: businessKeys.detail(businessId ?? ""),
    queryFn: () => apiGet<BusinessIdentity>(`/api/businesses/${businessId}`),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes — business metadata rarely changes
    ...options,
  });
}
