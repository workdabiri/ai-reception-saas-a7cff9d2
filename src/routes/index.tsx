import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Inbox,
  Timer,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  ArrowRight,
  Repeat2,
  Calendar,
  ChevronDown,
  Search,
  Filter,
  CircleDot,
  CheckCircle2,
  Clock3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Avatar, ChannelChip, MockBanner, StatusChip } from "@/components/ui-bits";
import { ChannelIcon } from "@/components/channel-icon";
import {
  channelLabel,
  todaysQueue,
  recentMessages,
  operatorLoad,
  draftQueue,
  channelOverview,
} from "@/lib/mock-data";
import { useBusinessContext } from "@/contexts/business-context";
import { useAuditEvents } from "@/hooks/use-audit-events";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Operations Command Center — AI Reception" },
      {
        name: "description",
        content:
          "Operator-first reception workspace. Review AI drafts, triage customer conversations, and monitor team workload.",
      },
    ],
  }),
  component: DashboardPage,
});

type Tone = "info" | "warning" | "attention" | "ai" | "danger" | "success" | "neutral";

type Stat = {
  label: string;
  value: string;
  hint: string;
  icon: typeof Inbox;
  tone: Tone;
  delta?: { value: string; dir: "up" | "down" | "flat" };
};

// Neutral-first KPIs: only states that *demand* attention carry a semantic
// tint. Operational counts (Open) stay fully neutral so the row reads as one
// premium card family, not five colorful tiles.
const stats: Stat[] = [
  {
    label: "Open conversations",
    value: "12",
    hint: "Across email & web chat",
    icon: Inbox,
    tone: "info",
    delta: { value: "+3", dir: "up" },
  },
  {
    label: "Waiting for operator",
    value: "4",
    hint: "Median wait 18m",
    icon: Timer,
    tone: "warning",
    delta: { value: "-1", dir: "down" },
  },
  {
    label: "Needs follow-up",
    value: "6",
    hint: "Older than 24h",
    icon: Repeat2,
    tone: "attention",
    delta: { value: "+2", dir: "up" },
  },
  {
    label: "Drafts pending review",
    value: "7",
    hint: "Human review required",
    icon: Sparkles,
    tone: "ai",
    delta: { value: "+4", dir: "up" },
  },
  {
    label: "Access alerts",
    value: "1",
    hint: "Blocked Viewer export",
    icon: ShieldAlert,
    tone: "danger",
    delta: { value: "0", dir: "flat" },
  },
];

// Icon-only wrappers: the variant text-* sets the icon's currentColor on a
// soft tinted tile; no body text is rendered inside. Exempt from the
// Golden Contrast Rule (which targets text-bearing pills).
/* eslint-disable local/no-pill-contrast-violation */
const iconTone: Record<Tone, string> = {
  neutral: "bg-secondary text-muted-foreground",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-foreground",
  attention: "bg-attention/10 text-foreground",
  ai: "bg-ai-soft text-ai",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
};
/* eslint-enable local/no-pill-contrast-violation */

const toneAccent: Record<Tone, string> = {
  neutral: "transparent",
  info: "var(--color-info)",
  warning: "var(--color-warning)",
  attention: "var(--color-attention)",
  ai: "var(--color-ai)",
  danger: "var(--color-destructive)",
  success: "var(--color-success)",
};

// ---------------------------------------------------------------------------
// Audit display helpers
// ---------------------------------------------------------------------------

/** Derives 2-char initials from actorType for the audit avatar. */
function auditActorInitials(actorType: string): string {
  if (actorType === "AI_RECEPTIONIST") return "AI";
  if (actorType === "SYSTEM") return "SY";
  return "US"; // USER
}

/**
 * Formats a raw action string (e.g. "member.invited") for display.
 * Capitalises the verb fragment and replaces dots with spaces.
 */
function formatAction(action: string): string {
  const parts = action.split(".");
  // e.g. "member.invited" → "member invited"
  return parts.join(" ");
}

/** Formats an ISO timestamp to a short local time string. */
function fmtAuditTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/** Parses an ISO timestamp to ms-since-epoch for sort comparisons. Returns 0 on invalid input. */
function auditTimeMs(iso: string): number {
  const value = Date.parse(iso);
  return Number.isFinite(value) ? value : 0;
}

const deltaStyles = {
  up: "text-foreground/80",
  down: "text-muted-foreground",
  flat: "text-muted-foreground",
};

