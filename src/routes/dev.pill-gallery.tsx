/**
 * Visual regression gallery — every pill / badge variant rendered in a
 * deterministic grid for headless pixel-diff capture. Not linked from app
 * nav; addressable only by direct URL (/dev/pill-gallery).
 *
 * Each sample is wrapped in `[data-pill-id="..."]` so the diff runner can
 * screenshot single anchors instead of the full page.
 */
import { createFileRoute } from "@tanstack/react-router";
import { Pill, type PillVariant, type PillAppearance } from "@/components/ui/pill";
import { StatusChip } from "@/components/ui-bits";
import { ChannelBadge } from "@/components/channel-badge";
import { ChannelStateTag } from "@/components/channel-state-tag";
import { CHANNELS, type ChannelState } from "@/lib/channels";

export const Route = createFileRoute("/dev/pill-gallery")({ component: Gallery });

const PILL_VARIANTS: PillVariant[] = [
  "info",
  "success",
  "warn",
  "destructive",
  "primary",
  "ai",
  "operator",
  "muted",
  "neutral",
];
const PILL_APPEARANCES: PillAppearance[] = ["soft", "solid"];
const CHIP_STATES = [
  "new",
  "open",
  "waiting",
  "closed",
  "needs-review",
  "follow-up",
  "urgent",
  "active",
  "access-denied",
  "future",
] as const;
const CHANNEL_STATES: ChannelState[] = ["active", "connecting", "planned", "not_connected"];

function Cell({ id, children }: { id: string; children: React.ReactNode }) {
  // Inline-block + fixed padding keeps the capture box stable across runs.
  return (
    <div
      data-pill-id={id}
      style={{ display: "inline-block", padding: 8, background: "transparent" }}
    >
      {children}
    </div>
  );
}

function Gallery() {
  return (
    <div
      style={{
        padding: 24,
        background: "var(--background)",
        color: "var(--foreground)",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 14, marginBottom: 16, opacity: 0.6 }}>
        pill-gallery (visual regression)
      </h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {PILL_VARIANTS.flatMap((v) =>
          PILL_APPEARANCES.map((a) => (
            <Cell key={`p-${v}-${a}`} id={`pill--${v}--${a}`}>
              <Pill variant={v} appearance={a}>
                {v}
              </Pill>
            </Cell>
          )),
        )}
        {CHIP_STATES.map((s) => (
          <Cell key={`c-${s}`} id={`chip--${s}`}>
            <StatusChip status={s} />
          </Cell>
        ))}
        {Object.keys(CHANNELS).flatMap((k) =>
          CHANNEL_STATES.map((s) => (
            <Cell key={`cb-${k}-${s}`} id={`channel-badge--${k}--${s}`}>
              <ChannelBadge channel={k} state={s} />
            </Cell>
          )),
        )}
        {CHANNEL_STATES.map((s) => (
          <Cell key={`cst-${s}`} id={`channel-state-tag--${s}`}>
            <ChannelStateTag state={s} />
          </Cell>
        ))}
      </div>
    </div>
  );
}
