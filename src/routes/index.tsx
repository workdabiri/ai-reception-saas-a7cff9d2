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
import {
  Avatar,
  ChannelChip,
  MockBanner,
  StatusChip,
} from "@/components/ui-bits";
import { ChannelIcon } from "@/components/channel-icon";
import {
  channelLabel,
  todaysQueue,
  recentMessages,
  operatorLoad,
  draftQueue,
  auditEvents,
  currentWorkspace,
  channelOverview,
} from "@/lib/mock-data";

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

const stats: Stat[] = [
  { label: "Open conversations", value: "12", hint: "Across email & web chat", icon: Inbox, tone: "info", delta: { value: "+3", dir: "up" } },
  { label: "Waiting for operator", value: "4", hint: "Median wait 18m", icon: Timer, tone: "warning", delta: { value: "-1", dir: "down" } },
  { label: "Needs follow-up", value: "6", hint: "Older than 24h", icon: Repeat2, tone: "attention", delta: { value: "+2", dir: "up" } },
  { label: "Drafts pending review", value: "7", hint: "Human review required", icon: Sparkles, tone: "ai", delta: { value: "+4", dir: "up" } },
  { label: "Access alerts", value: "1", hint: "Blocked Viewer export", icon: ShieldAlert, tone: "danger", delta: { value: "0", dir: "flat" } },
];

const toneStyles: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground ring-border",
  info: "bg-info/12 text-info ring-info/25",
  warning: "bg-warning/15 text-warning-foreground ring-warning/30",
  attention: "bg-attention/12 text-attention ring-attention/25",
  ai: "bg-ai/12 text-ai ring-ai/25",
  danger: "bg-destructive/10 text-destructive ring-destructive/25",
  success: "bg-success/10 text-success ring-success/25",
};

const toneAccent: Record<Tone, string> = {
  neutral: "var(--color-border-strong)",
  info: "var(--color-info)",
  warning: "var(--color-warning)",
  attention: "var(--color-attention)",
  ai: "var(--color-ai)",
  danger: "var(--color-destructive)",
  success: "var(--color-success)",
};

const deltaStyles = {
  up: "text-success bg-success/10 ring-1 ring-inset ring-success/20",
  down: "text-attention bg-attention/10 ring-1 ring-inset ring-attention/25",
  flat: "text-muted-foreground bg-secondary ring-1 ring-inset ring-border",
};

