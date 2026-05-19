/**
 * Unified ChannelStateTag — pill that communicates a channel's connection
 * state on cards (Channels page, Settings, Dashboard widget).
 *
 * Follows the Golden Contrast Rule: soft tinted backgrounds use neutral
 * text; only the dot and the (optional) spinner carry semantic color.
 */
import { Loader2 } from "lucide-react";
import type { ChannelState } from "@/lib/channels";

const TEXT: Record<ChannelState, string> = {
  active: "Active",
  connecting: "Connecting…",
  planned: "Planned",
  not_connected: "Not connected",
};

export function ChannelStateTag({ state }: { state: ChannelState }) {
  const isActive = state === "active";
  const isConnecting = state === "connecting";
  const isMuted = state === "planned" || state === "not_connected";

  const bg = isActive
    ? "color-mix(in oklab, var(--success) 15%, transparent)"
    : isConnecting
      ? "color-mix(in oklab, var(--warning) 15%, transparent)"
      : "var(--muted)";

  const dotColor = isActive
    ? "var(--success)"
    : isConnecting || state === "planned"
      ? "var(--warning)"
      : "var(--muted-foreground)";

  const textColor = isMuted ? "var(--muted-foreground)" : "var(--foreground)";

  return (
    <span
      className="inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium"
      style={{
        background: bg,
        color: textColor,
        border: `0.5px solid color-mix(in oklab, ${dotColor} 25%, transparent)`,
      }}
      data-channel-state={state}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: dotColor,
          animation: isConnecting ? "ch-pulse 1.5s ease-in-out infinite" : undefined,
        }}
      />
      {TEXT[state]}
      {isConnecting && (
        <Loader2 className="ml-0.5 h-3 w-3 animate-spin" style={{ color: dotColor }} />
      )}
    </span>
  );
}
