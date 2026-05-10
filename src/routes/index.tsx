import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Inbox,
  Timer,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  ArrowRight,
  Repeat2,
  Mail,
  FileText,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
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
      { title: "Operations dashboard — AI Reception" },
      {
        name: "description",
        content:
          "Operator-first reception workspace. Review AI drafts, triage customer conversations, and monitor team workload.",
      },
    ],
  }),
  component: DashboardPage,
});

type Stat = {
  label: string;
  value: string;
  hint: string;
  icon: typeof Inbox;
  tone: "neutral" | "primary" | "warning" | "danger";
};

const stats: Stat[] = [
  { label: "Open conversations", value: "12", hint: "Across email & web form", icon: Inbox, tone: "neutral" },
  { label: "Waiting for operator", value: "4", hint: "Median wait 18m", icon: Timer, tone: "warning" },
  { label: "Needs follow-up", value: "6", hint: "Older than 24h", icon: Repeat2, tone: "neutral" },
  { label: "Drafts pending review", value: "7", hint: "Human review required", icon: Sparkles, tone: "primary" },
  { label: "Access alerts", value: "1", hint: "Blocked Viewer export", icon: ShieldAlert, tone: "danger" },
];

const toneStyles: Record<Stat["tone"], string> = {
  neutral: "bg-secondary text-secondary-foreground",
  primary: "bg-primary-soft text-primary",
  warning: "bg-warning/15 text-warning-foreground",
  danger: "bg-destructive/10 text-destructive",
};

function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {currentWorkspace.name} · {currentWorkspace.role} · Async MVP
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Operations dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Understand what's waiting, who's working on it, and what needs review.
            </p>
          </div>
          <Link
            to="/inbox"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
          >
            Open inbox <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <MockBanner />

        {/* Summary stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {s.label}
                  </span>
                  <div
                    className={`grid h-7 w-7 place-items-center rounded-lg ${toneStyles[s.tone]}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{s.hint}</div>
              </div>
            );
          })}
        </div>

        {/* Channel pulse */}
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Messages by channel</h2>
              <p className="text-xs text-muted-foreground">
                Where customers are reaching you. Mock data — not all sources are connected.
              </p>
            </div>
            <Link
              to="/channels"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Channel overview <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="-mx-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 divide-x divide-y sm:divide-y-0 divide-border">
            {channelOverview.map((c) => {
              const active = c.status === "Mock Active";
              return (
                <Link
                  key={c.key}
                  to={active ? "/inbox" : "/channels"}
                  className="group flex flex-col gap-2 px-4 py-4 transition hover:bg-surface-muted/60"
                >
                  <div className="flex items-center justify-between">
                    <ChannelIcon channel={c.key} size={28} />
                    {c.unread > 0 && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold">{c.name}</div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{active ? `${c.customers} customers` : c.status}</span>
                    {active && c.waiting > 0 && (
                      <span className="text-warning-foreground">{c.waiting} waiting</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Today's queue + Recent messages */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Today's conversation queue</h2>
                <p className="text-xs text-muted-foreground">
                  Triage in order — oldest waiting first.
                </p>
              </div>
              <Link
                to="/inbox"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View inbox <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted/60 text-[11px] uppercase tracking-wider text-muted-foreground">
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
                    <tr key={q.id} className="hover:bg-surface-muted/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={q.initials} />
                          <span className="font-medium">{q.customer}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-foreground/80">{q.subject}</td>
                      <td className="px-3 py-3">
                        <ChannelChip channel={q.channel} label={channelLabel[q.channel]} />
                      </td>
                      <td className="px-3 py-3">
                        <StatusChip status={q.status} />
                      </td>
                      <td className="px-3 py-3 text-muted-foreground tabular-nums">
                        {q.waiting}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {q.assignee ?? <span className="italic">Unassigned</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Recent customer messages</h2>
                <p className="text-xs text-muted-foreground">Latest inbound activity.</p>
              </div>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <ul className="divide-y divide-border">
              {recentMessages.map((m) => (
                <li key={m.id} className="flex gap-3 px-5 py-3.5">
                  <Avatar initials={m.initials} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{m.customer}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {m.time}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {m.snippet}
                    </p>
                    <div className="mt-1.5">
                      <ChannelChip channel={m.channel} label={channelLabel[m.channel]} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI draft queue + Operator workload */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">AI draft review queue</h2>
                  <p className="text-xs text-muted-foreground">
                    Operator edits and sends every reply — nothing goes out automatically.
                  </p>
                </div>
              </div>
              <span className="rounded-md border border-primary/20 bg-primary-soft px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                Human review required
              </span>
            </div>
            <ul className="divide-y divide-border">
              {draftQueue.map((d) => (
                <li key={d.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <Avatar initials={d.initials} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{d.customer}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{d.subject}</span>
                        <StatusChip status="needs-review" />
                      </div>
                      <div className="mt-2 rounded-lg border border-dashed border-primary/30 bg-primary-soft/40 p-3 text-[13px] leading-snug text-foreground/90">
                        <span className="mr-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          <FileText className="h-3 w-3" /> AI draft
                        </span>
                        {d.draft}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          Confidence: <span className="font-medium text-foreground/80">{d.confidence}</span> · Prepared {d.prepared}
                        </span>
                        <Link
                          to="/inbox"
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
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

          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Operator workload</h2>
              <p className="text-xs text-muted-foreground">Today's distribution.</p>
            </div>
            <ul className="divide-y divide-border">
              {operatorLoad.map((op) => {
                const total = op.open + op.drafts + op.resolvedToday;
                const openPct = (op.open / total) * 100;
                const draftPct = (op.drafts / total) * 100;
                return (
                  <li key={op.id} className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={op.initials} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm font-medium">{op.name}</span>
                          <span className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {op.role}
                          </span>
                        </div>
                        <div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                          <div className="bg-success" style={{ width: `${openPct}%` }} />
                          <div className="bg-primary" style={{ width: `${draftPct}%` }} />
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span><span className="font-medium text-foreground">{op.open}</span> open</span>
                          <span><span className="font-medium text-foreground">{op.drafts}</span> drafts</span>
                          <span><span className="font-medium text-foreground">{op.resolvedToday}</span> done</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Audit + Planned */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Recent audit events</h2>
                <p className="text-xs text-muted-foreground">
                  Workspace-scoped activity for transparency.
                </p>
              </div>
              <Link
                to="/audit"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Full log <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {auditEvents.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                    {e.actor.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">
                      <span className="font-medium">{e.actor}</span>{" "}
                      <span className="text-muted-foreground">{e.actionLabel.toLowerCase()}</span>{" "}
                      <span className="text-foreground/80">{e.target}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{e.time}</div>
                  </div>
                  <StatusChip status={e.result === "Denied" || e.result === "Failed" ? "access-denied" : "open"} />

                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-card p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning-foreground" />
              <h3 className="text-sm font-semibold">Planned capabilities</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Roadmap — not enabled in this workspace.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
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
                  <span>{p}</span>
                  <StatusChip status="future" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
