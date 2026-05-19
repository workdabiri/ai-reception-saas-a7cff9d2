/**
 * Unified Pill — single source of truth for state/status/role indicators.
 *
 * Golden Contrast Rule (Constitution III):
 *   Soft variants ALWAYS use foreground text. Accent color lives ONLY in
 *   the dot, icon, or border — never in the text. Solid variants are the
 *   sole exception and use the variant's *-foreground inverse.
 *
 * For channel IDENTITY use <ChannelBadge> / <ChannelIcon> instead — this
 * component is for semantic state (status, priority, role, result, etc).
 *
 * Device-agnostic: identical rendering on mobile, tablet and desktop.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export type PillVariant =
  | "info"
  | "success"
  | "warn"
  | "destructive"
  | "primary"
  | "ai"
  | "operator"
  | "muted"
  | "neutral";

export type PillAppearance = "soft" | "solid";
export type PillSize = "sm" | "md";

/**
 * Per-variant token map. `accent` is a CSS color expression resolved against
 * the project's semantic tokens defined in src/styles.css.
 */
const ACCENT: Record<PillVariant, string> = {
  info: "var(--info)",
  success: "var(--success)",
  warn: "var(--warning)",
  destructive: "var(--destructive)",
  primary: "var(--primary)",
  ai: "var(--ai)",
  operator: "var(--operator, var(--primary))",
  muted: "var(--muted-foreground)",
  neutral: "var(--muted-foreground)",
};

const SOLID_FG: Record<PillVariant, string> = {
  info: "var(--info-foreground, white)",
  success: "var(--success-foreground, white)",
  warn: "var(--warning-foreground, white)",
  destructive: "var(--destructive-foreground)",
  primary: "var(--primary-foreground)",
  ai: "var(--ai-foreground, white)",
  operator: "var(--primary-foreground)",
  muted: "var(--foreground)",
  neutral: "var(--foreground)",
};

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: PillVariant;
  appearance?: PillAppearance;
  size?: PillSize;
  /** Show the leading accent dot. Default: true for soft, false for solid. */
  showDot?: boolean;
  /** Optional icon — replaces the dot when provided. */
  icon?: React.ReactNode;
}

export const Pill = React.forwardRef<HTMLSpanElement, PillProps>(function Pill(
  {
    variant = "neutral",
    appearance = "soft",
    size = "sm",
    showDot,
    icon,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const accent = ACCENT[variant];
  const isSolid = appearance === "solid";
  const muted = variant === "muted";

  const dotVisible = (showDot ?? !isSolid) && !icon;

  const sizeCls =
    size === "md"
      ? "h-7 px-2.5 text-[12px] gap-1.5 rounded-md"
      : "h-6 px-2 text-[11px] gap-1.5 rounded-md";

  const computedStyle: React.CSSProperties = isSolid
    ? {
        background: accent,
        color: SOLID_FG[variant],
        border: "0.5px solid transparent",
      }
    : {
        background: muted ? "var(--muted)" : `color-mix(in oklab, ${accent} 13%, transparent)`,
        color: muted ? "var(--muted-foreground)" : "var(--foreground)",
        border: `0.5px solid color-mix(in oklab, ${accent} 28%, transparent)`,
      };

  return (
    <span
      ref={ref}
      data-pill-variant={variant}
      data-pill-appearance={appearance}
      className={cn(
        "inline-flex items-center font-medium align-middle whitespace-nowrap",
        sizeCls,
        className,
      )}
      style={{ ...computedStyle, ...style }}
      {...rest}
    >
      {icon ? (
        <span
          className="inline-flex shrink-0 items-center justify-center"
          style={{ color: isSolid ? "currentColor" : accent, width: 12, height: 12 }}
        >
          {icon}
        </span>
      ) : dotVisible ? (
        <span
          aria-hidden
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: isSolid ? "currentColor" : accent }}
        />
      ) : null}
      {children}
    </span>
  );
});
