# Lovable Prototype Handoff

## 1. Executive Summary

- **Prototype status:** Ready for handoff.
- **Purpose:** UI / UX / product reference only. The Lovable prototype exists to make the product narrative, information architecture, shells, navigation, design system, and state coverage concrete and reviewable.
- **Not production-ready.** The prototype is a frontend-only mock. It must not be deployed as a real product, used to handle real customer data, or treated as a backend contract.
- **Mock-only limitations:** Every interaction is local UI state on top of static mock data. There is no persistence, no network round-trip to an application backend, and no enforcement of any business rule beyond what is hard-coded in the demo data.

## 2. Surfaces Covered

The prototype implements 44 routes across the following surfaces.

### Business Panel (AppShell)
- `/` — Dashboard
- `/inbox` — Inbox
- `/customers` — Customers list
- `/customers/$customerId` — Customer detail
- `/channels` — Channels list
- `/channels/$channelId` — Channel setup detail
- `/knowledge` — Knowledge base
- `/settings` — Settings (layout)
- `/settings/ai` — AI settings
- `/members` — Members & roles
- `/audit` — Business audit log
- `/notifications` — Notification center
- `/profile` — Profile
- `/role-preview` — Role-based UX preview
- `/states` — State coverage gallery

### Auth / Public (AuthLayout)
- `/login`
- `/signup`
- `/forgot-password`
- `/verify-email`
- `/session-expired`
- `/access-denied`
- `/invite/$token`

### Onboarding (OnboardingLayout)
- `/onboarding/workspace`
- `/onboarding/profile`
- `/onboarding/channel`
- `/onboarding/team`
- `/onboarding/ai`
- `/onboarding/done`

### Customer-facing Web Chat
- `/chat/$businessId` — End-customer web chat surface
- `/widget-preview` — Embeddable widget preview

### Platform Admin (AdminShell)
- `/admin` — Overview
- `/admin/businesses` — Businesses list
- `/admin/businesses/$businessId` — Business detail
- `/admin/users` — Users
- `/admin/usage` — Usage
- `/admin/provider-health` — Provider health
- `/admin/audit` — Platform audit
- `/admin/feature-flags` — Feature flags
- `/admin/support` — Support queue

### Internal / demo
- `/studio` — Design studio
- `/dev/pill-gallery` — Pill gallery

## 3. What the Prototype Demonstrates

- An end-to-end product narrative for an AI Reception SaaS.
- The full persona flow: **visitor → owner → operator → admin → customer.**
- AI drafts only — operators always review and send. There are no auto-replies.
- **Web Chat** and **Email** are presented as mock-active channels.
- **WhatsApp, Instagram, Telegram, SMS, and Voice** are presented as planned / future channels with clear "not enabled" states.
- A Platform Admin operator surface, distinct from the Business Panel, for internal operators.
- Complete state coverage (empty / loading / error / access-denied) wired via `?state=` query params for review.
- Responsive parity across desktop, tablet, and mobile.
- Light / Dark / Night / System theme modes.

## 4. What Is Mock Only

The prototype explicitly does **not** include:

- No real authentication.
- No database.
- No API layer.
- No provider integrations (no WhatsApp / Instagram / Telegram / SMS / Voice / Email vendor).
- No AI provider.
- No billing.
- No persistence — refreshing the page resets all in-memory state.
- No server-side authorization. UI visibility is not security.

## 5. Handoff Judgment

- **Ready** for use as a design, UX, and product reference.
- **Not** production software, and not a backend contract.
- Use the prototype as an implementation reference. Do **not** copy-paste prototype source into the production repository as if it were product code. Production code must be rebuilt against real auth, real tenancy, real data fetching, and real server-side authorization.
