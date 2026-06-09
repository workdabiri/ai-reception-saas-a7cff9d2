/**
 * Reply Draft Actions — React Query Mutation Hooks
 *
 * Mutation hooks for reply draft lifecycle operations:
 * - Generate draft (POST .../reply-drafts/generate)
 * - Edit draft (POST .../reply-drafts/:draftId/edit)
 * - Discard draft (POST .../reply-drafts/:draftId/discard)
 * - Approve draft (POST .../reply-drafts/:draftId/approve)
 *
 * NO send mutation. Send is not implemented in this MVP step.
 *
 * On success, mutations invalidate:
 * - Current draft query (conversation-level)
 * - Dashboard AI drafts query (dashboard aggregate)
 * - Dashboard summary query (KPI draftsPendingReview count)
 *
 * @module
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, type ApiClientError } from "@/lib/api-client";
import type {
  GenerateDraftResponse,
  EditDraftResponse,
  DiscardDraftResponse,
  ApproveDraftResponse,
} from "@/lib/api-types";
import { currentDraftKeys } from "./use-current-reply-draft";
import { dashboardAiDraftsKeys } from "./use-dashboard-ai-drafts";
import { dashboardKeys } from "./use-dashboard-summary";

// ---------------------------------------------------------------------------
// API path helpers
// ---------------------------------------------------------------------------

function generateDraftPath(businessId: string, conversationId: string): string {
  return `/api/businesses/${businessId}/conversations/${conversationId}/reply-drafts/generate`;
}

function editDraftPath(businessId: string, conversationId: string, draftId: string): string {
  return `/api/businesses/${businessId}/conversations/${conversationId}/reply-drafts/${draftId}/edit`;
}

function discardDraftPath(businessId: string, conversationId: string, draftId: string): string {
  return `/api/businesses/${businessId}/conversations/${conversationId}/reply-drafts/${draftId}/discard`;
}

function approveDraftPath(businessId: string, conversationId: string, draftId: string): string {
  return `/api/businesses/${businessId}/conversations/${conversationId}/reply-drafts/${draftId}/approve`;
}

// ---------------------------------------------------------------------------
// Shared invalidation helper
// ---------------------------------------------------------------------------

function invalidateDraftQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  businessId: string,
  conversationId: string,
) {
  // Refetch current draft for this conversation
  queryClient.invalidateQueries({
    queryKey: currentDraftKeys.detail(businessId, conversationId),
  });
  // Refresh dashboard AI drafts list
  queryClient.invalidateQueries({
    queryKey: dashboardAiDraftsKeys.all,
  });
  // Refresh dashboard summary KPIs (draftsPendingReview count)
  queryClient.invalidateQueries({
    queryKey: dashboardKeys.all,
  });
}

// ---------------------------------------------------------------------------
// Generate draft
// ---------------------------------------------------------------------------

/**
 * Generates a new draft or reuses an existing stub for a conversation.
 * POST .../reply-drafts/generate (backend PR #80)
 *
 * No request body required.
 */
export function useGenerateDraft(businessId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<GenerateDraftResponse, ApiClientError, void>({
    mutationFn: () => apiPost<GenerateDraftResponse>(generateDraftPath(businessId, conversationId)),
    onSuccess: () => {
      invalidateDraftQueries(queryClient, businessId, conversationId);
    },
  });
}

// ---------------------------------------------------------------------------
// Edit draft
// ---------------------------------------------------------------------------

export interface EditDraftInput {
  draftId: string;
  draftText: string;
}

/**
 * Edits an existing draft's text.
 * POST .../reply-drafts/:draftId/edit (backend PR #83)
 *
 * Body: { draftText: string }
 */
export function useEditDraft(businessId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<EditDraftResponse, ApiClientError, EditDraftInput>({
    mutationFn: (input) =>
      apiPost<EditDraftResponse>(editDraftPath(businessId, conversationId, input.draftId), {
        draftText: input.draftText,
      }),
    onSuccess: () => {
      invalidateDraftQueries(queryClient, businessId, conversationId);
    },
  });
}

// ---------------------------------------------------------------------------
// Discard draft
// ---------------------------------------------------------------------------

export interface DiscardDraftInput {
  draftId: string;
}

/**
 * Discards a draft.
 * POST .../reply-drafts/:draftId/discard (backend PR #82)
 *
 * No request body required.
 */
export function useDiscardDraft(businessId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<DiscardDraftResponse, ApiClientError, DiscardDraftInput>({
    mutationFn: (input) =>
      apiPost<DiscardDraftResponse>(discardDraftPath(businessId, conversationId, input.draftId)),
    onSuccess: () => {
      invalidateDraftQueries(queryClient, businessId, conversationId);
    },
  });
}

// ---------------------------------------------------------------------------
// Approve draft
// ---------------------------------------------------------------------------

export interface ApproveDraftInput {
  draftId: string;
}

/**
 * Approves a draft (operator approval only — does NOT send).
 * POST .../reply-drafts/:draftId/approve (backend PR #84)
 *
 * Approval does not send this message. Sending will be added in a separate step.
 * No request body required.
 */
export function useApproveDraft(businessId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<ApproveDraftResponse, ApiClientError, ApproveDraftInput>({
    mutationFn: (input) =>
      apiPost<ApproveDraftResponse>(approveDraftPath(businessId, conversationId, input.draftId)),
    onSuccess: () => {
      invalidateDraftQueries(queryClient, businessId, conversationId);
    },
  });
}
