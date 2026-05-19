import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Eye, ScrollText, Ban } from "lucide-react";
import { Pill, type PillVariant } from "@/components/ui/pill";
import {
  AdminPageHeader,
  AdminMockNotice,
  SectionCard,
  DisabledMockButton,
} from "@/components/admin-bits";
import { adminUsers, type AdminUser } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users — Platform Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminUsersPage,
});

const FILTERS = ["All", "Owners", "Admins", "Operators", "Viewers", "Suspended"] as const;
type Filter = (typeof FILTERS)[number];

function RolePill({ role }: { role: AdminUser["role"] }) {
  const map: Record<AdminUser["role"], { variant: PillVariant; label: string }> = {
    Owner: { variant: "primary", label: "Owner" },
    Admin: { variant: "info", label: "Admin" },
    Operator: { variant: "success", label: "Operator" },
    Viewer: { variant: "neutral", label: "Viewer" },
  };
  return <Pill variant={map[role].variant}>{map[role].label}</Pill>;
}

function StatusPill({ status }: { status: AdminUser["status"] }) {
  const map: Record<AdminUser["status"], { variant: PillVariant; label: string }> = {
    active: { variant: "success", label: "Active" },
    invited: { variant: "warn", label: "Invited" },
    suspended: { variant: "destructive", label: "Suspended" },
  };
  return <Pill variant={map[status].variant}>{map[status].label}</Pill>;
}

function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const rows = useMemo(() => {
    let r = adminUsers;
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.workspace.toLowerCase().includes(q),
      );
    }
    if (filter === "Owners") r = r.filter((u) => u.role === "Owner");
    else if (filter === "Admins") r = r.filter((u) => u.role === "Admin");
    else if (filter === "Operators") r = r.filter((u) => u.role === "Operator");
    else if (filter === "Viewers") r = r.filter((u) => u.role === "Viewer");
    else if (filter === "Suspended") r = r.filter((u) => u.status === "suspended");
    return r;
  }, [query, filter]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <AdminPageHeader
        title="Users"
        description="Cross-workspace mock user directory."
      />
      <AdminMockNotice />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, email, or workspace…"
            className="h-9 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-[12.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "h-8 rounded-full px-3 text-[11.5px] font-medium ring-1 ring-inset transition",
                filter === f
                  ? "bg-foreground text-background ring-foreground"
                  : "bg-surface text-foreground ring-border hover:bg-secondary",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <SectionCard title={`${rows.length} users`} description="Read-only mock view.">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Role</th>
                <th className="py-2 pr-3 font-medium">Workspace</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Last active</th>
                <th className="py-2 pr-3 font-medium">Joined</th>
                <th className="py-2 pr-1 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 pr-3 font-medium text-foreground">{u.name}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{u.email}</td>
                  <td className="py-3 pr-3"><RolePill role={u.role} /></td>
                  <td className="py-3 pr-3 text-foreground">
                    <Link
                      to="/admin/businesses/$businessId"
                      params={{ businessId: u.workspaceId }}
                      className="hover:underline"
                    >
                      {u.workspace}
                    </Link>
                  </td>
                  <td className="py-3 pr-3"><StatusPill status={u.status} /></td>
                  <td className="py-3 pr-3 text-muted-foreground">{u.lastActive}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{u.joinedAt}</td>
                  <td className="py-3 pr-1">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to="/admin/businesses/$businessId"
                        params={{ businessId: u.workspaceId }}
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-[11px] font-medium text-foreground hover:bg-secondary"
                      >
                        <Eye className="h-3 w-3" /> Workspace
                      </Link>
                      <Link
                        to="/admin/audit"
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-[11px] font-medium text-foreground hover:bg-secondary"
                      >
                        <ScrollText className="h-3 w-3" /> Audit
                      </Link>
                      <DisabledMockButton destructive hint="Mock only">
                        <Ban className="h-3 w-3" /> Disable
                      </DisabledMockButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="space-y-3 md:hidden">
          {rows.map((u) => (
            <li key={u.id} className="rounded-lg border border-border bg-surface p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-foreground">{u.name}</div>
                  <div className="text-[11px] text-muted-foreground">{u.email}</div>
                </div>
                <RolePill role={u.role} />
              </div>
              <div className="mt-2 text-[11.5px] text-muted-foreground">
                <Link
                  to="/admin/businesses/$businessId"
                  params={{ businessId: u.workspaceId }}
                  className="text-foreground hover:underline"
                >
                  {u.workspace}
                </Link>
                <span> · last active {u.lastActive}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <StatusPill status={u.status} />
                <span className="text-[10.5px] text-muted-foreground">joined {u.joinedAt}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Link
                  to="/admin/businesses/$businessId"
                  params={{ businessId: u.workspaceId }}
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-[11px] font-medium text-foreground hover:bg-secondary"
                >
                  <Eye className="h-3 w-3" /> Workspace
                </Link>
                <DisabledMockButton destructive>
                  <Ban className="h-3 w-3" /> Disable
                </DisabledMockButton>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
