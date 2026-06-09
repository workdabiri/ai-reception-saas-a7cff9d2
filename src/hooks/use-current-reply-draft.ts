/**
 * Current Reply Draft — React Query Hook
 *
 * Fetches the current active draft for a selected conversation.
 * Backed by backend PR #85: GET /api/businesses/:businessId/conversations/:conversationId/reply-drafts/current
 *
 * Design decisions:
 * - Requires both businessId and conversationId to be defined before querying.
 * - staleTime: 30s — selected conversation is the active focus; slightly fresher than dashboard.
 * - refetchInterval: false — no polling; mutations refetch on success.
 * - Returns full draftText for operator review/editing.
 * - Returns draft: null when no active draft exists.
 * - Active statuses: PENDING_REVIEW, EDITED, APPROVED.
 * - DISCARDED and SENT are excluded by the backend.
 *
 * This hook is read-only. Mutations are in use-reply-draft-actions.ts.
 *
 * @module
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet, type ApiClientError } from "@/lib/api-client";
import type { CurrentReplyDraftResponse } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const currentDraftKeys = {
  all: ["currentReplyDraft"] as const,
  details: () => [...currentDraftKeys.all, "detail"] as const,
  detail: (businessId: string, conversationId: string) =>
    [...currentDraftKeys.details(), businessId, conversationId] as const,
};

// ---------------------------------------------------------------------------
// API path helper
// ---------------------------------------------------------------------------

function currentDraftPath(businessId: string, conversationId: string): string {
  return `/api/businesses/${businessId}/conversations/${conversationId}/reply-drafts/current`;
}

// ---------------------------------------------------------------------------
// Query hook
// ---------------------------------------------------------------------------

/**
 * Fetches the current active draft for a conversation.
 *
 * Returns the latest active draft (PENDING_REVIEW | EDITED | APPROVED)
 * or draft: null when no active draft exists.
 *
 * Full draftText is included for operator review/editing.
 * Model metadata is NOT included (omitted by backend).
 *
 * @param businessId - The business the conversation belongs to
 * @param conversationId - The conversation to fetch the current draft for
 * @param options - Additional React Query options (merged with defaults)
 */
export function useCurrentReplyDraft(
  businessId: string | undefined,
  conversationId: string | undefined,
  options?: Partial<UseQueryOptions<CurrentReplyDraftResponse, ApiClientError>>,
) {
  return useQuery<CurrentReplyDraftResponse, ApiClientError>({
    queryKey: currentDraftKeys.detail(businessId ?? "", conversationId ?? ""),
    queryFn: () =>
      apiGet<CurrentReplyDraftResponse>(currentDraftPath(businessId!, conversationId!)),
    enabled: !!businessId && !!conversationId,
    // Selected conversation is the active focus — slightly fresher than dashboard.
    staleTime: 30_000,
    // No polling — mutations refetch on success.
    refetchInterval: false,
    ...options,
  });
}
