import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui-bits";
import { useBusinessId } from "@/contexts/business-context";
import { useAuditEvents } from "@/hooks/use-audit-events";
import type { AuditActorType, AuditResult, AuditEvent, UserDisplayInfo } from "@/lib/api-types";
import {
  Download,
  Search,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Bot,
  Cog,
  User as UserIcon,
  X,
  Clock,
  Building2,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { EmptyAuditState } from "@/components/empty-states";
import {
  useStateParam,
  presets as statePresets,
  RouteStatePage,
  RouteSkeleton,
  StateBanner,
} from "@/components/route-state";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit log — AI Reception" },
      {
        name: "description",
        content: "Trustworthy record of every action taken in this workspace.",
      },
    ],
  }),
  component: AuditPage,
});

// ---------------------------------------------------------------------------
// Local display types (no mock-data dependency)
// ---------------------------------------------------------------------------

/** Display-layer actor type label. Normalised from API UPPERCASE enum. */
type DisplayActorType = "User" | "System" | "AI Receptionist";

/** Display-layer result label. Normalised from API UPPERCASE enum. */
type DisplayResult = "Success" | "Denied" | "Failed";

// ---------------------------------------------------------------------------
// Display normalisation helpers
// ---------------------------------------------------------------------------

function normaliseActorType(t: AuditActorType): DisplayActorType {
  const map: Record<AuditActorType, DisplayActorType> = {
    USER: "User",
    SYSTEM: "System",
    AI_RECEPTIONIST: "AI Receptionist",
  };
  return map[t];
}

function normaliseResult(r: AuditResult): DisplayResult {
  const map: Record<AuditResult, DisplayResult> = {
    SUCCESS: "Success",
    DENIED: "Denied",
    FAILED: "Failed",
  };
  return map[r];
}

/**
 * Derives a display label from the dot-notation action string.
 * "member.role_changed" → "Member role changed"
 */
