/**
 * Dev-only backend auth headers (LOCAL SMOKE TESTING ONLY)
 *
 * Why this exists
 * ---------------
 * The frontend dev auth *session* bypass (see `src/hooks/use-auth-session.ts`)
 * only fakes the *frontend* session so protected routes render without Google
 * OAuth. It does NOT make the backend trust the request: every `/api/*` call
 * still arrives at the backend with no resolvable authenticated/tenant context,
 * so tenant-scoped endpoints fail and the workspace shell shows
 * "Workspace unavailable".
 *
 * In local development the backend exposes a dedicated dev-header auth adapter
 * (active only when the backend sets `ENABLE_DEV_AUTH_CONTEXT="true"`) that
 * resolves the request context from `x-dev-*` request headers. The header names
 * are the backend contract — do NOT invent them here. They are mirrored from
 * the backend repo's `src/app/api/_shared/auth-context-adapter.ts`
 * (`DEV_AUTH_HEADERS`):
 *   - x-dev-user-id       (authenticated + tenant context)
 *   - x-dev-business-id   (tenant context; must equal the route businessId)
 *   - x-dev-membership-id (tenant context)
 *   - x-dev-role          (tenant context; OWNER | ADMIN | OPERATOR | VIEWER)
 *
 * This module turns the local `VITE_DEV_*` env values into those `x-dev-*`
 * headers so a local smoke test can actually reach tenant-scoped endpoints
 * (e.g. the Knowledge Management UI).
 *
 * SAFETY BOUNDARY — dev-only, production-INACTIVE
 * -----------------------------------------------
 *   - Active ONLY when BOTH conditions hold (mirrors `isDevAuthSessionEnabled`
 *     so the session bypass and these headers are controlled by ONE flag):
 *       1. `import.meta.env.DEV === true` → statically `true` only under
 *          `vite dev`; statically `false` in any production build, so this
 *          whole branch is dead-code-eliminated from prod bundles even if the
 *          env var is mistakenly set.
 *       2. `import.meta.env.VITE_DEV_AUTH_SESSION === "true"` → explicit local
 *          opt-in (the same flag that enables the session bypass).
 *   - Adds NO real auth, NO OAuth, NO secrets, and NO network call.
 *   - Emits a header ONLY when its env value is actually set (non-empty), so it
 *     never sends empty/garbage headers; partial config degrades gracefully.
 *   - Defense in depth: the backend dev-header adapter is itself fail-closed in
 *     any real-data environment via the backend dev-bypass deployment guard, so
 *     even a leaked header is inert in production.
 *
 * @module
 */

/**
 * Whether the dev-only backend auth headers should be attached to API requests.
 *
 * Gated identically to the dev auth session bypass (`isDevAuthSessionEnabled`)
 * so a single env flag (`VITE_DEV_AUTH_SESSION`) controls both, and so this is
 * statically `false` — and dead-code-eliminated — in production builds.
 */
export function isDevAuthHeadersEnabled(): boolean {
  return import.meta.env.DEV === true && import.meta.env.VITE_DEV_AUTH_SESSION === "true";
}

/**
 * Builds the backend `x-dev-*` auth headers from local `VITE_DEV_*` env values.
 *
 * Returns an empty object (no headers) unless the dev gate is active, so callers
 * can spread the result unconditionally. Each header is included only when its
 * source env value is a non-empty string.
 *
 * Production-inactive: in a production build `isDevAuthHeadersEnabled()` is
 * statically `false`, so this returns `{}` and the body is dead code.
 *
 * Note on expected values (local smoke testing only):
 *   - VITE_DEV_BUSINESS_ID  must be a REAL business UUID (FK-checked by the DB);
 *     it is also reused by `business-context.tsx` as the active businessId, so
 *     the `x-dev-business-id` header always matches the knowledge route param.
 *   - VITE_DEV_USER_ID      must be UUID-shaped (written to `@db.Uuid` columns
 *     on create/verify). It is NOT FK-checked, so any valid UUID works; use a
 *     real DB user UUID if you also want fire-and-forget audit rows to persist.
 *   - VITE_DEV_MEMBERSHIP_ID is not persisted; any non-empty value works.
 *   - VITE_DEV_ROLE         must be one of OWNER | ADMIN | OPERATOR | VIEWER;
 *     OWNER grants the full create/verify/archive knowledge flow.
 */
export function getDevAuthHeaders(): Record<string, string> {
  if (!isDevAuthHeadersEnabled()) return {};

  const headers: Record<string, string> = {};

  const set = (name: string, value: unknown): void => {
    if (typeof value === "string" && value.trim().length > 0) {
      headers[name] = value.trim();
    }
  };

  // Static `import.meta.env.VITE_DEV_*` access (not a dynamic key) so Vite can
  // inline each value and dead-code-eliminate this block from production.
  set("x-dev-user-id", import.meta.env.VITE_DEV_USER_ID);
  set("x-dev-business-id", import.meta.env.VITE_DEV_BUSINESS_ID);
  set("x-dev-membership-id", import.meta.env.VITE_DEV_MEMBERSHIP_ID);
  set("x-dev-role", import.meta.env.VITE_DEV_ROLE);

  return headers;
}
