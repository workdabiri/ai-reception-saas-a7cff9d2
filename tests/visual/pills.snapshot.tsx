/**
 * Lightweight visual regression for pill / badge components.
 *
 * Why this exists
 * ----------------
 * Per Universal Responsive Consistency, semantic visual identity (colors,
 * variants, badge type, icon choice) MUST be identical across mobile,
 * tablet and desktop. Per the Golden Contrast Rule, soft-variant pills
 * must never combine `bg-{c}/N` with `text-{c}` — accent color belongs in
 * the dot/icon/border only.
 *
 * This script renders every Pill/StatusChip/ChannelBadge/ChannelStateTag
 * variant once, snapshots the markup, and runs two static guards. It is
 * intentionally dependency-free (no jest/vitest/playwright) — runs under
 * bun via `bun run snapshot:pills`. Update goldens with `:update`.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Pill, type PillVariant, type PillAppearance } from "../../src/components/ui/pill";
import { StatusChip } from "../../src/components/ui-bits";
import { ChannelBadge } from "../../src/components/channel-badge";
import { ChannelStateTag } from "../../src/components/channel-state-tag";
import { CHANNELS, type ChannelState } from "../../src/lib/channels";

// ─────────────────────────────────────────────────────────────────────────────
// Sample matrix — every variant of every component, at every breakpoint.
// ─────────────────────────────────────────────────────────────────────────────

const BREAKPOINTS = [
  { name: "mobile", width: 375 },
  { name: "tablet", width: 768 },
  { name: "desktop", width: 1280 },
] as const;

const PILL_VARIANTS: PillVariant[] = [
  "info", "success", "warn", "destructive", "primary", "ai", "operator", "muted", "neutral",
];
const PILL_APPEARANCES: PillAppearance[] = ["soft", "solid"];

const CHIP_STATES = [
  "new", "open", "waiting", "closed", "needs-review",
  "follow-up", "urgent", "active", "access-denied", "future",
] as const;

const CHANNEL_STATES: ChannelState[] = ["active", "connecting", "planned", "not_connected"];

function buildSamples() {
  const out: Array<{ id: string; node: React.ReactElement }> = [];

  for (const v of PILL_VARIANTS) {
    for (const a of PILL_APPEARANCES) {
      out.push({
        id: `pill/${v}/${a}`,
        node: <Pill variant={v} appearance={a}>{v}</Pill>,
      });
    }
  }
  for (const s of CHIP_STATES) {
    out.push({ id: `chip/${s}`, node: <StatusChip status={s} /> });
  }
  for (const k of Object.keys(CHANNELS)) {
    for (const s of CHANNEL_STATES) {
      out.push({
        id: `channel-badge/${k}/${s}`,
        node: <ChannelBadge channel={k} state={s} />,
      });
    }
  }
  for (const s of CHANNEL_STATES) {
    out.push({ id: `channel-state-tag/${s}`, node: <ChannelStateTag state={s} /> });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Guard 1 — Golden Contrast Rule.
// Flag any `bg-{c}/N` paired with `text-{c}` (must use text-foreground).
// ─────────────────────────────────────────────────────────────────────────────

const CONTRAST_COLORS = [
  "info", "success", "warning", "warn", "destructive",
  "primary", "ai", "attention", "operator",
];

function findContrastViolations(html: string): string[] {
  const violations: string[] = [];
  for (const c of CONTRAST_COLORS) {
    const bg = new RegExp(`\\bbg-${c}\\/\\d+`);
    const text = new RegExp(`\\btext-${c}(?![\\w-])`); // not text-{c}-foreground
    if (bg.test(html) && text.test(html)) violations.push(c);
  }
  return violations;
}

// ─────────────────────────────────────────────────────────────────────────────
// Guard 2 — Universal Responsive Consistency.
// Semantic classes must not carry sm:/md:/lg:/xl: prefixes.
// ─────────────────────────────────────────────────────────────────────────────

const SEMANTIC_PROPS = ["bg", "text", "border", "ring", "from", "to", "via"];
const RESPONSIVE_PREFIX = /(sm|md|lg|xl|2xl):/g;

function findResponsiveSemanticViolations(html: string): string[] {
  const hits: string[] = [];
  // Extract class= strings
  const classAttr = /class(?:Name)?="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = classAttr.exec(html))) {
    for (const token of m[1].split(/\s+/)) {
      if (!RESPONSIVE_PREFIX.test(token)) continue;
      RESPONSIVE_PREFIX.lastIndex = 0;
      const stripped = token.replace(RESPONSIVE_PREFIX, "");
      const head = stripped.split("-")[0];
      if (SEMANTIC_PROPS.includes(head)) hits.push(token);
    }
  }
  return hits;
}

// ─────────────────────────────────────────────────────────────────────────────
// Snapshot driver
// ─────────────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAP_DIR = join(__dirname, "__snapshots__");
const SNAP_FILE = join(SNAP_DIR, "pills.snap.json");

type SnapRecord = Record<string, string>;

function render(): { snap: SnapRecord; bpDrift: string[]; contrast: Record<string, string[]>; responsive: Record<string, string[]> } {
  const samples = buildSamples();
  const snap: SnapRecord = {};
  const bpDrift: string[] = [];
  const contrast: Record<string, string[]> = {};
  const responsive: Record<string, string[]> = {};

  for (const { id, node } of samples) {
    const perBp = BREAKPOINTS.map((bp) => {
      // Wrap with a fixed-width container to simulate breakpoint context.
      // Since semantic classes must be device-agnostic, the rendered markup
      // for the inner component should be byte-identical across widths.
      const wrapped = (
        <div data-bp={bp.name} style={{ width: bp.width }}>
          {node}
        </div>
      );
      return renderToStaticMarkup(wrapped);
    });

    // Strip the outer wrapper before comparing — keep only the component HTML.
    const inner = perBp.map((h) =>
      h.replace(/^<div data-bp="[^"]+" style="width:\d+px">/, "").replace(/<\/div>$/, ""),
    );

    if (new Set(inner).size > 1) {
      bpDrift.push(`${id}: mobile=${inner[0]} tablet=${inner[1]} desktop=${inner[2]}`);
    }

    snap[id] = inner[0];

    const cv = findContrastViolations(inner[0]);
    if (cv.length) contrast[id] = cv;
    const rv = findResponsiveSemanticViolations(inner[0]);
    if (rv.length) responsive[id] = rv;
  }

  return { snap, bpDrift, contrast, responsive };
}

function main() {
  const update = process.argv.includes("--update");
  const { snap, bpDrift, contrast, responsive } = render();

  const failures: string[] = [];

  if (bpDrift.length) {
    failures.push(
      `Universal Responsive Consistency: ${bpDrift.length} component(s) rendered differently across breakpoints:\n  - ${bpDrift.join("\n  - ")}`,
    );
  }
  if (Object.keys(contrast).length) {
    failures.push(
      `Golden Contrast Rule: ${Object.keys(contrast).length} violation(s) (bg-{c}/N + text-{c}):\n  - ${Object.entries(contrast)
        .map(([k, v]) => `${k}: ${v.join(", ")}`)
        .join("\n  - ")}`,
    );
  }
  if (Object.keys(responsive).length) {
    failures.push(
      `Responsive prefix on semantic class:\n  - ${Object.entries(responsive)
        .map(([k, v]) => `${k}: ${v.join(", ")}`)
        .join("\n  - ")}`,
    );
  }

  if (!existsSync(SNAP_DIR)) mkdirSync(SNAP_DIR, { recursive: true });

  if (update || !existsSync(SNAP_FILE)) {
    writeFileSync(SNAP_FILE, JSON.stringify(snap, null, 2) + "\n");
    console.log(`✓ wrote snapshot (${Object.keys(snap).length} samples) → ${SNAP_FILE}`);
  } else {
    const prev = JSON.parse(readFileSync(SNAP_FILE, "utf8")) as SnapRecord;
    const diffs: string[] = [];
    for (const k of new Set([...Object.keys(prev), ...Object.keys(snap)])) {
      if (prev[k] !== snap[k]) diffs.push(`  ${k}\n    - ${prev[k] ?? "<missing>"}\n    + ${snap[k] ?? "<missing>"}`);
    }
    if (diffs.length) {
      failures.push(`Snapshot drift (${diffs.length}):\n${diffs.join("\n")}`);
    } else {
      console.log(`✓ snapshot matches (${Object.keys(snap).length} samples)`);
    }
  }

  if (failures.length) {
    console.error("\n✗ visual regression failures:\n\n" + failures.join("\n\n"));
    process.exit(1);
  }
  console.log("✓ all guards passed (contrast, responsive, snapshot)");
}

main();
