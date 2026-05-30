# TASK-INFRA-AUTH-1A — Same-Origin Vercel Custom Domain Design Approved

## 1. Status

INFRA_AUTH_1A_SAME_ORIGIN_VERCEL_CUSTOM_DOMAIN_DESIGN_READY

## 2. Context

* R3B final exit checkpoint is merged.
* UI main commit: `78cf223`
* Backend main commit: `fe5e70e`
* Browser UI smoke remains blocked by cross-site Auth.js cookie topology.
* API-only validation was accepted for R3B composer and status controls.
* R3C/R4 are intentionally not started.
* The product domain is `AiAutomations.ae`.
* `iranservice.ir` must not be used.

## 3. Approved CTO/CPO Architecture Decision

* Use same-origin custom domain topology.
* Target browser origin: `https://dashboard.aiautomations.ae`.
* Route UI and backend API through the same browser origin.
* Prefer Vercel-based topology for this milestone.
* Do not use Cloudflare Workers as the primary auth topology for this milestone.
* Do not use subdomain split as the primary topology for this milestone.
* Keep subdomain split as fallback only if same-origin path split is proven infeasible.

## 4. Target Topology

```text
https://dashboard.aiautomations.ae
  ├─ UI routes           → UI app
  ├─ /api/*              → backend API
  └─ /api/auth/*         → backend Auth.js routes
```

* Browser should see only `dashboard.aiautomations.ae`.
* Auth.js cookies should be first-party/same-origin from the browser perspective.
* `/inbox`, composer, and status controls should become browser-smokeable after implementation.

## 5. Proposed Vercel Routing Model

* A lightweight Vercel proxy/routing project may own `dashboard.aiautomations.ae`.
* Rewrites should route `/api/*` to backend.
* Rewrites should route `/api/auth/*` to backend Auth.js.
* UI routes should route to the UI deployment.
* `VITE_API_BASE_URL=""` should be used so the UI calls same-origin `/api/*`.
* Backend likely needs `AUTH_URL=https://dashboard.aiautomations.ae`.
* OAuth OAuth redirect URI must include:
  `https://dashboard.aiautomations.ae/api/auth/callback/OAuth`

## 6. Open Implementation Subdecision

* The implementation design still needs to decide between:
  * Nitro plugin / standard TanStack Start Vercel approach
  * Vercel zero-config detection
* This checkpoint approves the architecture direction, not the exact implementation method.
* No implementation has been done in this checkpoint.

## 7. Required Access Before Implementation

* DNS management access for `AiAutomations.ae` is required.
* OAuth console access is required.
* Vercel project/domain/env access is required.
* If DNS access is unavailable, implementation must stop with:
  `INFRA_AUTH_1_BLOCKED_NEEDS_DNS_ACCESS`
* If OAuth access is unavailable, implementation must stop with:
  `INFRA_AUTH_1_BLOCKED_NEEDS_OAUTH_ACCESS`

## 8. Security Requirements

* No token storage in browser.
* No localStorage/sessionStorage auth.
* No exposing backend secrets.
* No cookie logging.
* No request/response body logging for messages.
* No broad open proxy.
* Proxy only approved `/api/*` and `/api/auth/*` paths.
* Safe Set-Cookie handling.
* HTTPS-only for staging/production.
* Rollback plan required before env/domain changes.

## 9. Browser Smoke Acceptance Criteria After Implementation

* Login/session check through `dashboard.aiautomations.ae`.
* `/inbox` loads in browser.
* Conversation detail opens.
* INTERNAL note through browser.
* OUTBOUND reply through browser.
* Status transition through browser.
* Visual update/refetch confirmed.
* Toast/error behavior confirmed.
* No CORS errors.
* No cookie/token exposure.
* No API-only workaround used for final browser smoke.

## 10. Explicit Non-Goals For This Checkpoint

* No code implementation.
* No DNS changes.
* No Vercel env changes.
* No OAuth OAuth changes.
* No redeploy.
* No smoke run.
* No R3C/R4 start.
* No backend changes.
* No UI source changes except this checkpoint.

## 11. Next Gates

* INFRA-AUTH-1B targeted implementation design.
* DNS access verification.
* OAuth OAuth access verification.
* Vercel custom domain/env setup plan.
* Browser auth smoke after implementation.
* R3C/R4 only after CTO approval.

## 12. Final Status

INFRA_AUTH_1A_SAME_ORIGIN_VERCEL_CUSTOM_DOMAIN_DESIGN_READY
