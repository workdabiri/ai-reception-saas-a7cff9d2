/**
 * Dashboard Summary — React Query Hook
 *
 * Fetches the dashboard KPI aggregate from the backend summary endpoint.
 * Backed by backend PR #77: GET /api/businesses/:businessId/dashboard/summary
 *
 * Design decisions:
 * - Single GET with no params — endpoint computes all aggregates server-side.
 * - staleTime: 60s — KPIs are aggregate snapshots, not real-time streams;
 *   a 1-minute cache avoids redundant fan-out queries on every page focus.
 * - refetchInterval: 120s — auto-refresh every 2 minutes while the dashboard
 *   is mounted so operators see roughly live data without polling too aggressively.
 * - enabled guard: skips the query when businessId is undefined (no workspace).
 *
 * Access notes:
 * - All roles (OWNER, ADMIN, OPERATOR, VIEWER) can access this endpoint
 *   because all have conversations.read permission.
 * - The accessAlerts field will be null for OPERATOR/VIEWER (no audit.read).
 *   The UI must treat null as "restricted" — not as zero.
 *
 * @module
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet, type ApiClientError } from "@/lib/api-client";
import type { DashboardSummary } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summaries: () => [...dashboardKeys.all, "summary"] as const,
  summary: (businessId: string) => [...dashboardKeys.summaries(), businessId] as const,
};

// ---------------------------------------------------------------------------
// API path helper
// ---------------------------------------------------------------------------

function dashboardSummaryPath(businessId: string): string {
  return `/api/businesses/${businessId}/dashboard/summary`;
}

// ---------------------------------------------------------------------------
// Query hook
// ---------------------------------------------------------------------------

/**
 * Fetches the live dashboard KPI summary for a business.
 *
 * Returns aggregate counts for the KPI row:
 * - openConversations, waitingForOperator, needsFollowUp, draftsPendingReview
 * - accessAlerts (null when caller lacks audit.read)
 * - generatedAt (ISO timestamp of the backend snapshot)
 *
 * @param businessId - The business to fetch the summary for
 * @param options - Additional React Query options (merged with defaults)
 */
export function useDashboardSummary(
  businessId: string | undefined,
  options?: Partial<UseQueryOptions<DashboardSummary, ApiClientError>>,
) {
  return useQuery<DashboardSummary, ApiClientError>({
    queryKey: dashboardKeys.summary(businessId ?? ""),
    queryFn: () => apiGet<DashboardSummary>(dashboardSummaryPath(businessId!)),
    enabled: !!businessId,
    // Aggregate snapshots are low-churn — 60s stale keeps the UI responsive
    // without hammering the backend on every component mount.
    staleTime: 60_000,
    // Auto-refresh every 2 minutes while the dashboard is open.
    refetchInterval: 120_000,
    ...options,
  });
}
