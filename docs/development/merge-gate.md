# Merge Gate / Validation Policy

> **Effective:** 2026-06-05 — applies to all PRs in both frontend and backend repos.

## Core Rule

No PR may be merged based only on implementation reports, Vercel deploy previews, or GitHub UI status checks.

Before merge, every PR **must** pass all of the following:

1. **Source / diff review** — reviewer reads the actual GitHub diff, not just the PR description.
2. **Approved scope check** — only files approved in the task scope were modified; no backend/PRD/auth/AI/lockfile/env changes unless explicitly authorized.
3. **CLI validation** — lint + build pass locally on the reviewer's machine or in the agent session (not just in CI).
4. **Relevant smoke tests** — manual or automated verification that the changed feature works as expected.
5. **Clean working tree** — `git status --short` shows no untracked or modified files after validation.
6. **CTO / Product Owner approval** — explicit human sign-off before merge.
7. **Squash merge only** — all PRs are squash-merged to maintain a clean linear history.

---

## Frontend Required CLI Validation

Run from the frontend repo root:

```bash
bun run lint
bun run build
git status --short
```

All three must pass with zero errors before merge is authorized.

### Optional regression checks

```bash
# Verify no stale mock references leaked into wired routes
grep -rn "currentWorkspace" src/routes src/components src/contexts src/hooks || echo "CLEAN"

# Verify dev business ID is properly guarded
grep -rn "VITE_DEV_BUSINESS_ID" src/contexts/business-context.tsx

# Verify wired routes don't re-import mock-data (except intentional mixed pages)
grep -n "mock-data" src/routes/customers.tsx src/routes/members.tsx src/routes/audit.tsx src/routes/settings.tsx || echo "CLEAN"
```

---

## Backend Required CLI Validation

Run from the backend repo root:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
git status --short
```

All five must pass with zero errors before merge is authorized.

---

## Pre-Merge Checklist (Copy Into PR Review)

```markdown
## Merge Gate Checklist

