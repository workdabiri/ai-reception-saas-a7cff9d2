// Small UI helpers reused across Platform Admin pages.
// Visual tokens only — no new design.

import type { ReactNode } from "react";
import { Pill, type PillVariant } from "@/components/ui/pill";
import type {
  AdminStatus,
  UsageStatus,
  RiskLevel,
  ProviderStatus,
  AdminAuditResult,
  SupportPriority,
  SupportStatus,
} from "@/lib/admin-mock-data";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div className="min-w-0">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Platform Admin
        </p>
        <h1 className="text-[24px] font-medium tracking-tight leading-tight">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function AdminMockNotice() {
  return (
    <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
      <p className="text-[12.5px] font-medium text-foreground">
        Internal mock admin surface — read-only prototype.
      </p>
      <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
        No real customer data. Admin actions are mock-only — no tenant data is changed.
      </p>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "warn" | "info" | "success";
}) {
  const ring =
    tone === "warn"
      ? "ring-warning/30"
      : tone === "info"
        ? "ring-info/25"
        : tone === "success"
          ? "ring-success/25"
          : "ring-border";
  return (
    <div className={`rounded-xl bg-surface px-4 py-4 shadow-soft ring-1 ring-inset ${ring}`}>
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-[22px] font-medium leading-tight text-foreground tracking-tight">
        {value}
      </div>
      {hint && <div className="mt-1 text-[11.5px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-soft">
      <header className="flex flex-wrap items-end justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-[14px] font-medium text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function BusinessStatusPill({ status }: { status: AdminStatus }) {
  const map: Record<AdminStatus, { variant: PillVariant; label: string }> = {
    active: { variant: "success", label: "Active" },
    trial: { variant: "info", label: "Trial" },
    suspended: { variant: "destructive", label: "Suspended" },
    invited: { variant: "muted", label: "Invited" },
  };
  const { variant, label } = map[status];
  return <Pill variant={variant}>{label}</Pill>;
}

export function UsageStatusPill({ status }: { status: UsageStatus }) {
  const map: Record<UsageStatus, { variant: PillVariant; label: string }> = {
    healthy: { variant: "success", label: "Healthy" },
    approaching: { variant: "warn", label: "Approaching" },
    over: { variant: "destructive", label: "Over quota" },
  };
  const { variant, label } = map[status];
  return <Pill variant={variant}>{label}</Pill>;
}

export function RiskPill({ level }: { level: RiskLevel }) {
  const map: Record<RiskLevel, { variant: PillVariant; label: string }> = {
    low: { variant: "neutral", label: "Low risk" },
    medium: { variant: "warn", label: "Medium risk" },
    high: { variant: "destructive", label: "High risk" },
  };
  const { variant, label } = map[level];
  return <Pill variant={variant}>{label}</Pill>;
}

export function ProviderStatusPill({ status }: { status: ProviderStatus }) {
  if (status === "mock-active") {
    return <Pill variant="success">Mock Active</Pill>;
  }
  if (status === "planned") {
    return <Pill variant="muted">Planned</Pill>;
  }
  return <Pill variant="muted">Future</Pill>;
}

export function AuditResultPill({ result }: { result: AdminAuditResult }) {
  const map: Record<AdminAuditResult, { variant: PillVariant; label: string }> = {
    success: { variant: "success", label: "Success" },
    denied: { variant: "destructive", label: "Denied" },
    failed: { variant: "warn", label: "Failed" },
    mock: { variant: "muted", label: "Mock" },
  };
  const { variant, label } = map[result];
  return <Pill variant={variant}>{label}</Pill>;
}

export function SupportPriorityPill({ priority }: { priority: SupportPriority }) {
  const map: Record<SupportPriority, { variant: PillVariant; label: string }> = {
    low: { variant: "neutral", label: "Low" },
    normal: { variant: "neutral", label: "Normal" },
    high: { variant: "warn", label: "High" },
    urgent: { variant: "destructive", label: "Urgent" },
  };
  const { variant, label } = map[priority];
  return <Pill variant={variant}>{label}</Pill>;
}

export function SupportStatusPill({ status }: { status: SupportStatus }) {
  const map: Record<SupportStatus, { variant: PillVariant; label: string }> = {
    open: { variant: "info", label: "Open" },
    waiting: { variant: "warn", label: "Waiting" },
    resolved: { variant: "success", label: "Resolved" },
  };
  const { variant, label } = map[status];
  return <Pill variant={variant}>{label}</Pill>;
}

export function DisabledMockButton({
  children,
  hint = "Mock only",
  destructive,
}: {
  children: ReactNode;
  hint?: string;
  destructive?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled
        className={[
          "inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium opacity-70",
          destructive
            ? "border-destructive/30 bg-destructive/5 text-foreground"
            : "border-border bg-surface text-foreground",
        ].join(" ")}
      >
        {children}
      </button>
      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wider text-muted-foreground ring-1 ring-inset ring-border">
        {hint}
      </span>
    </span>
  );
}

export function ProgressBar({
  pct,
  tone,
}: {
  pct: number;
  tone?: "warn" | "destructive" | "success";
}) {
  const clamped = Math.min(150, Math.max(0, pct));
  const width = Math.min(100, clamped);
  const bar =
    tone === "destructive"
      ? "bg-destructive"
      : tone === "warn"
        ? "bg-warning"
        : tone === "success"
          ? "bg-success"
          : "bg-primary";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className={`h-full ${bar}`} style={{ width: `${width}%` }} />
    </div>
  );
}
