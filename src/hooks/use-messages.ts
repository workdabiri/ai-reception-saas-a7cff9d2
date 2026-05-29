/**
 * Messages — React Query Hooks
 *
 * Query and mutation hooks for message operations within a conversation.
 * All hooks require both businessId and conversationId.
 *
 * @module
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet, apiPost, type ApiClientError } from "@/lib/api-client";
import type {
  Message,
  PaginatedMessages,
  CreateMessageInput,
  ListMessagesFilters,
} from "@/lib/api-types";
import { conversationKeys } from "./use-conversations";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const messageKeys = {
  all: ["messages"] as const,
  lists: () => [...messageKeys.all, "list"] as const,
  list: (businessId: string, conversationId: string, filters?: ListMessagesFilters) =>
    [...messageKeys.lists(), businessId, conversationId, filters] as const,
};

// ---------------------------------------------------------------------------
// API path helpers
// ---------------------------------------------------------------------------

function messagesPath(businessId: string, conversationId: string): string {
  return `/api/businesses/${businessId}/conversations/${conversationId}/messages`;
}

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Fetches a paginated list of messages for a conversation.
 *
 * @param businessId - The business the conversation belongs to
 * @param conversationId - The conversation to fetch messages for
 * @param filters - Optional filters (direction, limit, cursor)
 * @param options - Additional React Query options
 */
export function useMessages(
  businessId: string | undefined,
  conversationId: string | undefined,
  filters?: ListMessagesFilters,
  options?: Partial<UseQueryOptions<PaginatedMessages, ApiClientError>>,
) {
  return useQuery<PaginatedMessages, ApiClientError>({
    queryKey: messageKeys.list(businessId ?? "", conversationId ?? "", filters),
    queryFn: () =>
      apiGet<PaginatedMessages>(messagesPath(businessId!, conversationId!), {
        direction: filters?.direction,
        limit: filters?.limit,
        cursor: filters?.cursor,
      }),
    enabled: !!businessId && !!conversationId,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Creates a new message in a conversation (outbound, inbound, or internal note).
 * Invalidates message list and parent conversation on success.
 *
 * @param businessId - The business the conversation belongs to
 * @param conversationId - The conversation to add the message to
 */
export function useCreateMessage(businessId: string, conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<Message, ApiClientError, CreateMessageInput>({
    mutationFn: (input) => apiPost<Message>(messagesPath(businessId, conversationId), input),
    onSuccess: () => {
      // Invalidate message list for this conversation
      queryClient.invalidateQueries({
        queryKey: messageKeys.lists(),
      });
      // Invalidate conversation detail (lastMessageAt, messageCount change)
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(businessId, conversationId),
      });
      // Invalidate conversation list (lastMessageAt changes sort order)
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(),
      });
    },
  });
}