- [ ] GitHub diff reviewed — only approved files changed
- [ ] Scope check — no out-of-scope code (backend, PRD, auth, AI, lockfiles, env)
- [ ] `bun run lint` / `pnpm lint` — PASS
- [ ] `bun run build` / `pnpm build` — PASS
- [ ] `pnpm typecheck` (backend) — PASS
- [ ] `pnpm test` (backend) — PASS
- [ ] `git status --short` — clean
- [ ] Smoke test — feature works as expected
- [ ] CTO / Product Owner approval — received
- [ ] Merge method — squash merge only
```

---

## Rejection Criteria

A PR will **not** be merged if:

- CLI validation was not run (reports alone are insufficient).
- Lint or build fails and the failure is not resolved.
- Out-of-scope files were modified without explicit authorization.
- The diff does not match the reported changes.
- Working tree is dirty after validation.
- Backend tests fail.
- No human reviewer has approved the PR.
- A non-squash merge method is used.

---

## Why This Policy Exists

1. **Vercel previews can succeed even when lint fails** — deploy previews skip eslint.
2. **GitHub status checks may not cover all local validations** — CI may not run the same lint rules or build flags.
3. **Agent reports can be inaccurate** — the only source of truth is the actual diff and local CLI output.
4. **Permission mismatches are caught late** — only a real build + lint cycle catches type errors from wrong permission assumptions (e.g., PR #27 OPERATOR/business.read fix).
5. **Linear history matters** — squash merge keeps `git log --oneline` readable for rollback and bisect.

---

## Applies To

| Repo | Validation Commands | Merge Method |
|---|---|---|
| `ai-reception-saas-a7cff9d2` (frontend) | `bun run lint` · `bun run build` | Squash merge |
| `ai-reception-saas` (backend) | `pnpm lint` · `pnpm typecheck` · `pnpm build` · `pnpm test` | Squash merge |

---

## Frontend Route/UI Smoke Tests

For frontend route or UI changes, smoke tests must cover the changed user path:

- Open the changed route in local, preview, or staging.
- Verify auth-gated behavior where applicable.
- Verify loading state when data is pending.
- Verify empty state when API returns no rows.
- Verify error state when API fails.
- Verify forbidden/access-denied state when role lacks permission.
- Verify no stale mock-data appears in fully wired routes.
- Verify active business context is correct for business-scoped screens.
- Verify no console/runtime crash is introduced.

---

## Backend/API Smoke Tests

For backend/API PRs, smoke tests must cover the changed endpoint or domain path:

- Authenticated allowed request.
- Unauthenticated request when applicable.
- Forbidden role/permission case.
- Cross-tenant access denial.
- Invalid route/query/body validation.
- Not-found behavior.
- Response shape matches domain/API contract.
- Audit logging behavior when relevant.
- Rate-limit/guard behavior when relevant.

---

## Security-Sensitive PRs

For auth, RBAC, tenancy, identity, audit, billing, AI safety, and channel adapter work, add targeted checks:

- Tenant isolation is preserved.
- Frontend is never authoritative for permissions.
- Sender identity is derived from auth context, not client body.
- Cross-tenant user/business enumeration is blocked.
- Removed/expired membership behavior is explicit.
- Internal notes are not exposed to customers.
- Audit events do not leak cross-tenant user data.
- Identity lookup does not expose email/name across tenants.
- AI stages S0–S4 are not weakened.
- No direct AI send behavior is introduced without Product Owner approval.
- Channel adapters do not leak provider-specific SDK logic into core domains.

---

## Merge Discipline

- Merge only after CTO/Product approval.
- Use **Squash and merge** only.
- After merge, sync local main and verify:

```bash
git switch main
git fetch origin main
git pull origin main
git status --short
git log --oneline -5
```

- Confirm the squash commit appears on main.
- Confirm feature branch commits did not land individually.

---

## Failure Rule

If any CLI validation or smoke test fails:

- Do not merge.
- Do not start a new feature.
- Create the smallest repair branch.
- Fix only the failing scope.
- Rerun validation and smoke tests.
- Request CTO/Product review again.

---

## Risk-Based Merge Gate Policy

> **Effective:** 2026-06-08 — derived from process learnings in PRs #39–#42.

**Core principle:** Smoke testing must be proportional to actual risk. Repeating a full Dashboard + Channels + Inbox + Audit manual sweep for a type alias rename or dead-code deletion is wasteful and obscures genuinely risky PRs. Every PR declares its risk level; validation scope follows the level.

> **No CLI Test + appropriate risk-based smoke = No Merge.**
>
> Manual smoke must be proportional to risk. Performing full-page sweeps on L0/L1 PRs is **forbidden** unless a specific regression concern is documented.

---

### Risk Levels

#### L0 — Docs / Comment-only

**Examples:** documentation, JSDoc comments, process policy updates, `.md` files.

| Gate | Required |
|---|---|
| `git diff` scope (docs files only) | ✅ Always |
| `bun run lint` / `pnpm lint` | Only if repo lints markdown |
| `bun run build` | Not required |
| Safety greps | Not required |
| Manual PO smoke | ❌ Not required |
| AUTH_URL preview switch | ❌ Not required |
| Post-merge production check | ❌ Not required |

---

#### L1 — Type-only / dead-code / no runtime path

**Examples:** moving type aliases between modules, deleting confirmed-dead files, renaming internal type-only modules, updating re-export chains with zero runtime consumers.

| Gate | Required |
|---|---|
| `bun run lint` | ✅ Always |
| `bun run build` | ✅ Always |
| Safety greps (import scan, diff scope) | ✅ Always |
| CI / Vercel status | ✅ Always |
| Visual Regression CI (if available) | ✅ Strong substitute for manual smoke |
| Manual PO smoke | ❌ Not required by default |
| AUTH_URL preview switch | ❌ Not required |
| Post-merge production check | ⚠️ Production error logs only (not full page sweep) |

> **Note:** If Visual Regression CI (Snapshot Pills + Snapshot Pixels) passes, it independently validates zero rendering change and satisfies the smoke requirement for L1 PRs.

---

#### L2 — Frontend UI route change

**Examples:** dashboard panel data source, `/channels` card layout, route copy or KPI changes, component refactors that touch rendered output.

| Gate | Required |
|---|---|
| `bun run lint` | ✅ Always |
| `bun run build` | ✅ Always |
| Safety greps | ✅ Always |
| Targeted preview smoke (changed routes only) | ✅ Yes |
| Manual PO smoke | ✅ Yes — targeted to changed route(s) |
| AUTH_URL preview switch | ⚠️ Only if authenticated preview smoke is required |
| Post-merge production check | ✅ Targeted smoke on changed route + production error logs |

> Full Dashboard + Channels + Inbox + Audit sweep is only needed when the change touches all of those routes. Scope smoke to the routes actually modified.

---

#### L3 — Auth / session / env / OAuth change

**Examples:** AUTH_URL change, Auth.js callback URL, Google OAuth config, Vercel environment variable changes, session cookie behavior.

| Gate | Required |
|---|---|
| `bun run lint` / `bun run build` (if frontend affected) | ✅ |
| Auth/session `curl` health check | ✅ Always |
| Full auth smoke (login → dashboard → logout) | ✅ Always |
| ENV restore verification after testing | ✅ Always |
| Manual PO smoke | ✅ Yes — full |
| AUTH_URL preview switch | ✅ Required and must be restored post-smoke |
| Post-merge production check | ✅ Auth/session health + production error logs |

---

#### L4 — Backend / API / schema / RBAC change

**Examples:** Prisma schema migrations, new or changed API endpoints, auth adapter changes, tenant/RBAC logic, audit domain changes.

| Gate | Required |
|---|---|
| `pnpm lint` | ✅ Always |
| `pnpm typecheck` | ✅ Always |
| `pnpm build` | ✅ Always |
| `pnpm test` | ✅ Always |
| Migration / schema validation (if applicable) | ✅ |
| Frontend integration smoke (if a route consumes the endpoint) | ✅ |
| Manual PO smoke | ✅ If user-facing behavior changes |
| Post-merge production check | ✅ Production logs + endpoint health/smoke |

---

### AUTH_URL Preview Switching

Switching `AUTH_URL` in Vercel env to a preview URL is only required when:
1. The PR requires authenticated preview smoke (L2 with auth-gated routes, L3, or L4 with user-facing endpoints).
2. The Vercel preview domain does not match the production `AUTH_URL`.

**Always restore `AUTH_URL` to `https://dashboard.aiautomations.ae` immediately after preview smoke.**

