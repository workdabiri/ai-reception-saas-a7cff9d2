/**
 * API Client — Backend Integration
 *
 * Typed fetch wrapper for communicating with the backend API.
 *
 * Design decisions:
 * - API base URL is configurable via VITE_API_BASE_URL env var
 * - All requests use credentials: "include" (cookie-based auth)
 * - JSON Content-Type for mutation requests
 * - Errors are wrapped in a typed ApiClientError
 * - No token storage, no cookie access from JS
 * - No hardcoded domains
 *
 * @module
 */

import type { ApiSuccessEnvelope, ApiErrorEnvelope } from "./api-types";
import { getDevAuthHeaders } from "./dev-auth-headers";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Returns the API base URL from environment.
 * Empty string means same-origin (e.g., when deployed on same domain).
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? "";
}

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

/**
 * Structured error from API calls.
 * Distinguishes auth errors (401/403) from validation errors (400)
 * and server errors (500+).
 */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }

  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 400;
  }
}

// ---------------------------------------------------------------------------
// Query string builder
// ---------------------------------------------------------------------------

type QueryValue = string | number | boolean | null | undefined;

/**
 * Builds a URL query string from a params object.
 * Omits null/undefined values.
 */
export function buildQueryString(params: Record<string, QueryValue>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.set(key, String(value));
  }
  return `?${searchParams.toString()}`;
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  params?: Record<string, QueryValue>;
  headers?: Record<string, string>;
}

/**
 * Makes a typed API request to the backend.
 *
 * @param path - API path starting with / (e.g., /api/businesses/:id/conversations)
 * @param options - Request options
 * @returns Parsed response data
 * @throws {ApiClientError} on non-ok responses
 */
export async function apiRequest<TData>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TData> {
  const { method = "GET", body, params, headers } = options;
  // Normalize base: strip trailing slash to avoid double slashes
  const base = getApiBaseUrl().replace(/\/$/, "");
  const queryString = params ? buildQueryString(params) : "";
  const url = `${base}${path}${queryString}`;

  const init: RequestInit = {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      // Dev-only backend auth headers (LOCAL SMOKE TESTING ONLY).
      // Returns {} unless `import.meta.env.DEV === true` AND
      // `VITE_DEV_AUTH_SESSION === "true"`, so this is inert and
      // dead-code-eliminated in production builds. These `x-dev-*` headers let
      // the local backend dev-header auth adapter resolve tenant context for
      // tenant-scoped routes. See src/lib/dev-auth-headers.ts.
      ...getDevAuthHeaders(),
      // Explicit per-call headers win over the dev headers above.
      ...headers,
    },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
    (init.headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiClientError(0, "NETWORK_ERROR", "Network request failed");
  }

  // Empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as TData;
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiClientError(
      response.status,
      "INVALID_RESPONSE",
      "Invalid JSON response from server",
    );
  }

  if (!response.ok) {
    const errorBody = json as ApiErrorEnvelope | undefined;
    const code = errorBody?.error?.code ?? "UNKNOWN_ERROR";
    const message = errorBody?.error?.message ?? "An unexpected error occurred";
    throw new ApiClientError(response.status, code, message);
  }

  // Backend wraps successful responses in { ok: true, data: ... }
  const successBody = json as ApiSuccessEnvelope<TData>;
  if (successBody && typeof successBody === "object" && "data" in successBody) {
    return successBody.data;
  }

  // Fallback: return raw JSON if not wrapped
  return json as TData;
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

/** GET request */
export function apiGet<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  return apiRequest<T>(path, { method: "GET", params });
}

/** POST request */
export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "POST", body });
}

/** PATCH request */
export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "PATCH", body });
}
