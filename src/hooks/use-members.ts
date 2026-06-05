/**
 * Members — React Query Hooks
 *
 * Query hooks for business membership operations.
 * All hooks require a businessId to scope API calls.
 *
 * NOTE: The memberships API returns BusinessMembershipIdentity which includes
 * userId (UUID) but NOT user name or email. The GET /api/identity/users/:userId
 * endpoint is currently a placeholder (501 Not Implemented). Display layer must
 * handle name/email absence with honest fallbacks.
 *
 * Mutation hooks (invite, change-role, remove) are not wired — Product Owner
 * has not authorized them for this task.
 *
 * @module
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet, type ApiClientError } from "@/lib/api-client";
import type { BusinessMembership, ListMembershipsFilters } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const memberKeys = {
  all: ["members"] as const,
  lists: () => [...memberKeys.all, "list"] as const,
  list: (businessId: string, filters?: ListMembershipsFilters) =>
    [...memberKeys.lists(), businessId, filters] as const,
};

// ---------------------------------------------------------------------------
// API path helpers
// ---------------------------------------------------------------------------

function membershipsPath(businessId: string): string {
  return `/api/businesses/${businessId}/memberships`;
}

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Fetches all memberships for a business.
 *
 * The backend returns all memberships in a single array (no cursor pagination).
 * By default, REMOVED and LEFT memberships are excluded.
 * Pass `{ includeRemoved: true }` to include them.
 *
 * @param businessId - The business to fetch memberships for
 * @param filters - Optional filters (includeRemoved)
 * @param options - Additional React Query options
 */
export function useMembers(
  businessId: string | undefined,
  filters?: ListMembershipsFilters,
  options?: Partial<UseQueryOptions<BusinessMembership[], ApiClientError>>,
) {
  return useQuery<BusinessMembership[], ApiClientError>({
    queryKey: memberKeys.list(businessId ?? "", filters),
    queryFn: () =>
      apiGet<BusinessMembership[]>(membershipsPath(businessId!), {
        includeRemoved: filters?.includeRemoved,
      }),
    enabled: !!businessId,
    ...options,
  });
}
