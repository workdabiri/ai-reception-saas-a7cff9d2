/**
 * Conversations — React Query Hooks
 *
 * Query and mutation hooks for conversation operations.
 * All hooks require a businessId to scope API calls.
 *
 * @module
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, type ApiClientError } from "@/lib/api-client";
import type {
  ConversationWithSummary,
  PaginatedConversations,
  CreateConversationInput,
  UpdateConversationInput,
  ChangeConversationStatusInput,
  ListConversationsFilters,
  Conversation,
} from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const conversationKeys = {
  all: ["conversations"] as const,
  lists: () => [...conversationKeys.all, "list"] as const,
  list: (businessId: string, filters?: ListConversationsFilters) =>
    [...conversationKeys.lists(), businessId, filters] as const,
  details: () => [...conversationKeys.all, "detail"] as const,
  detail: (businessId: string, conversationId: string) =>
    [...conversationKeys.details(), businessId, conversationId] as const,
};

// ---------------------------------------------------------------------------
// API path helpers
// ---------------------------------------------------------------------------

function conversationsPath(businessId: string): string {
  return `/api/businesses/${businessId}/conversations`;
}

function conversationPath(businessId: string, conversationId: string): string {
  return `/api/businesses/${businessId}/conversations/${conversationId}`;
}

function conversationStatusPath(businessId: string, conversationId: string): string {
  return `/api/businesses/${businessId}/conversations/${conversationId}/status`;
}

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Fetches a paginated list of conversations for a business.
 *
 * @param businessId - The business to fetch conversations for
 * @param filters - Optional filters (status, channel, assignedUserId, customerId, limit, cursor)
 * @param options - Additional React Query options
 */
export function useConversations(
  businessId: string | undefined,
  filters?: ListConversationsFilters,
  options?: Partial<UseQueryOptions<PaginatedConversations, ApiClientError>>,
) {
  return useQuery<PaginatedConversations, ApiClientError>({
    queryKey: conversationKeys.list(businessId ?? "", filters),
    queryFn: () =>
      apiGet<PaginatedConversations>(conversationsPath(businessId!), {
        status: filters?.status,
        channel: filters?.channel,
        assignedUserId: filters?.assignedUserId,
        customerId: filters?.customerId,
        limit: filters?.limit,
        cursor: filters?.cursor,
      }),
    enabled: !!businessId,
    ...options,
  });
}

/**
 * Fetches a single conversation by ID.
 *
 * @param businessId - The business the conversation belongs to
 * @param conversationId - The conversation to fetch
 * @param options - Additional React Query options
 */
export function useConversation(
  businessId: string | undefined,
  conversationId: string | undefined,
  options?: Partial<UseQueryOptions<ConversationWithSummary, ApiClientError>>,
) {
  return useQuery<ConversationWithSummary, ApiClientError>({
    queryKey: conversationKeys.detail(businessId ?? "", conversationId ?? ""),
    queryFn: () => apiGet<ConversationWithSummary>(conversationPath(businessId!, conversationId!)),
    enabled: !!businessId && !!conversationId,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Creates a new conversation.
 * Invalidates conversation list queries on success.
 *
 * @param businessId - The business to create the conversation in
 */
export function useCreateConversation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation<ConversationWithSummary, ApiClientError, CreateConversationInput>({
    mutationFn: (input) => apiPost<ConversationWithSummary>(conversationsPath(businessId), input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(),
      });
    },
  });
}

/**
 * Updates an existing conversation (subject, customerId, metadata).
 * Invalidates both the specific conversation and the list on success.
 *
 * @param businessId - The business the conversation belongs to
 * @param conversationId - The conversation to update
 */
export function useUpdateConversation(businessId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<ConversationWithSummary, ApiClientError, UpdateConversationInput>({
    mutationFn: (input) =>
      apiPatch<ConversationWithSummary>(conversationPath(businessId, conversationId), input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(businessId, conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(),
      });
    },
  });
}

/**
 * Changes the status of a conversation.
 * Invalidates both the specific conversation and the list on success.
 *
 * @param businessId - The business the conversation belongs to
 * @param conversationId - The conversation to change status for
 */
export function useChangeConversationStatus(businessId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<Conversation, ApiClientError, ChangeConversationStatusInput>({
    mutationFn: (input) =>
      apiPost<Conversation>(conversationStatusPath(businessId, conversationId), input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(businessId, conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(),
      });
    },
  });
}
