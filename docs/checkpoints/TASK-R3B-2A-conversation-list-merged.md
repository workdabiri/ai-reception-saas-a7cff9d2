# TASK-R3B-2A — Conversation List Page Merged

## 1. Purpose

Record the merge of R3B-2A: the first live-data inbox page in the UI repo.

- **UI repository:** `iranservice/ai-reception-saas-a7cff9d2`
- **UI main commit:** `1b9cf28`
- **Backend reference repository:** `iranservice/ai-reception-saas`
- **Backend reference commit:** `0ceeb21`

---

## 2. Merged PR

| Field | Value |
|---|---|
| PR | [#4 feat(r3b-2a): replace mock inbox with API-backed conversation list](https://github.com/iranservice/ai-reception-saas-a7cff9d2/pull/4) |
| Approved head | `8bc9fc7` |
| Squash merge commit | `1b9cf28` |
| Base main before merge | `18a1fcf` |
| Merge strategy | Squash |
| Branch deleted | ✅ `review/r3b-2a-conversation-list` |

---

## 3. Files Changed by R3B-2A

| File | Change | Description |
|---|---|---|
| `.env.example` | Modified | Added `VITE_DEV_BUSINESS_ID` documentation |
| `src/contexts/business-context.tsx` | Added | `BusinessContext` provider and `useBusinessId` hook |
| `src/routes/__root.tsx` | Modified | Wired `BusinessProvider` into root component tree |
| `src/routes/inbox.tsx` | Replaced | 52 KB mock → ~12 KB API-backed conversation list |

---

## 4. Implementation Summary

### BusinessContext (`src/contexts/business-context.tsx`)
- New React context providing the active `businessId` to all downstream hooks.
- Reads `VITE_DEV_BUSINESS_ID` from Vite env for development.
- Exports `BusinessProvider` (component) and `useBusinessId` (hook).
- Co-exports suppressed with `react-refresh/only-export-components` disable — follows established pattern in `workspace-switcher.tsx`.
- Future: source will be replaced with session-derived business membership from auth integration.

### Root Route (`src/routes/__root.tsx`)
- `<BusinessProvider>` added inside `<QueryClientProvider>` wrapping all routes.

### Inbox Route (`src/routes/inbox.tsx`)
- **Replaced** the 52 KB mock `inbox.tsx` (full split-pane mock) with an API-backed conversation list.
- Uses `useBusinessId()` for business context.
- Uses `useConversations(businessId, filters)` from R3B-1 hooks.
- Status filter tabs: All / New / Open / Assigned / Waiting (customer) / Waiting (operator) / Escalated / Resolved.
- Enum values match actual `api-types.ts`: `ConversationStatus` and `ChannelType` (`INTERNAL`, `WEBSITE_CHAT`).
- **Loading state:** `<LoadingSkeleton variant="conversation-list" count={6} />`.
- **Empty state:** `<InboxOperatorFirstEmpty />` (no conversations) and `<FilterNoMatchState>` (filter returns nothing).
- **Error state:** 401 → session expired preset; 403 → access denied preset; other → error card with retry.
- **No-business state:** warning banner when `VITE_DEV_BUSINESS_ID` is not set.
- **State override support:** `?state=empty`, `?state=loading`, `?state=access-denied` for preview.
- **First page only:** `limit: 25`. Cursor pagination deferred to R3B-2B.
- **Non-clickable rows:** `<article>` element. No detail route link (deferred to R3B-3).
- **New conversation button:** placeholder only (coming soon), no form or route.
- **No message timeline or composer** implemented.

---

## 5. CTO Corrections Applied Before Merge

Two commits on PR #4 (`2a648bd` → `8bc9fc7`):

| Issue | Correction |
|---|---|
| `ConversationRow` wrapped in `<Link to="/inbox">` (no-op self-link) | Replaced with `<article>` — non-clickable, no misleading UX |
| "Load more" button appeared but did not append previous results | Removed cursor state, Load more button, and fetching indicator; deferred to R3B-2B |
| Unused `businessId` prop passed to `ConversationRow` | Removed prop and destructuring at call site and definition |
| Unused imports (`Link`, `ChevronRight`, `Loader2`, `Inbox as InboxIcon`) | Removed — lint clean |

---

## 6. Validation Evidence

### Toolchain
- **Package manager:** Bun (no npm/pnpm/yarn used)
- **TypeScript:** `bunx tsc --noEmit`
- **Lint:** `bun run lint` (ESLint + Prettier)
- **Build:** `bun run build` (Vite SSR)

### Results (post-correction commit `8bc9fc7`)

| Check | Result |
|---|---|
| `bun run lint` | ✅ Pass — 0 errors, 0 warnings |
| `bun run build` | ✅ Pass — built in 16.82s |
| `bunx tsc --noEmit` | ✅ Pass — 0 errors |
| Secret/scope scan | ✅ Clean — no secrets in changed files; pre-existing OG image URLs in `__root.tsx` classified as pre-existing |
| `src/routeTree.gen.ts` | ✅ Not committed |
| Lockfile drift | ✅ None — no `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock` created |

---

## 7. Safety

| Constraint | Status |
|---|---|
| UI repo only | ✅ |
| Backend repo untouched | ✅ |
| No Prisma schema changes | ✅ |
| No migrations | ✅ |
| No staging touched | ✅ |
| No DNS/Vercel/env changes | ✅ |
| No redeployment | ✅ |
| No package-manager drift | ✅ |
| No generated `routeTree.gen.ts` committed | ✅ |
| R3B-2B not started | ✅ |
| R3B-3 not started | ✅ |
| R3C/R4 not started | ✅ |

---

## 8. Final Status

```
R3B_2A_CONVERSATION_LIST_MERGED
```

**Next allowed step:** R3B-2B Conversation List Polish Design Gate.
