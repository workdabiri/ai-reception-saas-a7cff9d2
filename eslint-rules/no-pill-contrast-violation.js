/**
 * ESLint rule: no-pill-contrast-violation
 *
 * Enforces the Golden Contrast Rule (Constitution Section III):
 * Soft-variant pills/badges/tags/chips must never combine a tinted
 * background with matching-color text. Accent color belongs on the
 * dot, icon, or border — not on the text.
 *
 * Flags any string / template that contains BOTH:
 *   bg-{variant}[ -soft | /<n> ]   AND   text-{variant}
 * for variant in: info, success, warning, warn, destructive, primary,
 * ai, attention, operator.
 *
 * The solid pattern `bg-{v} text-{v}-foreground` is allowed
 * (the `-foreground` suffix is the inverse token).
 */
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

function findViolation(value) {
  if (typeof value !== "string" || value.length === 0) return null;
  for (const v of VARIANTS) {
    // Pill signature: tinted background uses an opacity modifier — bg-{v}/<n>.
    // Bare `bg-{v}` (solid) and `bg-{v}-soft` (icon-tile convention) are
    // legitimate and intentionally NOT matched here.
    const bgRe = new RegExp(`(?:^|\\s)bg-${v}\\/[\\d.]+(?=\\s|$)`);
    // Matching colored text — but NOT `text-{v}-foreground` (the solid inverse).
    const txtRe = new RegExp(`(?:^|\\s)text-${v}(?:\\/[\\d.]+)?(?!-foreground)(?=\\s|$|/)`);
    if (bgRe.test(value) && txtRe.test(value)) return v;
  }
  return null;
}

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow pairing bg-{variant} with text-{variant} (Golden Contrast Rule).",
    },
    schema: [],
    messages: {
      violation:
        "Golden Contrast violation: `bg-{{variant}}` paired with `text-{{variant}}`. Use `text-foreground` (soft variant) or `text-{{variant}}-foreground` (solid variant). See mem://index.md → Golden Contrast Rule.",
    },
  },
  create(context) {
    const report = (node, variant) =>
      context.report({ node, messageId: "violation", data: { variant } });
    return {
      Literal(node) {
        const v = findViolation(node.value);
        if (v) report(node, v);
      },
      TemplateElement(node) {
        const raw = node.value && (node.value.cooked ?? node.value.raw);
        const v = findViolation(raw);
        if (v) report(node, v);
      },
    };
  },
};
