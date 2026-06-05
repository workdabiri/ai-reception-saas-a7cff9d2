/**
 * Audit Events — React Query Hooks
 *
 * Query hooks for tenant audit event read operations.
 * All hooks require a businessId to scope API calls.
 *
 * Fetching strategy:
 * - Fetches up to limit=100 events in a single request.
 * - All filter logic (actorType, result, dateRange, query) is applied
 *   client-side on the fetched array. This avoids re-fetching on every
 *   filter change and works safely when the API handler feature gate is
 *   off (501 is handled by the error boundary).
 *
 * NOTE: AuditEventIdentity does NOT include actor display name or workspace
 * name. The GET /api/identity/users/:userId endpoint is currently a 501
 * placeholder. The display layer must handle these absences with honest
 * fallbacks.
 *
 * Mutation hooks (create/delete audit events) are not wired — audit is
 * immutable by design; no Product Owner authorization exists.
 *
 * @module
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet, type ApiClientError } from "@/lib/api-client";
import type { AuditEvent } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const auditKeys = {
  all: ["audit-events"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (businessId: string) => [...auditKeys.lists(), businessId] as const,
};

// ---------------------------------------------------------------------------
// API path helpers
// ---------------------------------------------------------------------------

function auditEventsPath(businessId: string): string {
  return `/api/businesses/${businessId}/audit-events`;
}

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Fetches the most recent audit events for a business (up to 100).
 *
 * The backend returns a flat array — not paginated.
 * Filtering is applied client-side; no filter query params are sent.
 *
 * @param businessId - The business whose audit log to fetch
 * @param options - Additional React Query options
 */
export function useAuditEvents(
  businessId: string | undefined,
  options?: Partial<UseQueryOptions<AuditEvent[], ApiClientError>>,
) {
  return useQuery<AuditEvent[], ApiClientError>({
    queryKey: auditKeys.list(businessId ?? ""),
    queryFn: () => apiGet<AuditEvent[]>(auditEventsPath(businessId!), { limit: 100 }),
    enabled: !!businessId,
    ...options,
  });
}
