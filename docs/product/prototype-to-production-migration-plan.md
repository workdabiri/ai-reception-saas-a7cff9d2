# Prototype to Production Migration Plan

How to move from the Lovable prototype to a production implementation, in priority order.

## 1. What Should Be Migrated First

### P0 — foundations
- Design tokens / theme foundation (3-layer model, Light / Dark / Night / System).
- UI primitives (Pill, Button, Badge, Card, Sheet, etc.).
- Shell concepts: AppShell, AdminShell, AuthLayout, OnboardingLayout.
- State components (empty, loading, error, access-denied).
- Auth / onboarding UX reference.
- Members / roles UX reference.
- Dashboard / Inbox UX reference.

### P1 — product surfaces
- Web Chat customer surface.
- Channel setup pages.
- AI / Knowledge settings.
- Notifications / Profile.
- Platform Admin skeleton.
- Mobile "More" navigation.

### P2 — internal / advanced
- Design Studio.
- Pill gallery.
- Mock admin actions.
- Feature flag mocks.
- Support queue mocks.
- Advanced query-param state previews.

## 2. What Must Be Rebuilt, Not Copied Blindly

Everything below is mocked in the prototype and must be rebuilt against real systems:

- Authentication.
- Authorization (server-side, not UI gating).
- Tenant scoping (every query, every mutation).
- Data fetching (typed server functions / API).
- Database models.
- Audit log persistence.
- AI draft generation.
- Provider integrations (WhatsApp, Instagram, Telegram, SMS, Voice, Email).
- Billing.
- Admin actions.

## 3. Production Risks

Risks introduced by treating the prototype as production:

- **No real auth** — there is no identity, no session, no token verification.
- **No server-side authorization** — UI visibility is the only "check" present today.
- **No database** — all data is in-memory mock fixtures.
- **No API layer** — no contract, no validation, no rate limiting.
- **No multi-tenant enforcement** — the prototype assumes a single demo tenant.
- **No audit persistence** — the audit screen renders mock rows only.
- **No provider integrations** — channels render UI states, not real provider behavior.
- **No AI provider** — drafts are static fixtures.
- **No billing** — no plans, entitlements, metering, or webhooks.
- **Route state previews are demo-only** — `?state=` query params are a review tool, not a real loading model.
- **Admin actions are disabled mocks** — no destructive operation in the prototype actually runs.

## 4. Recommended Engineering Roadmap

### Phase 1 — Tenant / Identity / Access / Auth
- `User`
- `Tenant` / `Business`
- `Membership`
- `Invite`
- Server-side authorization primitives.
- AppShell route guards (server-enforced, with client UX matching).

### Phase 2 — Business Panel data wiring
- Dashboard
- Customers
- Members
- Audit

### Phase 3 — Inbox and Conversations
- `Conversation`
- `Message`
- `Channel`
- Web Chat input pipeline.

### Phase 4 — AI and Knowledge
- `KnowledgeItem`
- `BusinessRule`
- `AiPolicy`
- `Draft`
- Human review workflow (operator always sends).

### Phase 5 — Notifications / Profile / Admin (read-only)
- Notification delivery and read state.
- Profile and preferences.
- Read-only Platform Admin views backed by real data.

### Phase 6 — Provider integrations, billing, advanced admin
- Channel provider integrations.
- Billing and entitlements.
- Destructive admin actions with audit and authorization.

## 5. Immediate Next Engineering Task

**Recommended:** `TASK-0007: Implement tenant / identity / access Prisma schema.`

Do **not** implement TASK-0007 as part of this documentation task.
