import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, MockBanner } from "@/components/ui-bits";
import {
  auditEvents,
  workspaces,
  type AuditEvent,
  type AuditActorType,
  type AuditResult,
} from "@/lib/mock-data";
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

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit log — AI Reception" },
      { name: "description", content: "Trustworthy record of every action taken in this workspace." },
    ],
  }),
  component: AuditPage,
});

const actorTypes: ("All" | AuditActorType)[] = ["All", "User", "System", "AI Receptionist"];
const results: ("All" | AuditResult)[] = ["All", "Success", "Denied", "Failed"];
const dateRanges = ["All time", "Today", "Last 7 days", "Last 30 days"] as const;

function AuditPage() {
  const [actorType, setActorType] = useState<(typeof actorTypes)[number]>("All");
  const [result, setResult] = useState<(typeof results)[number]>("All");
  const [actionFilter, setActionFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<(typeof dateRanges)[number]>("All time");
  const [workspace, setWorkspace] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(auditEvents[0]?.id ?? null);

  const allActions = useMemo(
    () => ["All", ...Array.from(new Set(auditEvents.map((e) => e.actionLabel)))],
    []
  );

  const filtered = useMemo(() => {
    return auditEvents.filter((e) => {
      if (actorType !== "All" && e.actorType !== actorType) return false;
      if (result !== "All" && e.result !== result) return false;
      if (actionFilter !== "All" && e.actionLabel !== actionFilter) return false;
      if (workspace !== "All" && e.workspace !== workspace) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !e.actor.toLowerCase().includes(q) &&
          !e.target.toLowerCase().includes(q) &&
          !e.actionLabel.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [actorType, result, actionFilter, workspace, query]);

  const selected = filtered.find((e) => e.id === selectedId) ?? filtered[0] ?? null;

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

        <MockBanner />

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
            <FilterSelect label="Actor" value={actorType} onChange={(v) => setActorType(v as typeof actorType)} options={actorTypes} />
            <FilterSelect label="Action" value={actionFilter} onChange={setActionFilter} options={allActions} />
            <FilterSelect label="Result" value={result} onChange={(v) => setResult(v as typeof result)} options={results} />
            <FilterSelect label="Date" value={dateRange} onChange={(v) => setDateRange(v as typeof dateRange)} options={dateRanges as readonly string[]} />
            <FilterSelect
              label="Workspace"
              value={workspace}
              onChange={setWorkspace}
              options={["All", ...workspaces.map((w) => w.name)]}
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
                    <th className="px-4 py-3 font-medium">Workspace</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Target</th>
                    <th className="px-4 py-3 font-medium">Result</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((e) => (
                    <tr
                      key={e.id}
                      onClick={() => setSelectedId(e.id)}
                      className={`cursor-pointer hover:bg-surface-muted/60 ${
                        selected?.id === e.id ? "bg-primary-soft/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground tabular-nums">{e.time}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ActorIcon type={e.actorType} />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{e.actor}</div>
                            <div className="text-[11px] text-muted-foreground">{e.actorType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{e.workspace}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium">
                          {e.actionLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground/90 max-w-[260px] truncate">{e.target}</td>
                      <td className="px-4 py-3">
                        <ResultBadge result={e.result} />
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        <button className="text-xs hover:text-foreground">Details</button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6">
                        <EmptyAuditState />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="sm:hidden divide-y divide-border">
              {filtered.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => setSelectedId(e.id)}
                    className={`flex w-full items-start gap-3 px-4 py-4 text-left transition ${
                      selected?.id === e.id ? "bg-primary-soft/30" : "hover:bg-surface-muted/60"
                    }`}
                  >
                    <ActorIcon type={e.actorType} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{e.actor}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">{e.time}</span>
                      </div>
                      <div className="mt-1 truncate text-[12px] text-muted-foreground">
                        {e.actionLabel} · {e.target}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <ResultBadge result={e.result} />
                        <span className="rounded-md border border-border bg-surface px-2 py-1 text-[10px] font-medium text-muted-foreground">
                          {e.workspace}
                        </span>
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
              Showing {filtered.length} of {auditEvents.length} mock events · Retention is a planned capability.
            </div>
          </div>

          {/* Detail panel */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            {selected ? (
              <DetailPanel event={selected} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 p-6 text-center text-sm text-muted-foreground">
                Select an event to view details.
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

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

function ActorIcon({ type }: { type: AuditActorType }) {
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

function ResultBadge({ result }: { result: AuditResult }) {
  const map = {
    Success: { Icon: ShieldCheck, cls: "border-success/20 bg-success/10 text-success" },
    Denied: { Icon: ShieldOff, cls: "border-destructive/20 bg-destructive/10 text-destructive" },
    Failed: { Icon: ShieldAlert, cls: "border-warning/30 bg-warning/15 text-warning-foreground" },
  } as const;
  const { Icon, cls } = map[result];
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium ${cls}`}>
      <Icon className="h-3 w-3" /> {result}
    </span>
  );
}

function DetailPanel({ event, onClose }: { event: AuditEvent; onClose: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Event</div>
          <div className="mt-1 text-sm font-medium">{event.actionLabel}</div>
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
          <ResultBadge result={event.result} />
        </DetailRow>
        <DetailRow label="Actor">
          <div className="flex items-center gap-2">
            <ActorIcon type={event.actorType} />
            <div>
              <div className="text-sm font-medium">{event.actor}</div>
              <div className="text-[11px] text-muted-foreground">{event.actorType}</div>
            </div>
          </div>
        </DetailRow>
        <DetailRow label="Workspace">
          <div className="inline-flex items-center gap-2 text-sm">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            {event.workspace}
          </div>
        </DetailRow>
        <DetailRow label="Target">
          <div className="text-sm text-foreground/90">{event.target}</div>
        </DetailRow>
        <DetailRow label="Timestamp">
          <div className="inline-flex items-center gap-2 text-sm tabular-nums text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> <span className="tabular-nums">{event.time}</span>
            <span className="text-[11px] opacity-70">· {event.iso}</span>
          </div>
        </DetailRow>
        <DetailRow label="Details">
          <p className="text-sm text-foreground/90">{event.details}</p>
        </DetailRow>
        <DetailRow label="Metadata">
          <div className="rounded-lg border border-border bg-surface-muted/60 p-3">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px]">
              {Object.entries(event.metadata).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="truncate text-foreground/90">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </DetailRow>
      </div>

      <div className="border-t border-border bg-surface-muted/40 px-5 py-3 text-[11px] text-muted-foreground">
        <Lock className="mr-1 inline h-3 w-3" />
        Audit entries are immutable in production. Mock data shown.
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

type SecVariant = "danger" | "warning" | "neutral";
const securityStates: { title: string; desc: string; Icon: typeof ShieldOff; variant: SecVariant }[] = [
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
    danger:  { bg: "var(--status-danger-soft)",  border: "var(--status-danger)",  icon: "var(--status-danger)" },
    warning: { bg: "var(--status-warning-soft)", border: "var(--status-warning)", icon: "var(--status-warning)" },
    neutral: { bg: "var(--status-neutral-soft)", border: "var(--status-neutral)", icon: "var(--status-neutral)" },
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