Switching `AUTH_URL` for L0 and L1 PRs is explicitly **forbidden** — it adds unnecessary production risk for changes that do not require authenticated preview smoke.

---

### Risk Level Decision Tree

```
Is this docs/comments only?
  → Yes: L0

Does it change any runtime import, render output, or API call?
  → No:  L1 (type-only or dead-code)
  → Yes: continue

Does it change auth, session, env, or OAuth behavior?
  → Yes: L3

Does it change a backend domain, API endpoint, schema, or RBAC rule?
  → Yes: L4

Does it change a frontend route's rendered output, data source, or UX?
  → Yes: L2
```

---

### PR Risk Declaration (copy into every PR body)

Every PR must include this block in its body:

```markdown
## Risk Declaration

- **Risk Level:** L? — [type: docs / type-only / UI / auth / backend]
- **Why this level:** [one sentence justification]
- **Automated gates:** [lint ✅ / build ✅ / safety greps ✅ / CI ✅]
- **Safety greps:** [list key greps run, or "N/A for L0"]
- **Manual smoke required:** [Yes — scope: … / No — reason: L1 type-only, Visual Regression CI passed]
- **Smoke URLs:** [preview URL or production URL, or "N/A"]
- **AUTH_URL switch required:** [Yes — restored to production after smoke / No]
- **Post-merge checks:** [production error logs / targeted route smoke / none]
```

---

### Smoke Scope Reference Table

| Risk | Manual PO Smoke | Scope | AUTH_URL Switch | Post-merge |
|---|---|---|---|---|
| L0 | ❌ | None | ❌ | None |
| L1 | ❌ (default) | None — Visual Regression CI sufficient | ❌ | Error logs only |
| L2 | ✅ Targeted | Changed route(s) only | Only if needed for auth-gated preview | Targeted route + error logs |
| L3 | ✅ Full | Auth flow + affected routes | ✅ Required (must restore) | Auth health + error logs |
| L4 | ✅ If user-facing | Affected endpoints + consuming routes | Only if auth-gated | Endpoint health + error logs |

