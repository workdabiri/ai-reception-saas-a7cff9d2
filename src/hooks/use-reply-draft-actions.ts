/**
 * Reply Draft Actions — React Query Mutation Hooks
 *
 * Mutation hooks for reply draft lifecycle operations:
 * - Generate draft (POST .../reply-drafts/generate)
 * - Edit draft (POST .../reply-drafts/:draftId/edit)
 * - Discard draft (POST .../reply-drafts/:draftId/discard)
 * - Approve draft (POST .../reply-drafts/:draftId/approve)
 * - Send draft (POST .../reply-drafts/:draftId/send)
 *
 * Send is the explicit, operator-triggered step that transitions an APPROVED
 * draft to SENT and creates one internal OUTBOUND message in the conversation.
 * It does NOT dispatch to any external channel (WhatsApp/email/SMS) or provider.
 *
 * On success, mutations invalidate:
 * - Current draft query (conversation-level)
 * - Dashboard AI drafts query (dashboard aggregate)
 * - Dashboard summary query (KPI draftsPendingReview count)
 * Send additionally invalidates the conversation transcript + conversation lists
 * (a new outbound message changes message count / last-message ordering).
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
  SendDraftResponse,
} from "@/lib/api-types";
import { currentDraftKeys } from "./use-current-reply-draft";
import { dashboardAiDraftsKeys } from "./use-dashboard-ai-drafts";
import { dashboardKeys } from "./use-dashboard-summary";
import { messageKeys } from "./use-messages";
import { conversationKeys } from "./use-conversations";

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

function sendDraftPath(businessId: string, conversationId: string, draftId: string): string {
  return `/api/businesses/${businessId}/conversations/${conversationId}/reply-drafts/${draftId}/send`;
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
 * Approval does not send this message; sending is a separate, explicit operator
 * action (see useSendDraft). Nothing is ever sent automatically.
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

// ---------------------------------------------------------------------------
// Send draft
// ---------------------------------------------------------------------------

export interface SendDraftInput {
  draftId: string;
}

/**
 * Sends an APPROVED draft (operator-triggered): transitions APPROVED → SENT and
 * creates one internal OUTBOUND message in the conversation.
 * POST .../reply-drafts/:draftId/send
 *
 * This creates a real outbound message in the conversation transcript, but does
 * NOT dispatch to any external channel/provider. Idempotent: a re-send returns
 * success without creating a duplicate message.
 *
 * On success it invalidates the draft queries (the current draft typically
 * disappears, since SENT is excluded from the active draft) AND the conversation
 * message/list queries (the new outbound message must appear in the transcript).
 *
 * No request body required.
 */
export function useSendDraft(businessId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<SendDraftResponse, ApiClientError, SendDraftInput>({
    mutationFn: (input) =>
      apiPost<SendDraftResponse>(sendDraftPath(businessId, conversationId, input.draftId)),
    onSuccess: () => {
      invalidateDraftQueries(queryClient, businessId, conversationId);
      // A new outbound message was created — refresh the conversation transcript
      // and the conversation lists (message count / last-message ordering change).
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(businessId, conversationId),
      });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}
