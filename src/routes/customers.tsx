import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Avatar, PageHeader } from "@/components/ui-bits";
import {
  customers,
  conversations,
  members,
  type InboxStatus,
} from "@/lib/mock-data";
import { Search, Plus, Download, Shield, Users, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — AI Reception" },
      { name: "description", content: "Lightweight customer directory for reception operators." },
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
    };
  });
}

const allTags = Array.from(new Set(customers.flatMap((c) => c.tags)));

function CustomersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InboxStatus>("all");
  const [tagFilter, setTagFilter] = useState<"all" | string>("all");

  const rows = useMemo(buildRows, []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (tagFilter !== "all" && !r.tags.includes(tagFilter)) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.lastSubject.toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter, tagFilter]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <PageHeader
          title="Customers"
          description="Lightweight reception directory. Mock data for the prototype."
          action={
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-95">
                <Plus className="h-3.5 w-3.5" /> Add customer
              </button>
            </div>
          }
        />

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[12px] text-warning-foreground">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <span className="font-semibold">Workspace-scoped data.</span>{" "}
            Customer records are visible only to permitted members of this workspace. Mock
            data — no real PII shown.
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card shadow-card overflow-hidden">
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
                value={tagFilter}
                onChange={(v) => setTagFilter(v)}
                options={[
                  { value: "all", label: "All tags" },
                  ...allTags.map((t) => ({ value: t, label: t })),
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
              title={rows.length === 0 ? "No customers yet" : "No customers match"}
              hint={
                rows.length === 0
                  ? "When someone reaches out via a connected channel, they'll appear here."
                  : "Try a different search or clear filters."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left">
                  <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Customer</th>
                    <th className="px-4 py-2.5 font-medium">Contact</th>
                    <th className="px-4 py-2.5 font-medium">Last conversation</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Tags</th>
                    <th className="px-4 py-2.5 font-medium">Assigned</th>
                    <th className="px-4 py-2.5 font-medium text-right">Last activity</th>
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
                            <div className="truncate text-xs text-muted-foreground">
                              {r.email}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-muted-foreground">
                          {r.phone}
                          <span className="ml-1 text-[10px] uppercase tracking-wider opacity-70">
                            · placeholder
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[16rem] truncate text-xs">{r.lastSubject}</div>
                      </td>
                      <td className="px-4 py-3">
                        {r.status ? (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${statusTone[r.status]}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                            {statusLabel[r.status]}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.tags.length === 0 && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                          {r.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {r.assignee ?? <span className="italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                        {r.lastSeen}
                      </td>
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
          )}
        </div>
      </div>
    </AppShell>
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
