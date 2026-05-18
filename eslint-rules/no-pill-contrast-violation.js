/**
 * ESLint rule: no-pill-contrast-violation
 *
 * Enforces the Golden Contrast Rule (Constitution Section III):
 * Soft-variant pills/badges/tags/chips must never combine a tinted
 * background with matching-color text. Accent color belongs on the
 * dot, icon, or border — not on the text.
 *
 * Flags any string literal / template that contains BOTH:
 *   bg-{variant}[ -soft | /<n> ]   AND   text-{variant}
 * for variant in: info, success, warning, warn, destructive, primary,
 * ai, attention, operator.
 *
 * The solid pattern `bg-{variant} text-{variant}-foreground` is allowed
 * (the `-foreground` suffix is the inverse token).
 */
"use strict";

const VARIANTS = [
  "info",
  "success",
  "warning",
  "warn",
  "destructive",
  "primary",
  "ai",
  "attention",
  "operator",
];

function check(value) {
  if (typeof value !== "string" || value.length === 0) return null;
  for (const v of VARIANTS) {
    // bg-<v>, bg-<v>/<n>, bg-<v>-soft  (token boundary on both sides)
    const bgRe = new RegExp(`(?:^|\\s)bg-${v}(?:-soft|\\/[\\d.]+)?(?=\\s|$)`);
    // text-<v> but NOT text-<v>-foreground (the legitimate solid pair)
    const txtRe = new RegExp(`(?:^|\\s)text-${v}(?:\\/[\\d.]+)?(?!-foreground)(?=\\s|$|/)`);
    if (bgRe.test(value) && txtRe.test(value)) {
      return v;
    }
  }
  return null;
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow pairing bg-{variant} with text-{variant} (Golden Contrast Rule).",
    },
    schema: [],
    messages: {
      violation:
        "Golden Contrast violation: `bg-{{variant}}` paired with `text-{{variant}}`. Use `text-foreground` (soft variant) or `text-{{variant}}-foreground` (solid variant). See mem://index.md → Golden Contrast Rule.",
    },
  },
  create(context) {
    function report(node, variant) {
      context.report({ node, messageId: "violation", data: { variant } });
    }
    return {
      Literal(node) {
        const v = check(node.value);
        if (v) report(node, v);
      },
      TemplateElement(node) {
        const raw = node.value && (node.value.cooked ?? node.value.raw);
        const v = check(raw);
        if (v) report(node, v);
      },
    };
  },
};
