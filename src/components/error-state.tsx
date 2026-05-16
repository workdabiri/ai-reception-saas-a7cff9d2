// Reusable error state — paired primitive with EmptyState/LoadingSkeleton.
// Surfaces a recoverable failure with optional retry and technical detail.
import { AlertTriangle, RefreshCw, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type ErrorStateTone = "destructive" | "warning";

const toneStyles: Record<
  ErrorStateTone,
  { icon: string; ring: string; chip: string }
> = {
  destructive: {
    icon: "bg-destructive/10 text-destructive",
    ring: "ring-destructive/20",
    chip: "border-destructive/25 bg-destructive/5 text-destructive",
  },
  warning: {
    icon: "bg-warning/15 text-warning-foreground",
    ring: "ring-warning/30",
    chip: "border-warning/30 bg-warning/10 text-warning-foreground",
  },
};

export function ErrorState({
  icon: Icon = AlertTriangle,
  title = "Something went wrong",
  description = "We couldn't load this section. Try again — your data is safe.",
  tone = "destructive",
  badge,
  detail,
  onRetry,
  action,
  compact,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  tone?: ErrorStateTone;
  badge?: string;
  detail?: string;
  onRetry?: () => void;
  action?: ReactNode;
  compact?: boolean;
}) {
  const t = toneStyles[tone];
  return (
    <div
      className={`relative flex flex-col items-center text-center overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface to-surface-muted/40 ${
        compact ? "px-6 py-10" : "px-8 py-14"
      }`}
      role="alert"
    >
      <div
        className={`grid h-14 w-14 place-items-center rounded-2xl ring-8 ring-background shadow-soft ${t.icon} ${t.ring}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      {badge && (
        <span
          className={`mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide ${t.chip}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {badge}
        </span>
      )}
      <h3 className="mt-4 text-[17px] font-medium tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-soft hover:opacity-95"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        )}
        {action}
      </div>
      {detail && (
        <pre className="mt-5 max-w-md overflow-x-auto rounded-md border border-border bg-surface-muted px-3 py-2 text-left text-[11px] leading-snug text-muted-foreground/90">
          {detail}
        </pre>
      )}
    </div>
  );
}
