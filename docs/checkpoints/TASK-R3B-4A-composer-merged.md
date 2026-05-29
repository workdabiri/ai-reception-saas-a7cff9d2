# TASK-R3B-4A — Composer Merged

## 1. Purpose

Record the merge of R3B-4A: message composer with Reply and Internal Note modes added to the conversation detail page.

- **UI repository:** `iranservice/ai-reception-saas-a7cff9d2`
- **UI main commit:** `7daff04`
- **Backend reference repository:** `iranservice/ai-reception-saas`
- **Backend reference commit:** `0ceeb21`

---

## 2. Merged PR

| Field | Value |
|---|---|
| PR | [#10 feat(r3b-4a): add message composer with reply and internal note modes](https://github.com/iranservice/ai-reception-saas-a7cff9d2/pull/10) |
| Approved head | `688c428` |
| Squash merge commit | `7daff04` |
| Base main before merge | `8724503` |
| Merge strategy | Squash |
| Branch deleted | ✅ `review/r3b-4a-composer` |

---

## 3. Files Changed by R3B-4A

| File | Change | Description |
|---|---|---|
| `src/routes/inbox.$conversationId.tsx` | Modified | Add inline `MessageComposer` component |
| `src/routes/__root.tsx` | Modified | Mount `<Toaster />` from sonner |

---

## 4. Implementation Summary

### MessageComposer Component

- Placed below read-only message timeline in `/inbox/$conversationId`
- Inline component inside `inbox.$conversationId.tsx` — no new files
- Reuses existing `useCreateMessage(businessId, conversationId)` hook

### Reply Mode

| Property | Value |
|---|---|
| Direction sent | `OUTBOUND` |
| Tab styling | Primary tint (`bg-primary/10 text-foreground border-primary/30`) |
| Submit label | "Send reply" |
| Pending label | "Sending…" |
| Submit icon | `Send` (lucide) |

### Note Mode

| Property | Value |
|---|---|
| Direction sent | `INTERNAL` |
| Tab styling | Warning tint (`bg-warning/10 text-foreground border-warning/30`) |
| Submit label | "Add note" |
| Pending label | "Adding…" |
| Submit icon | `Lock` (lucide) |
| Footer label | "Only visible to operators" with lock icon |

### Textarea

| Behavior | Spec |
|---|---|
| Placeholder | Mode-specific ("Type your reply…" / "Add an internal note…") |
| Max length | 50,000 chars (`maxLength` + backend Zod `z.string().max(50000)`) |
| Disabled during pending | ✅ |
| Plain text only | ✅ No HTML editor, no rich text |
| Resize | `resize-none` |

### Keyboard

- `Cmd/Ctrl+Enter` — submit shortcut (`onKeyDown` on textarea)
- `Enter` alone — newline (default textarea behavior)

### State Guards

| State | Behavior |
|---|---|
| Content empty/whitespace | Submit button disabled |
| `createMessage.isPending` | Submit button disabled, spinner, textarea disabled, tabs disabled |

### Success

1. Clear textarea content (`setContent("")`)
2. Toast success: "Reply sent" or "Note added"

### Error

1. Preserve textarea content (don't lose user's draft)
2. Toast errors (safe — no raw server error):
   - 401 → "Session expired. Please sign in again."
   - 403 → "You don't have permission to send messages."
   - 400 → "Message could not be sent. Please check your input."
   - Other → "Something went wrong. Please try again."

### Toaster

- `<Toaster />` from `@/components/ui/sonner` mounted once in `__root.tsx`
- `sonner` was already installed (`^2.0.7`) — no new dependencies

---

## 5. Backend Contract Alignment

| Contract | Status |
|---|---|
| `POST /api/businesses/:bId/conversations/:cId/messages` | ✅ Exists |
| Permission required | `messages.create` |
| `senderUserId` derivation | Backend derives from auth context for OUTBOUND/INTERNAL — UI does not send |
| `senderType` derivation | Backend derives (`OPERATOR` for OUTBOUND/INTERNAL) — UI does not send |
| `senderCustomerId` | UI does not send for OUTBOUND/INTERNAL (backend would reject) |
| SYSTEM direction | UI type `ApiMessageDirection` excludes SYSTEM; backend Zod rejects it |
| Content validation | `z.string().min(1).max(50000)` — client enforces max 50,000 |
| Payload sent by UI | `{ content: string, direction: "OUTBOUND" \| "INTERNAL" }` only |
| Invalidation on success | `useCreateMessage.onSuccess` invalidates `messageKeys.lists()`, `conversationKeys.detail()`, `conversationKeys.lists()` |

---

## 6. CTO Corrections Applied Before Merge

Two commits on PR #10 (`8824632` → `688c428`):

| Issue | Correction |
|---|---|
| Mode tabs switchable while submit pending | Added `disabled={createMessage.isPending}` to Reply and Note tab buttons |
| Success toast read mutable `mode` state | Now captures `submittedDirection` before `createMessage.mutate()` |
| Wrong feedback possible | Derived `successMessage` from `submittedDirection`, used in `onSuccess` instead of `mode` |
| Correction scope | Single file: `src/routes/inbox.$conversationId.tsx` (+10 lines, −4 lines) |
| No backend or hook changes | ✅ Unchanged |

---

## 7. Explicitly Deferred

| Feature | Reason |
|---|---|
| Auto-scroll to new message | Requires `useRef` + scroll logic |
| Optimistic append | First slice relies on server roundtrip |
| File upload / attachments | Out of scope |
| Rich text editor | Plain text only |
| Status transition controls | Deferred to R3B-5 |
| Assignment workflow | Requires operator listing |
| AI draft/classification | No AI runtime |
| External channel delivery | OUTBOUND only records in DB |
| Message pagination | Deferred to R3B-4B or later |
| R3C/R4 | Not started |

---

## 8. Validation Evidence

### Toolchain

- **Package manager:** Bun 1.3.14 (no npm/pnpm/yarn used)
- **TypeScript:** `bunx tsc --noEmit`
- **Lint:** `bun run lint` (ESLint + Prettier)
- **Build:** `bun run build` (Vite SSR)

### Results (post-correction commit `688c428`)

| Check | Result |
|---|---|
| `bun run lint` | ✅ Pass — 0 errors, 0 warnings |
| `bun run build` | ✅ Pass — built in 19.86s |
| `bunx tsc --noEmit` | ✅ Pass — 0 errors |
| Secret/scope scan | ✅ Clean — SCAN_CLEAN |
| `src/routeTree.gen.ts` | ✅ Not committed |
| Lockfile drift | ✅ None — no `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock` created |

---

## 9. Safety

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
| No optimistic append/auto-scroll | ✅ |
| No status/assignment/AI/external delivery | ✅ |
| R3B-4B not started | ✅ |
| R3B-5 not started | ✅ |
| R3C/R4 not started | ✅ |

---

## 10. Final Status

```
R3B_4A_COMPOSER_MERGED
```

**Next allowed design gates (choose one):**
- R3B-4B: Composer Polish / Manual Smoke Design Gate
- R3B-5: Status Controls Design Gate