function actionLabel(action: string): string {
  return action
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Composes a target description from targetType + targetId.
 * Shows type + first 8 chars of ID, or "—" when both are null.
 */
function targetLabel(targetType: string | null, targetId: string | null): string {
  if (!targetType && !targetId) return "—";
  const type = targetType ?? "entity";
  const id = targetId ? targetId.slice(0, 8) + "…" : "";
  return id ? `${type} / ${id}` : type;
}

/**
 * Actor display label. Shows role label for non-user actors;
 * prefers actorUser.name for USER actors, falls back to truncated actorUserId.
 */
function actorLabel(
  actorType: AuditActorType,
  actorUserId: string | null,
  actorUser?: UserDisplayInfo,
): string {
  if (actorType === "SYSTEM") return "System";
  if (actorType === "AI_RECEPTIONIST") return "AI Receptionist";
  // USER — prefer resolved name; fall back to truncated UUID
  if (actorUser?.name) return actorUser.name;
  return actorUserId ? actorUserId.slice(0, 8) + "\u2026" : "Unknown user";
}

/**
 * Format an ISO timestamp for the table (compact) and detail panel (full).
 */
function formatTimestamp(iso: string): { compact: string; full: string } {
  try {
    const d = new Date(iso);
    const compact = d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const full = d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return { compact, full };
  } catch {
    return { compact: "—", full: iso };
  }
}

/**
 * Returns true if the event's createdAt falls within the date range.
 */
function matchesDateRange(
  createdAt: string,
  range: "All time" | "Today" | "Last 7 days" | "Last 30 days",
): boolean {
  if (range === "All time") return true;
  const now = Date.now();
  const ts = new Date(createdAt).getTime();
  const dayMs = 86_400_000;
  if (range === "Today") return now - ts < dayMs;
  if (range === "Last 7 days") return now - ts < 7 * dayMs;
  if (range === "Last 30 days") return now - ts < 30 * dayMs;
  return true;
}

// ---------------------------------------------------------------------------
// Row type — derived from API shape (no name/email/workspace)
// ---------------------------------------------------------------------------

type Row = {
  id: string;
  compactTime: string;
  fullTime: string;
  iso: string;
  actorLabel: string;
  /** True when actorLabel is a real name (not a UUID fallback) — controls font rendering. */
  isUserWithName: boolean;
  displayActorType: DisplayActorType;
  actionRaw: string;
  actionDisplay: string;
  targetDisplay: string;
  displayResult: DisplayResult;
  metadata: AuditEvent["metadata"];
};

function toRow(e: AuditEvent): Row {
  const { compact, full } = formatTimestamp(e.createdAt);
  return {
    id: e.id,
    compactTime: compact,
    fullTime: full,
    iso: e.createdAt,
    actorLabel: actorLabel(e.actorType, e.actorUserId, e.actorUser),
    isUserWithName: e.actorType === "USER" && !!e.actorUser?.name,
    displayActorType: normaliseActorType(e.actorType),
    actionRaw: e.action,
    actionDisplay: actionLabel(e.action),
    targetDisplay: targetLabel(e.targetType, e.targetId),
    displayResult: normaliseResult(e.result),
    metadata: e.metadata,
  };
}

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

const actorTypes: ("All" | DisplayActorType)[] = ["All", "User", "System", "AI Receptionist"];
const results: ("All" | DisplayResult)[] = ["All", "Success", "Denied", "Failed"];
const dateRanges = ["All time", "Today", "Last 7 days", "Last 30 days"] as const;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

function AuditPage() {
  const stateOverride = useStateParam();
  const businessId = useBusinessId();

  // Fetch real audit events — disabled until businessId is available.
  const { data: events, isLoading, error } = useAuditEvents(businessId);

  // Map to display rows
  const rows: Row[] = useMemo(() => (events ?? []).map(toRow), [events]);

  // Client-side filter state
  const [actorType, setActorType] = useState<(typeof actorTypes)[number]>("All");
  const [result, setResult] = useState<(typeof results)[number]>("All");
  const [dateRange, setDateRange] = useState<(typeof dateRanges)[number]>("All time");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Derive action options from real data
  const allActions = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.actionDisplay)))],
    [rows],
  );
  const [actionFilter, setActionFilter] = useState<string>("All");

  // Apply client-side filters
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (actorType !== "All" && r.displayActorType !== actorType) return false;
      if (result !== "All" && r.displayResult !== result) return false;
      if (actionFilter !== "All" && r.actionDisplay !== actionFilter) return false;
      if (!matchesDateRange(r.iso, dateRange)) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !r.actorLabel.toLowerCase().includes(q) &&
          !r.actionDisplay.toLowerCase().includes(q) &&
          !r.targetDisplay.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [rows, actorType, result, actionFilter, dateRange, query]);

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  // Dev-state overrides
  if (stateOverride === "empty") {
    return (
      <RouteStatePage title="Audit log" description="Workspace activity & security events.">
        {statePresets.auditEmpty()}
      </RouteStatePage>
    );
  }
  if (stateOverride === "access-denied") {
    return <RouteStatePage title="Audit log">{statePresets.auditAccessDenied()}</RouteStatePage>;
  }
  if (stateOverride === "error") {
    return <RouteStatePage title="Audit log">{statePresets.auditError()}</RouteStatePage>;
  }
  if (stateOverride === "loading") {
    return (
      <RouteStatePage title="Audit log" description="Loading audit events…">
        <RouteSkeleton variant="table" />
      </RouteStatePage>
    );
  }

  // No businessId — VITE_DEV_BUSINESS_ID not set
  if (!businessId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 space-y-6">
        <PageHeader
          title="Audit log"
          description="A trustworthy record of who did what, where, and what the server allowed."
        />
        <StateBanner
          icon={AlertTriangle}
          tone="warning"
          title="No business configured"
          description="Set VITE_DEV_BUSINESS_ID in your .env.local file to load audit events."
        />
      </div>
    );
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <RouteStatePage title="Audit log" description="Loading audit events…">
        <RouteSkeleton variant="table" />
      </RouteStatePage>
    );
  }

  // Error states
  if (error) {
    const e = error as { isForbidden?: boolean; isUnauthenticated?: boolean };
    if (e.isUnauthenticated) {
      return (
        <RouteStatePage title="Audit log">{statePresets.profileSessionExpired()}</RouteStatePage>
      );
    }
    if (e.isForbidden) {
      return <RouteStatePage title="Audit log">{statePresets.auditAccessDenied()}</RouteStatePage>;
    }
    return <RouteStatePage title="Audit log">{statePresets.auditError()}</RouteStatePage>;
  }

  // Empty state
  if (rows.length === 0) {
    return (
      <RouteStatePage title="Audit log" description="Workspace activity & security events.">
        {statePresets.auditEmpty()}
      </RouteStatePage>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 space-y-6">
        <PageHeader
          title="Audit log"
          description="A trustworthy record of who did what, where, and what the server allowed."
          action={
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-secondary">
              <Download className="h-3.5 w-3.5" /> Export (mock)
            </button>
          }
        />

        {/* Security states strip */}
        <SecurityStatesStrip />

        {/* Filters */}
        <div className="rounded-xl border border-border bg-card p-3 shadow-soft">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search actor, action, target…"
                className="h-9 w-full rounded-lg border border-input bg-surface pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <FilterSelect
              label="Actor"
              value={actorType}
              onChange={(v) => setActorType(v as typeof actorType)}
              options={actorTypes}
            />
            <FilterSelect
              label="Action"
              value={actionFilter}
              onChange={setActionFilter}
              options={allActions}
            />
            <FilterSelect
              label="Result"
              value={result}
              onChange={(v) => setResult(v as typeof result)}
              options={results}
            />
            <FilterSelect
              label="Date"
              value={dateRange}
              onChange={(v) => setDateRange(v as typeof dateRange)}
              options={dateRanges as readonly string[]}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Table (desktop/tablet) + cards (mobile) */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden min-w-0">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Actor</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Target</th>
                    <th className="px-4 py-3 font-medium">Result</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className={`cursor-pointer hover:bg-surface-muted/60 ${
                        selected?.id === r.id ? "bg-primary-soft/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground tabular-nums">
                        {r.compactTime}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ActorIcon type={r.displayActorType} />
                          <div className="min-w-0">
                            {/* Prefer actorUser.name when available; fall back to truncated UUID */}
                            <div
                              className={`font-medium truncate text-[11px] ${r.isUserWithName ? "" : "font-mono"}`}
                            >
                              {r.actorLabel}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {r.displayActorType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium">
                          {r.actionDisplay}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground/90 max-w-[260px] truncate font-mono text-[11px]">
                        {r.targetDisplay}
                      </td>
                      <td className="px-4 py-3">
                        <ResultBadge result={r.displayResult} />
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        <button className="text-xs hover:text-foreground">Details</button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6">
                        <EmptyAuditState />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="sm:hidden divide-y divide-border">
              {filtered.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => {
                      setSelectedId(r.id);
                      setMobileDetailOpen(true);
                    }}
                    className={`flex w-full items-start gap-3 px-4 py-4 text-left transition ${
                      selected?.id === r.id ? "bg-primary-soft/30" : "hover:bg-surface-muted/60"
                    }`}
                  >
                    <ActorIcon type={r.displayActorType} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-[11px] font-medium ${r.isUserWithName ? "" : "font-mono"}`}
                        >
                          {r.actorLabel}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                          {r.compactTime}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-[12px] text-muted-foreground">
                        {r.actionDisplay} · {r.targetDisplay}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {r.displayActorType}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <ResultBadge result={r.displayResult} />
                        <span className="text-[11px] font-medium text-primary">View details →</span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="p-6">
                  <EmptyAuditState />
                </li>
              )}
            </ul>

            <div className="border-t border-border bg-surface-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
              Showing {filtered.length} of {rows.length} events · Server-side retention applies.
            </div>
          </div>

          {/* Detail panel — tablet & desktop */}
          <aside className="hidden sm:block lg:sticky lg:top-6 lg:self-start">
            {selected ? (
              <DetailPanel row={selected} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 p-6 text-center text-sm text-muted-foreground">
                Select an event to view details.
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Mobile detail sheet */}
      <Sheet open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto p-0 sm:hidden">
          <SheetTitle className="sr-only">Audit event details</SheetTitle>
          {selected && <DetailPanel row={selected} onClose={() => setMobileDetailOpen(false)} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-medium focus:outline-none"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function ActorIcon({ type }: { type: DisplayActorType }) {
  const map = {
    User: { Icon: UserIcon, cls: "bg-secondary text-secondary-foreground" },
    System: { Icon: Cog, cls: "bg-muted text-muted-foreground" },
    "AI Receptionist": { Icon: Bot, cls: "bg-primary-soft text-primary" },
  } as const;
  const { Icon, cls } = map[type];
  return (
    <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

function ResultBadge({ result }: { result: DisplayResult }) {
  const map = {
    Success: {
      Icon: ShieldCheck,
      cls: "border-success/20 bg-success/10 text-foreground",
      icon: "text-success",
    },
    Denied: {
      Icon: ShieldOff,
      cls: "border-destructive/20 bg-destructive/10 text-foreground",
      icon: "text-destructive",
    },
    Failed: {
      Icon: ShieldAlert,
      cls: "border-warning/30 bg-warning/15 text-foreground",
      icon: "text-warning",
    },
  } as const;
  const { Icon, cls, icon } = map[result];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium ${cls}`}
    >
      <Icon className={`h-3 w-3 ${icon}`} /> {result}
    </span>
  );
}

function DetailPanel({ row, onClose }: { row: Row; onClose: () => void }) {
  const metadataStr = useMemo(() => {
    if (row.metadata === null || row.metadata === undefined) return null;
    try {
      return JSON.stringify(row.metadata, null, 2);
    } catch {
      return String(row.metadata);
    }
  }, [row.metadata]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Event</div>
          <div className="mt-1 text-sm font-medium">{row.actionDisplay}</div>
        </div>
        <button
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-4 px-5 py-4">
        <DetailRow label="Result">
          <ResultBadge result={row.displayResult} />
        </DetailRow>
        <DetailRow label="Actor">
          <div className="flex items-center gap-2">
            <ActorIcon type={row.displayActorType} />
            <div>
              {/* Prefer actorUser.name when available; fall back to truncated UUID */}
              <div className={`text-[11px] font-medium ${row.isUserWithName ? "" : "font-mono"}`}>
                {row.actorLabel}
              </div>
              <div className="text-[11px] text-muted-foreground">{row.displayActorType}</div>
            </div>
          </div>
        </DetailRow>
        <DetailRow label="Action">
          <div className="font-mono text-[11px] text-foreground/90">{row.actionRaw}</div>
        </DetailRow>
        <DetailRow label="Target">
          <div className="font-mono text-[11px] text-foreground/90">{row.targetDisplay}</div>
        </DetailRow>
        <DetailRow label="Timestamp">
          <div className="inline-flex items-center gap-2 text-sm tabular-nums text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="tabular-nums">{row.fullTime}</span>
          </div>
        </DetailRow>
        {metadataStr && (
          <DetailRow label="Metadata">
            <div className="rounded-lg border border-border bg-surface-muted/60 p-3">
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-foreground/90 break-all">
                {metadataStr}
              </pre>
            </div>
          </DetailRow>
        )}
      </div>

      <div className="border-t border-border bg-surface-muted/40 px-5 py-3 text-[11px] text-muted-foreground">
        <Lock className="mr-1 inline h-3 w-3" />
        Audit entries are immutable. Server is the source of truth.
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

type SecVariant = "danger" | "warning" | "neutral";
const securityStates: {
  title: string;
  desc: string;
  Icon: typeof ShieldOff;
  variant: SecVariant;
}[] = [
  {
    title: "Access denied",
    desc: "Server-side membership check rejected the request.",
    Icon: ShieldOff,
    variant: "danger",
  },
  {
    title: "No active workspace",
    desc: "User has no workspace selected — feature areas remain hidden.",
    Icon: Building2,
    variant: "neutral",
  },
  {
    title: "Removed member",
    desc: "Lost access immediately. Sessions invalidated on next request.",
    Icon: UserIcon,
    variant: "danger",
  },
  {
    title: "Expired session",
    desc: "Operator must re-authenticate before any tenant-scoped action.",
    Icon: Clock,
    variant: "warning",
  },
  {
    title: "Cross-workspace blocked",
    desc: "Server prevented data access across tenant boundaries.",
    Icon: AlertTriangle,
    variant: "warning",
  },
];

function SecurityStatesStrip() {
  const variantToken: Record<SecVariant, { bg: string; border: string; icon: string }> = {
    danger: {
      bg: "var(--status-danger-soft)",
      border: "var(--status-danger)",
      icon: "var(--status-danger)",
    },
    warning: {
      bg: "var(--status-warning-soft)",
      border: "var(--status-warning)",
      icon: "var(--status-warning)",
    },
    neutral: {
      bg: "var(--status-neutral-soft)",
      border: "var(--status-neutral)",
      icon: "var(--status-neutral)",
    },
  };
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> Security states (preview)
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {securityStates.map((s) => {
          const Icon = s.Icon;
          const v = variantToken[s.variant];
          return (
            <div
              key={s.title}
              className="rounded-lg p-3"
              style={{
                background: v.bg,
                border: `0.5px solid ${v.border}`,
                borderLeft: `3px solid ${v.border}`,
              }}
            >
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                <Icon className="h-3.5 w-3.5" style={{ color: v.icon }} /> {s.title}
              </div>
              <p className="mt-1 text-[12px] leading-[1.5] text-muted-foreground">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
