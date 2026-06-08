/**
 * Operator Workload — React Query Hook
 *
 * Fetches per-operator assignment counts from the backend workload endpoint.
 * Backed by backend PR #78: GET /api/businesses/:businessId/dashboard/operator-workload
 *
 * Design decisions:
 * - staleTime: 60s — workload is an aggregate snapshot; same cadence as dashboard summary.
 * - refetchInterval: 120s — auto-refreshes every 2 minutes while the dashboard is mounted.
 * - enabled guard: skips the query when businessId is undefined (no active workspace).
 *
 * Access notes:
 * - All roles (OWNER, ADMIN, OPERATOR, VIEWER) can access this endpoint because all
 *   have conversations.read permission.
 * - The operators list reflects ALL active members with assignments — not filtered to
 *   the current user. This is intentional for self-assignment coordination.
 *
 * @module
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet, type ApiClientError } from "@/lib/api-client";
import type { OperatorWorkloadResponse } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const operatorWorkloadKeys = {
  all: ["operatorWorkload"] as const,
  workloads: () => [...operatorWorkloadKeys.all, "workload"] as const,
  workload: (businessId: string) => [...operatorWorkloadKeys.workloads(), businessId] as const,
};

// ---------------------------------------------------------------------------
// API path helper
// ---------------------------------------------------------------------------

function operatorWorkloadPath(businessId: string): string {
  return `/api/businesses/${businessId}/dashboard/operator-workload`;
}

// ---------------------------------------------------------------------------
// Query hook
// ---------------------------------------------------------------------------

/**
 * Fetches the live operator workload summary for a business.
 *
 * Returns per-operator assignment counts and unassigned conversation totals:
 * - operators: sorted by openAssigned DESC, then name ASC (backend-ordered)
 * - unassigned.open: conversations with no assignedUserId in non-RESOLVED status
 * - generatedAt: ISO timestamp of the backend snapshot
 *
 * @param businessId - The business to fetch the workload for
 * @param options - Additional React Query options (merged with defaults)
 */
export function useOperatorWorkload(
  businessId: string | undefined,
  options?: Partial<UseQueryOptions<OperatorWorkloadResponse, ApiClientError>>,
) {
  return useQuery<OperatorWorkloadResponse, ApiClientError>({
    queryKey: operatorWorkloadKeys.workload(businessId ?? ""),
    queryFn: () => apiGet<OperatorWorkloadResponse>(operatorWorkloadPath(businessId!)),
    enabled: !!businessId,
    // Aggregate snapshots are low-churn — 60s stale keeps the UI responsive
    // without hammering the backend on every component mount.
    staleTime: 60_000,
    // Auto-refresh every 2 minutes while the dashboard is open.
    refetchInterval: 120_000,
    ...options,
  });
}
