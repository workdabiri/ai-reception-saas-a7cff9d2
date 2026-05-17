/**
 * Unified ChannelIcon — renders the icon for any channel from the
 * registry in src/lib/channels.ts. Brand color is carried by the
 * --ch-* CSS variable; the surrounding tile reads neutrally and uses
 * brand color only as accent (icon tint + soft tint background or
 * de-emphasized ring for planned/not-connected states).
 *
 * Back-compat: accepts legacy keys (webchat, voice, webform) and the
 * old `inactive` + numeric `size` props used across existing routes.
 */
import { Loader2 } from "lucide-react";
import {
  CHANNELS,
  resolveChannelKey,
  type ChannelKey,
  type ChannelState,
} from "@/lib/channels";

type SizeToken = "sm" | "md" | "lg";

const SIZE_PX: Record<SizeToken, number> = { sm: 32, md: 40, lg: 48 };

export function ChannelIcon({
  channel,
  state = "active",
  size = "md",
  inactive,
}: {
  channel: ChannelKey | string;
  state?: ChannelState;
  /** Token size (sm/md/lg) OR raw pixel number for legacy callers. */
  size?: SizeToken | number;
  /** Legacy: when true, force a planned/de-emphasized treatment. */
  inactive?: boolean;
}) {
  const def = CHANNELS[resolveChannelKey(channel)];
  const Icon = def.icon;

  const effective: ChannelState = inactive ? "planned" : state;
  const px = typeof size === "number" ? size : SIZE_PX[size];
  const iconPx = Math.round(px * 0.5);
  const radius = Math.max(8, Math.round(px * 0.25));

  const isMuted = effective === "planned" || effective === "not_connected";
  const isConnecting = effective === "connecting";

  const baseStyle: React.CSSProperties = {
    width: px,
    height: px,
    borderRadius: radius,
  };

  const colorStyle: React.CSSProperties = isMuted
    ? {
        background: "var(--muted)",
        color: "var(--muted-foreground)",
        boxShadow: `0 0 0 1.5px color-mix(in oklab, var(${def.cssVar}) 22%, transparent)`,
      }
    : {
        background: `color-mix(in oklab, var(${def.cssVar}) 12%, transparent)`,
        color: `var(${def.cssVar})`,
        boxShadow: `inset 0 0 0 0.5px color-mix(in oklab, var(${def.cssVar}) 25%, transparent)`,
      };

  return (
    <span
      className="relative inline-grid place-items-center"
      data-channel={resolveChannelKey(channel)}
      data-channel-state={effective}
      style={{ ...baseStyle, ...colorStyle }}
    >
      <Icon
        style={{
          width: iconPx,
          height: iconPx,
          animation: isConnecting ? "ch-pulse 1.5s ease-in-out infinite" : undefined,
        }}
      />
      {isConnecting && (
        <span
          className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-card text-foreground ring-1 ring-border"
          style={{ width: Math.max(12, Math.round(px * 0.32)), height: Math.max(12, Math.round(px * 0.32)) }}
        >
          <Loader2 className="animate-spin" style={{ width: iconPx * 0.55, height: iconPx * 0.55 }} />
        </span>
      )}
    </span>
  );
}
