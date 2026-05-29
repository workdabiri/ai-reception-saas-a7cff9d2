/**
 * Customers — React Query Hooks
 *
 * Query and mutation hooks for customer (CRM) operations.
 * All hooks require a businessId to scope API calls.
 *
 * @module
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { apiGet, apiPost, type ApiClientError } from "@/lib/api-client";
import type {
  Customer,
  CustomerWithContacts,
  PaginatedCustomers,
  CreateCustomerInput,
  ResolveCustomerInput,
  ListCustomersFilters,
} from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (businessId: string, filters?: ListCustomersFilters) =>
    [...customerKeys.lists(), businessId, filters] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (businessId: string, customerId: string) =>
    [...customerKeys.details(), businessId, customerId] as const,
};

// ---------------------------------------------------------------------------
// API path helpers
// ---------------------------------------------------------------------------

function customersPath(businessId: string): string {
  return `/api/businesses/${businessId}/customers`;
}

function customerPath(businessId: string, customerId: string): string {
  return `/api/businesses/${businessId}/customers/${customerId}`;
}

function resolveCustomerPath(businessId: string): string {
  return `/api/businesses/${businessId}/customers/resolve`;
}

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Fetches a paginated list of customers for a business.
 * Supports search and status filtering.
 *
 * @param businessId - The business to fetch customers for
 * @param filters - Optional filters (search, status, limit, cursor)
 * @param options - Additional React Query options
 */
export function useCustomers(
  businessId: string | undefined,
  filters?: ListCustomersFilters,
  options?: Partial<UseQueryOptions<PaginatedCustomers, ApiClientError>>,
) {
  return useQuery<PaginatedCustomers, ApiClientError>({
    queryKey: customerKeys.list(businessId ?? "", filters),
    queryFn: () =>
      apiGet<PaginatedCustomers>(customersPath(businessId!), {
        search: filters?.search,
        status: filters?.status,
        limit: filters?.limit,
        cursor: filters?.cursor,
      }),
    enabled: !!businessId,
    ...options,
  });
}

/**
 * Fetches a single customer by ID, including contact methods.
 *
 * @param businessId - The business the customer belongs to
 * @param customerId - The customer to fetch
 * @param options - Additional React Query options
 */
export function useCustomer(
  businessId: string | undefined,
  customerId: string | undefined,
  options?: Partial<UseQueryOptions<CustomerWithContacts, ApiClientError>>,
) {
  return useQuery<CustomerWithContacts, ApiClientError>({
    queryKey: customerKeys.detail(businessId ?? "", customerId ?? ""),
    queryFn: () => apiGet<CustomerWithContacts>(customerPath(businessId!, customerId!)),
    enabled: !!businessId && !!customerId,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Creates a new customer.
 * Invalidates customer list queries on success.
 *
 * @param businessId - The business to create the customer in
 */
export function useCreateCustomer(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation<Customer, ApiClientError, CreateCustomerInput>({
    mutationFn: (input) => apiPost<Customer>(customersPath(businessId), input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.lists(),
      });
    },
  });
}

/**
 * Resolves (find-or-create) a customer by contact method.
 * Invalidates customer list queries on success.
 *
 * @param businessId - The business to resolve the customer in
 */
export function useResolveCustomer(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation<CustomerWithContacts, ApiClientError, ResolveCustomerInput>({
    mutationFn: (input) => apiPost<CustomerWithContacts>(resolveCustomerPath(businessId), input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.lists(),
      });
    },
  });
}
