// Reusable error state — paired primitive with EmptyState/LoadingSkeleton.
// Unified calm template: 56px icon tile, centered text, primary "Try again".
import { AlertTriangle, RefreshCw, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type ErrorStateTone = "destructive" | "warning";

const toneStyles: Record<
  ErrorStateTone,
  { tile: string; icon: string; chip: string }
> = {
  destructive: {
    tile: "bg-destructive/10",
    icon: "text-destructive",
    chip: "border-destructive/25 bg-destructive/10 text-foreground",
  },
  warning: {
    tile: "bg-warning/15",
    icon: "text-foreground",
    chip: "border-warning/30 bg-warning/10 text-foreground",
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
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  tone?: ErrorStateTone;
  badge?: string;
  detail?: string;
  onRetry?: () => void;
  action?: ReactNode;
  /** @deprecated padding is now uniform */
  compact?: boolean;
}) {
  const t = toneStyles[tone];
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-[360px] flex-col items-center px-6 py-16 text-center"
    >
      <div className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl ${t.tile}`}>
        <Icon strokeWidth={1.75} className={`h-7 w-7 ${t.icon}`} />
      </div>
      {badge && (
        <span
          className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide ${t.chip}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {badge}
        </span>
      )}
      <h3 className="mb-1.5 text-[16px] font-medium leading-tight text-foreground">{title}</h3>
      <p className="mb-5 text-[13px] leading-[1.5] text-muted-foreground">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground shadow-soft transition hover:opacity-95"
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

/** Inline form-field error: red border on the input + small message below.
 *  Wrap any input with `<InlineErrorField message="...">`, or compose manually
 *  by adding `border-destructive` to the input and rendering `<InlineErrorMessage />`. */
export function InlineErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div className="mt-1 flex items-center gap-1 text-[12px] text-destructive">
      <AlertTriangle className="h-3 w-3 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
