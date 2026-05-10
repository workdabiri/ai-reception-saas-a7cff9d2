import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Avatar, ChannelChip, PageHeader } from "@/components/ui-bits";
import { ChannelIcon } from "@/components/channel-icon";
import {
  customers,
  conversations,
  members,
  channelLabel,
  type InboxStatus,
  type Channel,
} from "@/lib/mock-data";
import { Search, Download, Shield, Users, ChevronRight, AlertTriangle, MessageCircle } from "lucide-react";
import type { ChannelKey } from "@/lib/mock-data";

const channelToKey = (c: Channel): ChannelKey => (c === "webform" ? "webchat" : (c as ChannelKey));

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — AI Reception" },
      { name: "description", content: "Reception customer directory with channel and conversation context." },
    ],
  }),
  component: CustomersPage,
});

const statusLabel: Record<InboxStatus, string> = {
  new: "New",
  open: "Open",
  waiting: "Waiting",
  "needs-followup": "Needs follow-up",
  closed: "Closed",
};

const statusTone: Record<InboxStatus, string> = {
  new: "bg-info/10 text-info border-info/20",
  open: "bg-success/10 text-success border-success/20",
  waiting: "bg-warning/15 text-warning-foreground border-warning/30",
  "needs-followup": "bg-primary-soft text-primary border-primary/30",
  closed: "bg-muted text-muted-foreground border-border",
};

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  tags: string[];
  lastSeen: string;
  lastSubject: string;
  status: InboxStatus | null;
  assignee: string | null;
  primaryChannel: Channel;
  lastInboundChannel: Channel;
  openConversations: number;
  unreadMessages: number;
  needsFollowUp: boolean;
};

function buildRows(): Row[] {
  return customers.map((c) => {
    const convs = conversations.filter((cv) => cv.customerId === c.id);
    const last = convs[0];
    const assignee = last?.assignee
      ? members.find((m) => m.id === last.assignee)?.name ?? null
      : null;
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      initials: c.initials,
      tags: c.tags,
      lastSeen: c.lastSeen,
      lastSubject: last?.subject ?? "—",
      status: last?.inboxStatus ?? null,
      assignee,
      primaryChannel: c.primaryChannel,
      lastInboundChannel: c.lastInboundChannel,
      openConversations: c.openConversations,
      unreadMessages: c.unreadMessages,
      needsFollowUp: c.needsFollowUp,
    };
  });
}

function CustomersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InboxStatus>("all");
  const [channelFilter, setChannelFilter] = useState<"all" | Channel>("all");

  const rows = useMemo(buildRows, []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (channelFilter !== "all" && r.primaryChannel !== channelFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.lastSubject.toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter, channelFilter]);

  const totals = useMemo(
    () => ({
      open: rows.reduce((a, r) => a + r.openConversations, 0),
      unread: rows.reduce((a, r) => a + r.unreadMessages, 0),
      followUp: rows.filter((r) => r.needsFollowUp).length,
    }),
    [rows],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <PageHeader
          title="Customers"
          description="Reception directory — who's reaching out, from which channel, and what needs follow-up."
          action={
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary">
              <Download className="h-3.5 w-3.5" /> Export (mock)
            </button>
          }
        />

        {/* Reception summary */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard label="Customers" value={rows.length} />
          <SummaryCard label="Open conversations" value={totals.open} tone="primary" />
          <SummaryCard label="Unread messages" value={totals.unread} tone="warning" />
          <SummaryCard label="Need follow-up" value={totals.followUp} tone="warning" />
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[12px] text-warning-foreground">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <span className="font-semibold">Workspace-scoped data.</span>{" "}
            Visible only to permitted members of this workspace. Server verifies membership. Mock data — no real PII.
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-border bg-card shadow-card overflow-hidden">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, email, subject…"
                  className="h-9 w-full rounded-lg border border-input bg-surface pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <FilterSelect
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as "all" | InboxStatus)}
                options={[
                  { value: "all", label: "All statuses" },
                  ...(Object.keys(statusLabel) as InboxStatus[]).map((s) => ({
                    value: s,
                    label: statusLabel[s],
                  })),
                ]}
              />
              <FilterSelect
                value={channelFilter}
                onChange={(v) => setChannelFilter(v as "all" | Channel)}
                options={[
                  { value: "all", label: "All channels" },
                  { value: "email", label: "Email" },
                  { value: "webform", label: "Web form" },
                ]}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {filtered.length} of {rows.length} customers
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers match"
              hint="Try a different search or clear filters."
            />
          ) : (
            <>
              {/* Desktop / tablet table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-muted text-left">
                    <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">Customer</th>
                      <th className="px-3 py-2.5 font-medium">Primary channel</th>
                      <th className="px-3 py-2.5 font-medium">Last inbound</th>
                      <th className="px-3 py-2.5 font-medium text-center">Open</th>
                      <th className="px-3 py-2.5 font-medium text-center">Unread</th>
                      <th className="px-3 py-2.5 font-medium">Status</th>
                      <th className="px-3 py-2.5 font-medium">Follow-up</th>
                      <th className="px-3 py-2.5 font-medium">Assigned</th>
                      <th className="px-4 py-2.5 font-medium text-right">Last seen</th>
                      <th className="w-8 px-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((r) => (
                      <tr key={r.id} className="group hover:bg-surface-muted/60">
                        <td className="px-4 py-3">
                          <Link
                            to="/customers/$customerId"
                            params={{ customerId: r.id }}
                            className="flex items-center gap-3"
                          >
                            <Avatar initials={r.initials} />
                            <div className="min-w-0">
                              <div className="font-medium group-hover:underline">{r.name}</div>
                              <div className="truncate text-xs text-muted-foreground">{r.email}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <ChannelChip channel={r.primaryChannel} label={channelLabel[r.primaryChannel]} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <ChannelIcon channel={channelToKey(r.lastInboundChannel)} size={22} />
                            <span className="text-xs text-muted-foreground">{r.lastSeen}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-sm tabular-nums">{r.openConversations}</td>
                        <td className="px-3 py-3 text-center">
                          {r.unreadMessages > 0 ? (
                            <span className="inline-flex min-w-[22px] justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                              {r.unreadMessages}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">0</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {r.status ? (
                            <span className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${statusTone[r.status]}`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                              {statusLabel[r.status]}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {r.needsFollowUp ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[11px] font-medium text-warning-foreground">
                              <AlertTriangle className="h-3 w-3" /> Yes
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">
                          {r.assignee ?? <span className="italic">Unassigned</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">{r.lastSeen}</td>
                        <td className="px-2 text-muted-foreground">
                          <Link
                            to="/customers/$customerId"
                            params={{ customerId: r.id }}
                            className="grid h-7 w-7 place-items-center rounded-md hover:bg-secondary"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <ul className="md:hidden divide-y divide-border">
                {filtered.map((r) => (
                  <li key={r.id}>
                    <Link
                      to="/customers/$customerId"
                      params={{ customerId: r.id }}
                      className="flex items-start gap-3 px-4 py-3.5 hover:bg-surface-muted/60"
                    >
                      <Avatar initials={r.initials} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">{r.name}</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">{r.lastSeen}</span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.lastSubject}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <ChannelChip channel={r.primaryChannel} label={channelLabel[r.primaryChannel]} />
                          {r.status && (
                            <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${statusTone[r.status]}`}>
                              {statusLabel[r.status]}
                            </span>
                          )}
                          {r.unreadMessages > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                              <MessageCircle className="h-2.5 w-2.5" />
                              {r.unreadMessages}
                            </span>
                          )}
                          {r.needsFollowUp && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground">
                              <AlertTriangle className="h-2.5 w-2.5" /> Follow-up
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "primary" | "warning" }) {
  const toneCls = {
    neutral: "text-foreground",
    primary: "text-primary",
    warning: "text-warning-foreground",
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold tabular-nums tracking-tight ${toneCls}`}>{value}</div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-input bg-surface px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring/40"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Users;
  title: string;
  hint: string;
}) {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
