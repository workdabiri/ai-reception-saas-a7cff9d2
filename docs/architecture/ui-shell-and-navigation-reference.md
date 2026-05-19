# UI Shell and Navigation Reference

This document captures the shell, navigation, and active-route conventions established in the Lovable prototype. It is a reference for the production rebuild — not a copy-paste contract.

## 1. Shells from Lovable Prototype

### Business Panel AppShell
- **Purpose:** Primary surface for owners and operators of a business workspace.
- **Routes:** `/`, `/inbox`, `/customers`, `/customers/$customerId`, `/channels`, `/channels/$channelId`, `/knowledge`, `/settings`, `/settings/ai`, `/members`, `/audit`, `/notifications`, `/profile`, `/role-preview`, `/states`.
- **Navigation behavior:** Persistent left navigation with workspace switcher, notification entry point, and profile menu in the top bar.
- **Responsive behavior:** Desktop full sidebar → tablet icon rail → mobile bottom nav plus "More" sheet.
- **Production recommendation:** Re-implement as the authenticated tenant shell. Route guards must enforce membership in the active tenant server-side.

### AdminShell
- **Purpose:** Internal Platform Admin surface for operators of the SaaS itself. Visually and structurally distinct from the Business Panel.
- **Routes:** `/admin`, `/admin/businesses`, `/admin/businesses/$businessId`, `/admin/users`, `/admin/usage`, `/admin/provider-health`, `/admin/audit`, `/admin/feature-flags`, `/admin/support`.
- **Navigation behavior:** Own header, own nav, explicit "Internal · Mock" labeling, and a safe "Back to Business Panel" link.
- **Responsive behavior:** Desktop sidebar → tablet rail → mobile sheet.
- **Production recommendation:** Rebuild as a separately authorized surface. Access must be gated by platform-level role, not tenant membership. Never share routing or session scope with the Business Panel.

### AuthLayout
- **Purpose:** Public, unauthenticated surfaces.
- **Routes:** `/login`, `/signup`, `/forgot-password`, `/verify-email`, `/session-expired`, `/access-denied`, `/invite/$token`.
- **Navigation behavior:** Minimal header (brand + theme toggle). Optional product preview panel on desktop.
- **Responsive behavior:** Single-column on mobile, two-column on large viewports.
- **Production recommendation:** Keep this shell explicitly outside any authenticated provider tree. Do not nest under AppShell.

### OnboardingLayout
- **Purpose:** First-run setup wizard.
- **Routes:** `/onboarding/workspace`, `/onboarding/profile`, `/onboarding/channel`, `/onboarding/team`, `/onboarding/ai`, `/onboarding/done`.
- **Navigation behavior:** Linear stepper with explicit Back / Continue / Skip controls. No sidebar.
- **Responsive behavior:** Card-centered, with optional summary aside on desktop.
- **Production recommendation:** Keep as its own shell. Onboarding state must be persisted server-side per tenant and re-entrant.

### Web Chat surface
- **Purpose:** End-customer-facing chat surface, fundamentally not a Business Panel route.
- **Routes:** `/chat/$businessId`, `/widget-preview`.
- **Navigation behavior:** None. No app chrome. Brandable per business.
- **Responsive behavior:** Embeddable; full-bleed on mobile.
- **Production recommendation:** Treat as a separate public surface with its own session model (anonymous visitor sessions), its own CSP, and no access to operator UI.

## 2. Route Classification

- **Business Panel routes** use **AppShell**.
- **Admin routes** (`/admin/*`) use **AdminShell**.
- **Auth, onboarding, public, and customer-facing routes** bypass the Business AppShell entirely.
- Shell selection must remain **explicit and safe**. In the prototype this is done by pathname prefix matching in `src/routes/__root.tsx`. In production, prefer route-group layouts so shell selection cannot accidentally regress and so authorization can attach at the layout boundary.

## 3. Navigation Model

- **Desktop:** Full sidebar with labels.
- **Tablet:** Icon rail with tooltips.
- **Mobile:** Bottom navigation with the primary destinations, plus a "More" sheet for the long tail.
- **Admin navigation:** Mirrors the same desktop / tablet / mobile pattern but lives in AdminShell with distinct branding.
- **Profile menu:** Lives in the top bar of both shells; surfaces session, profile, theme, and a sign-out affordance.
- **Notification entry point:** Top-bar bell in the Business Panel, linking to `/notifications`.

## 4. Active Route Matching

The prototype's active-state logic must match nested routes correctly. Examples:

- `/channels/web-chat` activates the **Channels** nav item.
- `/settings/ai` activates the **AI Settings** nav item (not just `/settings`).
- `/knowledge` activates **Knowledge**.
- `/notifications` activates **Notifications**.
- `/profile` activates **Profile**.
- `/role-preview` activates **Role Preview**.

Production rule: active-state matching must use route hierarchy, not naive prefix equality, so a parent does not steal active state from its more specific child.

## 5. Production Rules

- **Navigation must be role-aware.** Different roles see different items. The prototype demonstrates role visibility via `/role-preview` only — it is not a security mechanism.
- **UI visibility is not authorization.** Hiding a nav item never substitutes for server-side checks.
- **Server-side authz must enforce access** for every route, server function, and API endpoint. Client-side guards exist only to avoid showing broken UI to users who would be rejected anyway.