function DashboardPage() {
  const { businessId, businesses } = useBusinessContext();
  const activeBusiness = businesses.find((b) => b.id === businessId) ?? businesses[0];
  const businessName = activeBusiness?.name;

  const {
    data: auditData,
    isLoading: auditLoading,
    error: auditError,
  } = useAuditEvents(businessId);

  // Whether the current user lacks audit.read (403 = OPERATOR or VIEWER)
  const auditForbidden = auditError?.isForbidden ?? false;

  // Latest 5 events for the dashboard panel, sorted defensively by createdAt.
  const recentAuditEvents = [...(auditData ?? [])]
    .sort((a, b) => auditTimeMs(b.createdAt) - auditTimeMs(a.createdAt))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8 space-y-6">
      {/* Command bar header — neutral, premium */}
      <header className="rounded-2xl border border-border bg-card shadow-xs dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-8 lg:py-4">
          <div className="min-w-0 flex items-center gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary ring-1 ring-primary/15">
              <CircleDot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-2 py-1 text-foreground ring-1 ring-inset ring-success/25">
                  <span className="live-indicator-dot !h-1.5 !w-1.5" />
                  Live
                </span>
                <span className="truncate text-foreground/80 font-medium">
                  {businessName ?? "—"}
                </span>
              </div>
              <h1 className="mt-1 truncate text-[20px] font-medium tracking-tight leading-tight text-foreground">
                Operations <span className="text-muted-foreground">Command Center</span>
              </h1>
              <p className="mt-1 hidden sm:block text-[13px] text-muted-foreground max-w-[480px] leading-relaxed">
                Triage AI-prepared drafts, monitor channel health, and keep every customer reply
                human-reviewed.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="hidden md:inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 h-9 text-[12px] font-medium text-foreground/80 hover:bg-secondary">
              <Calendar className="h-3.5 w-3.5" />
              Today
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
            <button className="hidden lg:inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 h-9 text-[12px] font-medium text-muted-foreground hover:bg-secondary">
              <Search className="h-3.5 w-3.5" />
              <span>Search…</span>
              <kbd className="ml-2 rounded border border-border bg-secondary px-1 py-1 text-[10px]">
                ⌘K
              </kbd>
            </button>
            <Link
              to="/channels"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 h-9 text-[12px] font-medium text-foreground/80 hover:bg-secondary"
            >
              Channels
            </Link>
            <Link
              to="/inbox"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 h-9 text-[12.5px] font-medium text-primary-foreground shadow-soft hover:bg-primary/90 active:translate-y-px"
            >
              Open inbox <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <MockBanner />

      {/* KPI row */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          const Trend =
            s.delta?.dir === "up" ? TrendingUp : s.delta?.dir === "down" ? TrendingDown : null;
          return (
            <div
              key={s.label}
              style={{ ["--kpi-accent" as never]: toneAccent[s.tone] }}
              className="kpi-accent group relative overflow-hidden rounded-xl bg-surface py-5 px-6 shadow-card transition hover:shadow-elev"
            >
              <div className="relative flex items-start justify-between gap-2">
                <span className="text-[10.5px] font-medium uppercase tracking-[0.10em] text-muted-foreground">
                  {s.label}
                </span>
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconTone[s.tone]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="relative mt-4 flex items-end justify-between gap-2">
                <div className="text-[32px] font-medium leading-none tabular-nums tracking-tight text-foreground">
                  {s.value}
                </div>
                {s.delta && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-medium tabular-nums ${deltaStyles[s.delta.dir]}`}
                  >
                    {Trend && <Trend className="h-3 w-3" />}
                    {s.delta.value}
                  </span>
                )}
              </div>
              <div className="relative mt-2 text-[12px] leading-snug text-muted-foreground truncate">
                {s.hint}
              </div>
            </div>
          );
        })}
      </section>

      {/* Today's queue + recent messages */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-medium tracking-tight">Today's attention queue</h2>
                <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground ring-1 ring-inset ring-border">
                  {todaysQueue.length} items
                </span>
              </div>
              <p className="text-[11.5px] text-muted-foreground">
                Triage in order — oldest waiting first.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[11.5px] font-medium text-foreground/80 hover:bg-secondary">
                <Filter className="h-3 w-3" /> Filter
              </button>
              <Link
                to="/inbox"
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
              >
                View inbox <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-surface-muted/60 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Customer</th>
                  <th className="px-3 py-3 text-left font-medium">Subject</th>
                  <th className="px-3 py-3 text-left font-medium">Channel</th>
                  <th className="px-3 py-3 text-left font-medium">Status</th>
                  <th className="px-3 py-3 text-left font-medium">Waiting</th>
                  <th className="px-5 py-3 text-left font-medium">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {todaysQueue.map((q) => (
                  <tr key={q.id} className="group transition hover:bg-surface-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={q.initials} size="sm" />
                        <span className="font-medium">{q.customer}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-foreground/80 max-w-[220px] truncate">
                      {q.subject}
                    </td>
                    <td className="px-3 py-3">
                      <ChannelChip channel={q.channel} label={channelLabel[q.channel]} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusChip status={q.status} />
                    </td>
                    <td className="px-3 py-3 text-muted-foreground font-mono-tab text-[12px]">
                      {q.waiting}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {q.assignee ?? <span className="italic text-foreground/80">Unassigned</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-xl border border-border bg-card shadow-card flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-[14px] font-medium">Recent messages</h2>
              <p className="text-[11.5px] text-muted-foreground">Latest inbound activity.</p>
            </div>
            <Link
              to="/inbox"
              className="text-[12px] font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="flex-1">
            {recentMessages.map((m) => (
              <li
                key={m.id}
                className="flex gap-3 px-4 py-3 border-b-[0.5px] border-border last:border-b-0 transition hover:bg-surface-hover cursor-pointer"
              >
                <Avatar initials={m.initials} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium text-foreground">
                      {m.customer}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground font-mono-tab">
                      {m.time}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground leading-[1.4]">
                    {m.snippet}
                  </p>
                  <div className="mt-1.5 inline-flex [&>span]:h-[18px] [&>span]:px-1.5 [&>span]:py-0 [&>span]:text-[10px] [&>span]:leading-[18px]">
                    <ChannelChip channel={m.channel} label={channelLabel[m.channel]} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Channel command center + AI drafts */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-primary">
                Channel command center
              </p>
              <h2 className="mt-1 text-[13px] font-medium tracking-tight">
                Where customers reach you
              </h2>
            </div>
            <Link
              to="/channels"
              className="text-[11.5px] font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              All sources <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-3 sm:p-4">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
            >
              {channelOverview.map((c) => {
                const active = c.status === "Mock Active";
                const planned = c.status === "Planned";
                const healthDot =
                  c.health === "healthy"
                    ? "bg-success"
                    : c.health === "degraded"
                      ? "bg-warning"
                      : c.health === "offline"
                        ? "bg-destructive"
                        : "bg-muted-foreground/40";
                return (
                  <Link
                    key={c.key}
                    to={active ? "/inbox" : "/channels"}
                    className={`group relative flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card ${active ? "border-border hover:border-primary/30" : "border-dashed border-border/80 bg-surface-muted/40"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`grid h-9 w-9 place-items-center rounded-lg ring-1 ring-inset ${active ? "bg-primary-soft ring-primary/15" : "bg-secondary ring-border"}`}
                      >
                        <ChannelIcon channel={c.key} size={20} />
                      </div>
                      {active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[9.5px] font-medium uppercase tracking-wider text-foreground ring-1 ring-success/25">
                          <span className={`h-1.5 w-1.5 rounded-full ${healthDot}`} /> Active
                        </span>
                      ) : (
                        <span
                          className={`rounded-full px-2 py-1 text-[9.5px] font-medium uppercase tracking-wider ring-1 ring-inset ${planned ? "bg-secondary text-muted-foreground ring-border" : "bg-surface-muted text-muted-foreground/70 ring-border"}`}
                        >
                          {c.status === "Future" ? "Future" : "Planned"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[13px] font-medium tracking-tight truncate">
                        {c.name}
                      </div>
                      {c.unread > 0 && (
                        <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground tabular-nums shadow-soft">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    {active ? (
                      <div className="grid grid-cols-3 gap-1 border-t border-border/70 pt-2 text-center">
                        <div>
                          <div className="text-[12px] font-medium tabular-nums">{c.customers}</div>
                          <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground">
                            Custs
                          </div>
                        </div>
                        <div>
                          <div
                            className={`text-[12px] font-medium tabular-nums ${c.waiting > 0 ? "text-foreground" : ""}`}
                          >
                            {c.waiting}
                          </div>
                          <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground">
                            Wait
                          </div>
                        </div>
                        <div>
                          <div
                            className="text-[10.5px] font-medium tabular-nums truncate"
                            title={c.lastMessage}
                          >
                            {c.lastMessage}
                          </div>
                          <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground">
                            Last
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-dashed border-border/70 pt-2 text-[10.5px] leading-snug text-muted-foreground/90">
                        {c.description}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary ring-1 ring-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="text-[13px] font-medium tracking-tight">AI draft review</h2>
                <p className="text-[11px] text-muted-foreground">Operator sends every reply.</p>
              </div>
            </div>
            <span className="rounded-md border border-primary/20 bg-primary-soft px-2 py-1 text-[10px] font-medium text-primary uppercase tracking-wider">
              Human review
            </span>
          </div>
          <ul className="divide-y divide-border">
            {draftQueue.map((d) => (
              <li key={d.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <Avatar initials={d.initials} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium truncate">{d.customer}</span>
                      <span className="text-[10.5px] text-muted-foreground tabular-nums shrink-0">
                        {d.prepared}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-muted-foreground truncate">{d.subject}</div>
                    <div className="mt-2 rounded-lg border border-dashed border-primary/25 bg-primary-soft/40 p-3 text-[12px] leading-snug text-foreground/90 line-clamp-2">
                      {d.draft}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10.5px]">
                      <span className="text-muted-foreground">
                        Confidence:{" "}
                        <span className="font-medium text-foreground/80">{d.confidence}</span>
                      </span>
                      <Link
                        to="/inbox"
                        className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Review & send <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Operator workload + Audit + Planned */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-[13px] font-medium tracking-tight">Operator workload</h2>
            <p className="text-[11.5px] text-muted-foreground">Today's distribution.</p>
          </div>
          <ul className="divide-y divide-border">
            {operatorLoad.map((op) => {
              const total = op.open + op.drafts + op.resolvedToday;
              const openPct = (op.open / total) * 100;
              const draftPct = (op.drafts / total) * 100;
              const resPct = (op.resolvedToday / total) * 100;
              return (
                <li key={op.id} className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={op.initials} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-medium">{op.name}</span>
                        <span className="rounded-md border border-border bg-surface px-2 py-1 text-[9.5px] font-medium uppercase tracking-wider text-muted-foreground">
                          {op.role}
                        </span>
                      </div>
                      <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                        <div className="bg-warning" style={{ width: `${openPct}%` }} />
                        <div className="bg-primary" style={{ width: `${draftPct}%` }} />
                        <div className="bg-success" style={{ width: `${resPct}%` }} />
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-[10.5px] text-muted-foreground tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-2.5 w-2.5" />
                          <span className="font-medium text-foreground">{op.open}</span> open
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" />
                          <span className="font-medium text-foreground">{op.drafts}</span> drafts
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span className="font-medium text-foreground">
                            {op.resolvedToday}
                          </span>{" "}
                          done
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-4 rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-[13px] font-medium tracking-tight">Trust &amp; access</h2>
              <p className="text-[11.5px] text-muted-foreground">Recent audit activity.</p>
            </div>
            <Link
              to="/audit"
              className="text-[11.5px] font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              Full log <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Permission gate: OPERATOR + VIEWER lack audit.read */}
          {auditForbidden ? (
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary ring-1 ring-border">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-[12px] font-medium text-foreground">Audit log restricted</p>
              <p className="text-[11px] text-muted-foreground max-w-[180px] leading-relaxed">
                Audit access requires Owner or Admin role.
              </p>
            </div>
          ) : auditLoading ? (
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="h-7 w-7 rounded-full bg-secondary animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 w-3/4 rounded bg-secondary animate-pulse" />
                    <div className="h-2 w-1/2 rounded bg-secondary animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentAuditEvents.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-muted-foreground">
              No audit events yet.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentAuditEvents.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-medium text-secondary-foreground ring-1 ring-border">
                    {auditActorInitials(e.actorType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] truncate">
                      <span className="font-medium">
                        {e.actorType === "AI_RECEPTIONIST"
                          ? "AI Receptionist"
                          : e.actorType === "SYSTEM"
                            ? "System"
                            : "User"}
                      </span>{" "}
                      <span className="text-muted-foreground">{formatAction(e.action)}</span>
                    </div>
                    <div className="text-[10.5px] text-muted-foreground tabular-nums">
                      {fmtAuditTime(e.createdAt)}
                    </div>
                  </div>
                  <StatusChip
                    status={
                      e.result === "DENIED" || e.result === "FAILED" ? "access-denied" : "open"
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3 rounded-xl border border-border bg-card shadow-card p-5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-[13px] font-medium tracking-tight">Planned capabilities</h3>
              <p className="text-[11px] text-muted-foreground">Roadmap.</p>
            </div>
          </div>
          <ul className="mt-3 space-y-2 text-[12px]">
            {[
              "WhatsApp channel",
              "SMS channel",
              "Voice reception",
              "Realtime live chat",
              "Billing & subscriptions",
            ].map((p) => (
              <li
                key={p}
                className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2"
              >
                <span className="truncate">{p}</span>
                <StatusChip status="future" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
