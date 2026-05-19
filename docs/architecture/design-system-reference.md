# Design System Reference

Reference for the design system established in the Lovable prototype. Production must port the token and primitive layers first, before any page implementation.

## 1. Design Direction

- **Neutral-first premium SaaS.** Chrome (surfaces, nav, cards) is neutral. Color is reserved for meaningful semantic state.
- **Semantic color only where meaningful.** A color on screen should always mean something — never decoration.
- **Human-first AI operations product.** Tone is calm, professional, and trustworthy. Operators are in control; AI assists.
- **No neon / gaming / crypto style.** No saturated gradients-as-identity, no "AI sparkle" maximalism.
- **Controlled accents only.** A single brand accent (Indigo) plus a small, fixed semantic palette.

## 2. Theme Modes

- **Light** — default.
- **Dark** — standard dark theme.
- **Night** — layered on top of Dark (both `.dark` and `.night` classes apply), so all `dark:` variants still resolve. Deeper, lower-luminance surfaces for low-light environments.
- **System** — follows OS preference.

## 3. Token Architecture

The prototype uses a 3-layer token model in `src/styles.css`:

1. **Primitive tokens.** Raw color, spacing, radius, shadow scales. Not consumed directly by components.
2. **Semantic tokens.** Named by role (`--background`, `--foreground`, `--primary`, `--muted`, `--accent`, `--success`, `--warning`, `--destructive`, `--ai`, etc.). Components consume these.
3. **Component tokens.** Per-component overrides for surfaces that need their own scale (e.g. sidebar, surface, surface-muted). Always derived from semantic tokens.

Rule: components never reference primitives or raw color values. Only semantic / component tokens.

## 4. Semantic Status Rules

Status meanings are strict and never merged:

- **neutral** — `new`, generic informational.
- **info / open** — `open` conversations (blue).
- **warning / waiting** — `waiting` on customer or external party (amber).
- **attention / follow-up** — `needs-followup`, `high` priority (orange).
- **destructive / error / security** — `urgent`, errors, security events (rose).
- **success / active** — `closed` (muted success), healthy / active state.
- **AI / human-review** — `needs-review`, AI draft surfaces (violet).
- **muted / planned / future** — inactive, planned, coming-soon, not-enabled. Identity-colored dot only; surface stays neutral.

Priority mapping: `low` / `normal` = neutral, `high` = attention, `urgent` = destructive.

## 5. Pill / Badge Rules

- **`<Pill>` is the single source of truth** for status / state / role indicators. Channel identity uses `<ChannelBadge>` / `<ChannelStateTag>`.
- **Golden Contrast Rule (Universal Pill Contrast):** soft-variant pills always use `text-foreground` (or `text-muted-foreground` for de-emphasized). The accent color appears **only** in the dot, icon, ring, or border — never in low-contrast text.
  - Forbidden: `bg-{c}/X text-{c}` pairings.
  - Exception: the solid variant uses `bg-{c} text-{c}-foreground` for **Urgent**, primary CTAs, and single critical states.
- Soft pills use readable foreground; the accent belongs in dot / icon / ring / border, not in the text itself.

## 6. Responsive Rules

- **Desktop:** sidebar navigation, full data tables, side panels.
- **Tablet:** icon rail navigation.
- **Mobile:** bottom navigation plus a "More" sheet for the long tail.
- **Tables become cards on mobile.** Never horizontal-scroll a dense table.
- **Context panels become sheets / drawers on mobile.**
- **Universal responsive consistency:** every visual / styling change applies to all breakpoints by default. Semantic properties (color, badge variant, icon choice, status type) never use responsive prefixes — those are reserved for layout, spacing, sizing, and visibility.

## 7. Migration Recommendation

- **Port tokens and primitives first.** The 3-layer token system, the `<Pill>` primitive, the contrast lint rule, and the shell scaffolds are P0.
- **Do not start page implementation before tokens and shells are stable.** Pages built against unstable tokens will need to be rewritten and will encode visual drift into the production codebase.
