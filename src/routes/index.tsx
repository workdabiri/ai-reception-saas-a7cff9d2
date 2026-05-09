import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Avatar, ChannelChip, StatusChip } from "@/components/ui-bits";
import { conversations, customers, channelLabel } from "@/lib/mock-data";
import { ArrowUpRight, Inbox, Sparkles, Timer, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Reception" },
      { name: "description", content: "Operator-first reception workspace overview." },
    ],
  }),
  component: DashboardPage,
});

const stats = [
  { label: "Open conversations", value: "12", delta: "+3 today", icon: Inbox },
  { label: "Awaiting operator", value: "4", delta: "Median wait 18m", icon: Timer },
  { label: "AI drafts ready", value: "7", delta: "Pending review", icon: Sparkles },
  { label: "Active customers", value: "248", delta: "This month", icon: Users },
];

function DashboardPage() {
  const recent = conversations.slice(0, 5);
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tuesday · Async MVP
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Good morning, Amelia
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here's what's waiting in your reception today.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">AI draft</span>
            <span className="text-muted-foreground">· operator sends final reply</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground">{s.delta}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent inbox */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Recent in inbox</h2>
                <p className="text-xs text-muted-foreground">
                  Conversations needing a human reply.
                </p>
              </div>
              <Link
                to="/inbox"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Open inbox <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {recent.map((c) => {
                const customer = customers.find((x) => x.id === c.customerId)!;
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-muted/50"
                  >
                    <Avatar initials={customer.initials} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {customer.name}
                        </span>
                        <StatusChip status={c.status} />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.subject} · {c.preview}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <ChannelChip channel={c.channel} label={channelLabel[c.channel]} />
                      <span className="text-[11px] text-muted-foreground">{c.updated}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Side cards */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary-soft via-card to-card p-5 shadow-card">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                AI draft policy
              </div>
              <h3 className="mt-2 text-base font-semibold">Human review required</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                AI prepares a suggested response. An operator edits and sends every reply —
                nothing goes out automatically.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["AI draft", "Operator sends final reply", "Async MVP"].map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold">Planned capabilities</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                On the roadmap — not enabled in this workspace.
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
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Future integration
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
