# TASK-R3B-1 — API Client + Hooks Merged

**Status:** MERGED  
**Final Status Code:** `R3B_1_API_CLIENT_HOOKS_MERGED`  
**Date:** 2026-05-29

---

## 1. Purpose

Record the successful merge of R3B-1 API Client + Hooks into the UI repository main branch.

This checkpoint establishes that the frontend API integration layer — typed fetch wrapper, backend domain types, and React Query hooks — is now present on main and available for downstream UI feature work (R3B-2+).

| Item | Value |
|---|---|
| **UI repository** | `iranservice/ai-reception-saas-a7cff9d2` |
| **UI main commit** | `60649e4` |
| **Backend reference** | `iranservice/ai-reception-saas` |
| **Backend reference commit** | `0ceeb21` |

---

## 2. Merged PRs

Two PRs were merged in dependency order before this checkpoint:

### PR #2 — Baseline Typecheck Fix (prerequisite)

| Field | Value |
|---|---|
| **Title** | `fix(ui): resolve customer detail typecheck error` |
| **Branch** | `review/r3b-0-baseline-typecheck-fix` |
| **Approved head** | `02bfaaa` |
| **Squash merge commit** | `8356c4f` |
| **Purpose** | Unblocked baseline `bunx tsc --noEmit` (pre-existing TS2339 in `customers.$customerId.tsx`) |

### PR #1 — R3B-1 API Client + Hooks

| Field | Value |
|---|---|
| **Title** | `feat(r3b): add API client and query hooks` |
| **Branch** | `review/r3b-1-api-client-env-wiring` |
| **Approved head** | `8db6579` |
| **Squash merge commit** | `60649e4` |
| **CTO correction applied** | `ListMessagesFilters.direction` → `ApiMessageDirection` (SYSTEM excluded) |

---

## 3. Files Added by R3B-1

| File | Purpose |
|---|---|
| `.env.example` | Documents `VITE_API_BASE_URL` for local and Vercel preview development |
| `src/lib/api-client.ts` | Typed fetch wrapper — base URL, error handling, request helpers |
| `src/lib/api-types.ts` | TypeScript types aligned with backend R1/R2 domain contracts |
| `src/hooks/use-conversations.ts` | React Query hooks: list, detail, create, update, change status |
| `src/hooks/use-messages.ts` | React Query hooks: list messages, create message or internal note |
| `src/hooks/use-customers.ts` | React Query hooks: list, detail, create, resolve |

---

## 4. Implementation Summary

### API Client (`src/lib/api-client.ts`)

- Base URL injected from `import.meta.env.VITE_API_BASE_URL` (empty = same-origin)
- Trailing-slash normalization to prevent double-slash URLs
- All requests use `credentials: "include"` (session cookie forwarding)
- Methods: GET, POST, PATCH only
- Typed `ApiClientError` with `status`, `code`, `isUnauthenticated`, `isForbidden`, `isNotFound`
- No hardcoded production or custom domain
- No browser storage used for auth state

### API Types (`src/lib/api-types.ts`)

- Full backend R1/R2 contract coverage:
  - `Conversation`, `ConversationWithSummary`, `ConversationStatus`
  - `Message`, `MessageDirection`, `ApiMessageDirection`, `MessageSenderType`
  - `Customer`, `ContactMethod`, `CustomerContactMethod` (alias)
  - `ChannelType`, `AiClassificationStatus`, `AiDraftStatus`
- Paginated shapes: `PaginatedConversations`, `PaginatedMessages`, `PaginatedCustomers`
- Input types: `CreateConversationInput`, `UpdateConversationInput`, `ChangeConversationStatusInput`, `CreateMessageInput`, `CreateCustomerInput`, `ResolveCustomerInput`
- List filter types: `ListConversationsFilters`, `ListMessagesFilters`, `ListCustomersFilters`
- API envelope types: `ApiSuccessEnvelope<T>`, `ApiErrorEnvelope`

### React Query Hooks

**Conversations (`use-conversations.ts`)**
- `useConversations(businessId, filters)` — paginated list
- `useConversation(businessId, conversationId)` — single detail
- `useCreateConversation(businessId)` — mutation, invalidates lists
- `useUpdateConversation(businessId, conversationId)` — mutation, invalidates detail + lists
- `useChangeConversationStatus(businessId, conversationId)` — mutation, invalidates detail + lists

**Messages (`use-messages.ts`)**
- `useMessages(businessId, conversationId, filters)` — paginated list
- `useCreateMessage(businessId, conversationId)` — mutation, invalidates message list + conversation detail + conversation lists

**Customers (`use-customers.ts`)**
- `useCustomers(businessId, filters)` — paginated list with search
- `useCustomer(businessId, customerId)` — single detail
- `useCreateCustomer(businessId)` — mutation, invalidates customer lists
- `useResolveCustomer(businessId)` — find-or-create by contact, invalidates lists and detail

### No UI Pages/Components

R3B-1 adds only the integration layer. No route pages, forms, or UI components are included.

---

## 5. Contract Correction (CTO Review)

The initial PR had `ListMessagesFilters.direction` typed as `MessageDirection` (which included `SYSTEM`). The backend list-messages API rejects `SYSTEM` at the API boundary.

**Correction applied before merge:**

| Type | Direction field | Allowed values |
|---|---|---|
| `Message` entity | `MessageDirection` | `INBOUND`, `OUTBOUND`, `SYSTEM`, `INTERNAL` |
| `ListMessagesFilters` | `ApiMessageDirection` | `INBOUND`, `OUTBOUND`, `INTERNAL` |
| `CreateMessageInput` | `ApiMessageDirection` | `INBOUND`, `OUTBOUND`, `INTERNAL` |
| `CreateConversationInitialMessage` | `ApiMessageDirection` | `INBOUND`, `OUTBOUND`, `INTERNAL` |

`SYSTEM` is reserved for backend-generated messages and is excluded from all API input types.

---

## 6. Validation Evidence

All validation run on `review/r3b-1-api-client-env-wiring` at `8db6579` (post-rebase onto `8356c4f`) using Bun only.

| Check | Result |
|---|---|
| **Bun version** | `1.3.14+0d9b296af` |
| **`bun install`** | Pass — 501 packages, `bun.lock` unchanged |
| **`bun run lint`** | Pass — 0 errors, 0 warnings |
| **`bun run build`** | Pass — built in 19.11s |
| **`bunx tsc --noEmit`** | Pass — **0 errors** (baseline resolved by PR #2) |
| **Secret/scope scan** | Clean — zero matches |
| **Lockfile check** | `bun.lock` only, no `package-lock.json`, no `pnpm-lock.yaml`, no `yarn.lock` |

---

## 7. Safety

| Check | Status |
|---|---|
| UI repo only | ✅ |
| Backend repo untouched | ✅ |
| No schema/migration changes | ✅ |
| No staging touched | ✅ |
| No DNS/Vercel/env changes | ✅ |
| No redeployment | ✅ |
| No package-manager drift | ✅ |
| `routeTree.gen.ts` not committed | ✅ |
| No UI pages/components implemented | ✅ |
| R3B-2 not started | ✅ |
| R3C/R4 not started | ✅ |

---

## 8. Next Allowed Step

**R3B-2: Conversation List Page** — Design gate required before implementation.

Scope will cover the internal intake inbox view using the hooks established in R3B-1.

---

## Final Status

`R3B_1_API_CLIENT_HOOKS_MERGED`
