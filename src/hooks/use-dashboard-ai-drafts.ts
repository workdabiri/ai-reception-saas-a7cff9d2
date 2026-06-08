/**
 * Dashboard AI Draft Review — React Query Hook
 *
 * Fetches the list of reply drafts pending operator review from the backend.
 * Backed by backend PR #79: GET /api/businesses/:businessId/dashboard/ai-drafts
 *
 * Design decisions:
 * - Single GET with no params — endpoint returns all reviewable drafts for the business.
 * - staleTime: 60s — draft list is an aggregate snapshot; same cadence as other
 *   dashboard hooks to avoid redundant fan-out queries on every page focus.
 * - refetchInterval: 120s — auto-refresh every 2 minutes while the dashboard is
 *   mounted so operators see roughly live data without polling too aggressively.
 * - enabled guard: skips the query when businessId is undefined (no workspace).
 *
 * Access notes:
 * - All roles (OWNER, ADMIN, OPERATOR, VIEWER) can access this endpoint because
 *   all have ai_drafts.read permission.
 * - Drafts are operator-review items only — no LLM, no auto-send. The UI must
 *   reflect this clearly: every reply remains human-reviewed and human-sent.
 *
 * Scope:
 * - This hook is read-only (GET only). It does NOT call the generate endpoint.
 * - Draft generation (POST .../reply-drafts/generate) is out of scope for PR C.
 *
 * @module
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet, type ApiClientError } from "@/lib/api-client";
import type { DashboardAiDraftsResponse } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const dashboardAiDraftsKeys = {
  all: ["dashboardAiDrafts"] as const,
  lists: () => [...dashboardAiDraftsKeys.all, "list"] as const,
  list: (businessId: string) => [...dashboardAiDraftsKeys.lists(), businessId] as const,
};

// ---------------------------------------------------------------------------
// API path helper
// ---------------------------------------------------------------------------

function dashboardAiDraftsPath(businessId: string): string {
  return `/api/businesses/${businessId}/dashboard/ai-drafts`;
}

// ---------------------------------------------------------------------------
// Query hook
// ---------------------------------------------------------------------------

/**
 * Fetches the live AI draft review list for a business.
 *
 * Returns drafts pending operator review:
 * - pendingCount: total number of PENDING_REVIEW drafts
 * - drafts: list of reviewable draft items (PENDING_REVIEW | EDITED)
 * - generatedAt: ISO timestamp of the backend snapshot
 *
 * Drafts are system-prepared placeholders for operator review before any
 * reply is sent. No draft is ever sent automatically.
 *
 * @param businessId - The business to fetch AI drafts for
 * @param options - Additional React Query options (merged with defaults)
 */
export function useDashboardAiDrafts(
  businessId: string | undefined,
  options?: Partial<UseQueryOptions<DashboardAiDraftsResponse, ApiClientError>>,
) {
  return useQuery<DashboardAiDraftsResponse, ApiClientError>({
    queryKey: dashboardAiDraftsKeys.list(businessId ?? ""),
    queryFn: () => apiGet<DashboardAiDraftsResponse>(dashboardAiDraftsPath(businessId!)),
    enabled: !!businessId,
    // Aggregate snapshots are low-churn — 60s stale keeps the UI responsive
    // without hammering the backend on every component mount.
    staleTime: 60_000,
    // Auto-refresh every 2 minutes while the dashboard is open.
    refetchInterval: 120_000,
    ...options,
  });
}