function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8 space-y-6">
      {/* Command bar header — calm, premium */}
      <header className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div
          className="absolute inset-0 opacity-90"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(135deg, oklch(0.465 0.205 268) 0%, oklch(0.42 0.18 282) 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 grid-noise opacity-[0.05]" aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-8 lg:py-6">
          <div className="min-w-0 flex items-center gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/12 text-white ring-1 ring-white/20">
              <CircleDot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-medium text-white/85">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2 py-0.5 ring-1 ring-white/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Live
                </span>
                <span className="truncate">{currentWorkspace.name}</span>
                <span aria-hidden className="opacity-60">·</span>
                <span className="opacity-90">{currentWorkspace.role}</span>
              </div>
              <h1 className="mt-1.5 truncate text-[22px] lg:text-[26px] font-semibold tracking-tight leading-tight text-white">
                Operations <span className="text-white/80">Command Center</span>
              </h1>
              <p className="mt-1 hidden sm:block text-[12.5px] text-white/70 max-w-xl">
                Triage AI-prepared drafts, monitor channel health, and keep every customer reply human-reviewed.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="hidden md:inline-flex items-center gap-2 rounded-lg bg-white/10 ring-1 ring-white/20 px-3 py-2 text-[12px] font-medium text-white hover:bg-white/15">
              <Calendar className="h-3.5 w-3.5" />
              Today
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
            <button className="hidden lg:inline-flex items-center gap-2 rounded-lg bg-white/10 ring-1 ring-white/20 px-3 py-2 text-[12px] font-medium text-white/90 hover:bg-white/15">
              <Search className="h-3.5 w-3.5" />
              <span className="opacity-80">Search…</span>
              <kbd className="ml-2 rounded border border-white/25 bg-white/10 px-1 py-0.5 text-[10px]">⌘K</kbd>
            </button>
            <Link
              to="/channels"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 ring-1 ring-white/20 px-3 py-2 text-[12px] font-medium text-white hover:bg-white/15"
            >
              Channels
            </Link>
            <Link
              to="/inbox"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[12.5px] font-semibold text-primary shadow-soft hover:bg-white/95 active:translate-y-px"
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
          const Trend = s.delta?.dir === "up" ? TrendingUp : s.delta?.dir === "down" ? TrendingDown : null;
          return (
            <div
              key={s.label}
              style={{ ["--kpi-accent" as never]: toneAccent[s.tone] }}
              className="kpi-accent group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-soft transition hover:shadow-card"
            >
              <div className="relative flex items-start justify-between gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                  {s.label}
                </span>
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset ${toneStyles[s.tone]}`}>
                  <Icon className="h-[16px] w-[16px]" />
                </div>
              </div>
              <div className="relative mt-4 flex items-end justify-between gap-2">
                <div className="text-[34px] font-semibold leading-none tracking-tight font-mono-tab text-foreground">
                  {s.value}
                </div>
                {s.delta && (
                  <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold font-mono-tab ${deltaStyles[s.delta.dir]}`}>
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
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-semibold tracking-tight">Today's attention queue</h2>
                <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning-foreground">
                  {todaysQueue.length} items
                </span>
              </div>
              <p className="text-[11.5px] text-muted-foreground">Triage in order — oldest waiting first.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11.5px] font-medium text-foreground/80 hover:bg-secondary">
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
                  <th className="px-5 py-2.5 text-left font-medium">Customer</th>
                  <th className="px-3 py-2.5 text-left font-medium">Subject</th>
                  <th className="px-3 py-2.5 text-left font-medium">Channel</th>
                  <th className="px-3 py-2.5 text-left font-medium">Status</th>
                  <th className="px-3 py-2.5 text-left font-medium">Waiting</th>
                  <th className="px-5 py-2.5 text-left font-medium">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {todaysQueue.map((q) => (
                  <tr key={q.id} className="group transition hover:bg-surface-muted/40">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={q.initials} size="sm" />
                        <span className="font-medium">{q.customer}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-foreground/80 max-w-[220px] truncate">{q.subject}</td>
                    <td className="px-3 py-2.5"><ChannelChip channel={q.channel} label={channelLabel[q.channel]} /></td>
                    <td className="px-3 py-2.5"><StatusChip status={q.status} /></td>
                    <td className="px-3 py-2.5 text-muted-foreground font-mono-tab text-[12px]">{q.waiting}</td>
                    <td className="px-5 py-2.5 text-muted-foreground">
                      {q.assignee ?? <span className="italic text-warning-foreground/80">Unassigned</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-xl border border-border bg-card shadow-card flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h2 className="text-[13px] font-semibold tracking-tight">Recent messages</h2>
              <p className="text-[11.5px] text-muted-foreground">Latest inbound activity.</p>
            </div>
            <Link to="/inbox" className="text-[11.5px] font-medium text-primary hover:underline inline-flex items-center gap-1">
              All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border flex-1">
            {recentMessages.map((m) => (
              <li key={m.id} className="flex gap-3 px-5 py-3 transition hover:bg-surface-muted/40">
                <Avatar initials={m.initials} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium">{m.customer}</span>
                    <span className="shrink-0 text-[10.5px] text-muted-foreground font-mono-tab">{m.time}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground leading-snug">{m.snippet}</p>
                  <div className="mt-1.5"><ChannelChip channel={m.channel} label={channelLabel[m.channel]} /></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Channel command center + AI drafts */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">Channel command center</p>
              <h2 className="mt-0.5 text-[13px] font-semibold tracking-tight">Where customers reach you</h2>
            </div>
            <Link to="/channels" className="text-[11.5px] font-medium text-primary hover:underline inline-flex items-center gap-1">
              All sources <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-3 sm:p-4">
            <div
              className="grid gap-2.5"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
            >
              {channelOverview.map((c) => {
                const active = c.status === "Mock Active";
                const planned = c.status === "Planned";
                const healthDot =
                  c.health === "healthy" ? "bg-success" :
                  c.health === "degraded" ? "bg-warning" :
                  c.health === "offline" ? "bg-destructive" : "bg-muted-foreground/40";
                return (
                  <Link
                    key={c.key}
                    to={active ? "/inbox" : "/channels"}
                    className={`group relative flex flex-col gap-2.5 rounded-xl border bg-card p-3.5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card ${active ? "border-border hover:border-primary/30" : "border-dashed border-border/80 bg-surface-muted/40"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`grid h-9 w-9 place-items-center rounded-lg ring-1 ring-inset ${active ? "bg-primary-soft ring-primary/15" : "bg-secondary ring-border"}`}>
                        <ChannelIcon channel={c.key} size={20} />
                      </div>
                      {active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-success ring-1 ring-success/20">
                          <span className={`h-1.5 w-1.5 rounded-full ${healthDot}`} /> Active
                        </span>
                      ) : (
                        <span className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider ring-1 ring-inset ${planned ? "bg-secondary text-muted-foreground ring-border" : "bg-surface-muted text-muted-foreground/70 ring-border"}`}>
                          {c.status === "Future" ? "Future" : "Planned"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[13px] font-semibold tracking-tight truncate">{c.name}</div>
                      {c.unread > 0 && (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground tabular-nums shadow-soft">{c.unread}</span>
                      )}
                    </div>
                    {active ? (
                      <div className="grid grid-cols-3 gap-1 border-t border-border/70 pt-2 text-center">
                        <div>
                          <div className="text-[12px] font-semibold tabular-nums">{c.customers}</div>
                          <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground">Custs</div>
                        </div>
                        <div>
                          <div className={`text-[12px] font-semibold tabular-nums ${c.waiting > 0 ? "text-warning-foreground" : ""}`}>{c.waiting}</div>
                          <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground">Wait</div>
                        </div>
                        <div>
                          <div className="text-[10.5px] font-medium tabular-nums truncate" title={c.lastMessage}>{c.lastMessage}</div>
                          <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground">Last</div>
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
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-ai/12 text-ai ring-1 ring-ai/25">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold tracking-tight">AI draft review</h2>
                <p className="text-[11px] text-muted-foreground">Operator sends every reply.</p>
              </div>
            </div>
            <span className="rounded-md border border-ai/25 bg-ai/10 px-1.5 py-0.5 text-[10px] font-semibold text-ai uppercase tracking-wider">
              Human review
            </span>
          </div>
          <ul className="divide-y divide-border">
            {draftQueue.map((d) => (
              <li key={d.id} className="px-5 py-3.5">
                <div className="flex items-start gap-3">
                  <Avatar initials={d.initials} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium truncate">{d.customer}</span>
                      <span className="text-[10.5px] text-muted-foreground tabular-nums shrink-0">{d.prepared}</span>
                    </div>
                    <div className="text-[11.5px] text-muted-foreground truncate">{d.subject}</div>
                    <div className="mt-1.5 rounded-lg border border-dashed border-ai/25 bg-ai/[0.06] p-2.5 text-[12px] leading-snug text-foreground/90 line-clamp-2">
                      {d.draft}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10.5px]">
                      <span className="text-muted-foreground">
                        Confidence: <span className="font-semibold text-foreground/80">{d.confidence}</span>
                      </span>
                      <Link to="/inbox" className="font-semibold text-ai hover:underline inline-flex items-center gap-1">
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
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-5 py-3.5">
            <h2 className="text-[13px] font-semibold tracking-tight">Operator workload</h2>
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
                        <span className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {op.role}
                        </span>
                      </div>
                      <div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                        <div className="bg-info" style={{ width: `${openPct}%` }} />
                        <div className="bg-ai" style={{ width: `${draftPct}%` }} />
                        <div className="bg-success" style={{ width: `${resPct}%` }} />
                      </div>
                      <div className="mt-1.5 flex items-center gap-3 text-[10.5px] text-muted-foreground tabular-nums">
                        <span className="inline-flex items-center gap-1"><Clock3 className="h-2.5 w-2.5" /><span className="font-semibold text-foreground">{op.open}</span> open</span>
                        <span className="inline-flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /><span className="font-semibold text-foreground">{op.drafts}</span> drafts</span>
                        <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5" /><span className="font-semibold text-foreground">{op.resolvedToday}</span> done</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-4 rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h2 className="text-[13px] font-semibold tracking-tight">Trust & access</h2>
              <p className="text-[11.5px] text-muted-foreground">Recent audit activity.</p>
            </div>
            <Link to="/audit" className="text-[11.5px] font-medium text-primary hover:underline inline-flex items-center gap-1">
              Full log <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {auditEvents.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-5 py-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground ring-1 ring-border">
                  {e.actor.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] truncate">
                    <span className="font-medium">{e.actor}</span>{" "}
                    <span className="text-muted-foreground">{e.actionLabel.toLowerCase()}</span>{" "}
                    <span className="text-foreground/80">{e.target}</span>
                  </div>
                  <div className="text-[10.5px] text-muted-foreground tabular-nums">{e.time}</div>
                </div>
                <StatusChip status={e.result === "Denied" || e.result === "Failed" ? "access-denied" : "open"} />
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3 rounded-xl border border-border bg-card shadow-card p-5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold tracking-tight">Planned capabilities</h3>
              <p className="text-[11px] text-muted-foreground">Roadmap.</p>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-[12px]">
            {[
              "WhatsApp channel",
              "SMS channel",
              "Voice reception",
              "Realtime live chat",
              "Billing & subscriptions",
            ].map((p) => (
              <li
                key={p}
                className="flex items-center justify-between rounded-lg border border-dashed border-border px-2.5 py-1.5"
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
