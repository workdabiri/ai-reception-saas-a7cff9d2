# TASK-R3B-3A — Conversation Detail Merged

## 1. Purpose

Record the merge of R3B-3A: first conversation detail page with read-only message timeline, and inbox row linkification.

- **UI repository:** `iranservice/ai-reception-saas-a7cff9d2`
- **UI main commit:** `245c60e`
- **Backend reference repository:** `iranservice/ai-reception-saas`
- **Backend reference commit:** `0ceeb21`

---

## 2. Merged PR

| Field | Value |
|---|---|
| PR | [#8 feat(r3b-3a): add conversation detail page with message timeline](https://github.com/iranservice/ai-reception-saas-a7cff9d2/pull/8) |
| Approved head | `9a28919` |
| Squash merge commit | `245c60e` |
| Base main before merge | `7c7b0dc` |
| Merge strategy | Squash |
| Branch deleted | ✅ `review/r3b-3a-conversation-detail` |

---

## 3. Files Changed by R3B-3A

| File | Change | Description |
|---|---|---|
| `src/routes/inbox.$conversationId.tsx` | **NEW** | Conversation detail page — all feature logic |
| `src/routes/inbox.tsx` | Modified | Row `<article>` → `<Link>` to detail route |

---

## 4. Implementation Summary

### Conversation Detail Route

- Route path: `/inbox/$conversationId`
- Route file: `src/routes/inbox.$conversationId.tsx` (TanStack Router file-based convention)
- `conversationId` read from `Route.useParams()`
- `businessId` read from `useBusinessId()` (BusinessContext / `VITE_DEV_BUSINESS_ID`)
- `useConversation(businessId, conversationId)` — conversation metadata
- `useMessages(businessId, conversationId, { limit: 50 })` — read-only message timeline

### Conversation Header

| Element | Source | Fallback |
|---|---|---|
| Title/Subject | `conversation.subject` | "No subject" |
| Status badge | `conversation.status` | `STATUS_TONE` + `STATUS_LABEL` maps |
| Channel badge | `conversation.channel` | `CHANNEL_LABEL` map |
| Customer label | `conversation.customerId` | `Contact #xxxxxxxx` or "No customer linked" |
| Message count | `conversation.messageCount` | `N messages` |
| Created time | `conversation.createdAt` | Relative time |
| Updated time | `conversation.updatedAt` | Relative time |
| Back link | `<Link to="/inbox">` | `ArrowLeft` icon |

### Read-Only Message Timeline

| Direction | Alignment | Visual |
|---|---|---|
| `INBOUND` | Left | `bg-muted/50 border border-border` |
| `OUTBOUND` | Right | `bg-primary/10 border border-primary/20` |
| `INTERNAL` | Right | `bg-warning/8 border border-warning/20` + lock icon |
| `SYSTEM` | Center | `bg-surface-muted border border-border`, italic |

- Chronological order (backend returns `orderBy: createdAt asc`)
- First 50 messages (no pagination in R3B-3A)
- Safe rendering: React text nodes only — no `innerHTML`, no `dangerouslySetInnerHTML`
- `whitespace-pre-wrap` and `break-words` for long content
- Message content is never logged

### Inbox Row Linkification

- `ConversationRow` changed from `<article>` to `<Link to="/inbox/$conversationId">`
- `params={{ conversationId: c.id }}` passed to TanStack Router Link
- `hover:bg-secondary/50` transition added
- All existing row content preserved unchanged

### State Handling

| State | Trigger | UI |
|---|---|---|
| No businessId | `VITE_DEV_BUSINESS_ID` not set | Warning banner |
| Loading | `convLoading \|\| msgsLoading` | Card + text skeletons |
| Conversation 401 | API returns unauthenticated | Session expired state |
| Conversation 403 | API returns forbidden | Access denied state |
| Conversation 404 | API returns not found | Not found card + back link |
| Conversation error | Other API error | Generic retry card |
| Messages 401 | API returns unauthenticated | Session expired state |
| Messages 403 | API returns forbidden | Access denied state |
| Messages error | Other API error | Header + generic retry card |
| Empty messages | `messages.length === 0` | "No messages yet" card |
| QA `?state=empty` | URL param | Empty state override |
| QA `?state=loading` | URL param | Loading skeleton override |
| QA `?state=access-denied` | URL param | Access denied override |

---

## 5. CTO Corrections Applied Before Merge

Two commits on PR #8 (`5e0d25e` → `9a28919`):

| Issue | Correction |
|---|---|
| Initial PR handled conversation 401/403 but not messages 401/403 | Added `error: msgsErr` to `useMessages` destructuring |
| Backend has separate permission checks: `conversations.read` and `messages.read` | Added `msgsErr.isUnauthenticated` → `profileSessionExpired` state |
| Messages 403 showed generic retry card | Added `msgsErr.isForbidden` → `inboxAccessDenied` state |
| Correction scope | Single file: `src/routes/inbox.$conversationId.tsx` (+24 lines) |
| No backend or hook changes | ✅ Unchanged |

---

## 6. Explicitly Deferred

| Feature | Reason |
|---|---|
| Message composer (outbound) | Requires mutations, direction selection, sender logic |
| Internal note composer | Same complexity as composer |
| Status change controls | Requires confirmation UI + `useChangeConversationStatus` |
| Assignment workflow | Requires operator listing |
| Customer name lookup | N+1 risk — UUID fallback only |
| Message pagination beyond first 50 | Deferred to R3B-3B or R3B-4 |
| AI draft/classification UI | No AI runtime |
| External channel adapters | No WhatsApp/Instagram/SMS |
| R3C/R4 | Not started |

---

## 7. Validation Evidence

### Toolchain
- **Package manager:** Bun 1.3.14 (no npm/pnpm/yarn used)
- **TypeScript:** `bunx tsc --noEmit`
- **Lint:** `bun run lint` (ESLint + Prettier)
- **Build:** `bun run build` (Vite SSR)

### Results (post-correction commit `9a28919`)

| Check | Result |
|---|---|
| `bun run lint` | ✅ Pass — 0 errors, 0 warnings |
| `bun run build` | ✅ Pass — built in 29.46s |
| `bunx tsc --noEmit` | ✅ Pass — 0 errors |
| Secret/scope scan | ✅ Clean — SCAN_CLEAN |
| `src/routeTree.gen.ts` | ✅ Not committed |
| Lockfile drift | ✅ None — no `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock` created |

---

## 8. Safety

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
| Two-file feature scope | ✅ |
| R3B-1 hooks unchanged | ✅ |
| No composer/status/assignment added | ✅ |
| R3B-3B not started | ✅ |
| R3B-4 not started | ✅ |
| R3C/R4 not started | ✅ |

---

## 9. Final Status

```
R3B_3A_CONVERSATION_DETAIL_MERGED
```

**Next allowed design gates (choose one):**
- R3B-3B: Message Timeline Pagination / Detail Polish Design Gate
- R3B-4: Composer / Internal Note Design Gate
