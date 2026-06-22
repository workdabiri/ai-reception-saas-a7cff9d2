/**
 * Knowledge (Business Context) — React Query Hooks
 *
 * Query and mutation hooks for the verified business-context store.
 * All hooks require a businessId to scope API calls.
 *
 * Permission behavior (enforced server-side — this layer never fakes it):
 * - VERIFIED list           → knowledge.read
 * - DRAFT list              → knowledge.verify
 * - ARCHIVED list           → knowledge.archive
 * - single-item GET         → knowledge.verify
 * - create / verify / archive → the matching permission
 *
 * No AI generation, no provider, no prompt assembly, no send path. New items are
 * always created as DRAFT and only become AI-eligible after an explicit verify.
 *
 * @module
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet, apiPost, type ApiClientError } from "@/lib/api-client";
import type {
  BusinessContextItem,
  CreateKnowledgeItemInput,
  KnowledgeStatus,
  ListKnowledgeFilters,
} from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const knowledgeKeys = {
  all: ["knowledge"] as const,
  lists: () => [...knowledgeKeys.all, "list"] as const,
  list: (businessId: string, filters?: ListKnowledgeFilters) =>
    [...knowledgeKeys.lists(), businessId, filters] as const,
  details: () => [...knowledgeKeys.all, "detail"] as const,
  detail: (businessId: string, itemId: string) =>
    [...knowledgeKeys.details(), businessId, itemId] as const,
};

// ---------------------------------------------------------------------------
// API path helpers
// ---------------------------------------------------------------------------

function knowledgePath(businessId: string): string {
  return `/api/businesses/${businessId}/knowledge`;
}

function knowledgeItemPath(businessId: string, itemId: string): string {
  return `/api/businesses/${businessId}/knowledge/${itemId}`;
}

function verifyKnowledgePath(businessId: string, itemId: string): string {
  return `/api/businesses/${businessId}/knowledge/${itemId}/verify`;
}

function archiveKnowledgePath(businessId: string, itemId: string): string {
  return `/api/businesses/${businessId}/knowledge/${itemId}/archive`;
}

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Lists knowledge items for a business, optionally filtered by lifecycle status.
 *
 * The backend returns a flat array (no cursor pagination). When `status` is
 * omitted the backend returns VERIFIED-only items. DRAFT / ARCHIVED queues are
 * gated by elevated permissions — a 403 surfaces as an ApiClientError the caller
 * can render as a calm "no permission" state.
 *
 * @param businessId - The business to fetch knowledge for
 * @param filters - Optional filters (status, category, limit)
 * @param options - Additional React Query options
 */
export function useKnowledgeList(
  businessId: string | undefined,
  filters?: ListKnowledgeFilters,
  options?: Partial<UseQueryOptions<BusinessContextItem[], ApiClientError>>,
) {
  return useQuery<BusinessContextItem[], ApiClientError>({
    queryKey: knowledgeKeys.list(businessId ?? "", filters),
    queryFn: () =>
      apiGet<BusinessContextItem[]>(knowledgePath(businessId!), {
        status: filters?.status,
        category: filters?.category,
        limit: filters?.limit,
      }),
    enabled: !!businessId,
    ...options,
  });
}

/**
 * Fetches a single knowledge item by id.
 *
 * NOTE: the backend gates this read behind knowledge.verify (OWNER/ADMIN), so it
 * can 403 for OPERATOR/VIEWER. The list endpoints already return full item
 * objects, so the UI drives the detail/review view from list data and only needs
 * this hook for direct deep-links.
 *
 * @param businessId - The business the item belongs to
 * @param itemId - The item to fetch
 * @param options - Additional React Query options
 */
export function useKnowledgeItem(
  businessId: string | undefined,
  itemId: string | undefined,
  options?: Partial<UseQueryOptions<BusinessContextItem, ApiClientError>>,
) {
  return useQuery<BusinessContextItem, ApiClientError>({
    queryKey: knowledgeKeys.detail(businessId ?? "", itemId ?? ""),
    queryFn: () => apiGet<BusinessContextItem>(knowledgeItemPath(businessId!, itemId!)),
    enabled: !!businessId && !!itemId,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Creates a knowledge item (always created as DRAFT by the backend).
 * Invalidates all knowledge list queries on success so the Pending Review queue
 * refreshes.
 *
 * @param businessId - The business to create the item in
 */
export function useCreateKnowledgeItem(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation<BusinessContextItem, ApiClientError, CreateKnowledgeItemInput>({
    mutationFn: (input) => apiPost<BusinessContextItem>(knowledgePath(businessId), input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.lists() });
    },
  });
}

/**
 * Verifies a DRAFT item (DRAFT → VERIFIED). The backend records the verifier
 * from the authenticated context. Invalidates all knowledge lists so the item
 * moves from the DRAFT queue to the VERIFIED list.
 *
 * @param businessId - The business the item belongs to
 */
export function useVerifyKnowledgeItem(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation<BusinessContextItem, ApiClientError, { itemId: string }>({
    mutationFn: ({ itemId }) =>
      apiPost<BusinessContextItem>(verifyKnowledgePath(businessId, itemId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.lists() });
    },
  });
}

/**
 * Archives an item (any status → ARCHIVED), removing it from AI eligibility.
 * Invalidates all knowledge lists so the item leaves its current queue and
 * appears in the Archived list.
 *
 * @param businessId - The business the item belongs to
 */
export function useArchiveKnowledgeItem(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation<BusinessContextItem, ApiClientError, { itemId: string }>({
    mutationFn: ({ itemId }) =>
      apiPost<BusinessContextItem>(archiveKnowledgePath(businessId, itemId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.lists() });
    },
  });
}
