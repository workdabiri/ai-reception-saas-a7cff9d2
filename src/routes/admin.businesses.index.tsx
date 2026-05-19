import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Eye, Ban, UserCog } from "lucide-react";
import {
  AdminPageHeader,
  AdminMockNotice,
  BusinessStatusPill,
  UsageStatusPill,
  RiskPill,
  DisabledMockButton,
  SectionCard,
} from "@/components/admin-bits";
import { adminBusinesses } from "@/lib/admin-mock-data";
import { useStateParam, RouteSkeleton } from "@/components/route-state";
import { EmptyState } from "@/components/empty-states";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/admin/businesses/")({
  head: () => ({
    meta: [
      { title: "Businesses — Platform Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminBusinessesPage,
});

const FILTERS = ["All", "Active", "Trial", "Suspended", "High usage", "Needs attention"] as const;
type Filter = (typeof FILTERS)[number];

function AdminBusinessesPage() {
  const stateOverride = useStateParam();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const rows = useMemo(() => {
    let r = adminBusinesses;
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((b) => b.name.toLowerCase().includes(q) || b.owner.toLowerCase().includes(q));
    }
    if (filter === "Active") r = r.filter((b) => b.status === "active");
    else if (filter === "Trial") r = r.filter((b) => b.status === "trial");
    else if (filter === "Suspended") r = r.filter((b) => b.status === "suspended");
    else if (filter === "High usage") r = r.filter((b) => b.usageStatus !== "healthy");
    else if (filter === "Needs attention") r = r.filter((b) => b.riskLevel !== "low");
    return r;
  }, [query, filter]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <AdminPageHeader
        title="Businesses"
        description="Mock tenant workspaces in the AI Reception SaaS prototype."
      />
      <AdminMockNotice />

      {stateOverride === "loading" ? (
        <RouteSkeleton variant="table" />
      ) : stateOverride === "empty" ? (
        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <EmptyState
            icon={Building2}
            title="No businesses match"
            description="No mock businesses match the current filter. Try clearing filters."
            badge="Empty state"
            tone="neutral"
          />
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search businesses or owners…"
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

          {/* Desktop table */}
          <SectionCard title={`${rows.length} businesses`} description="Read-only mock view.">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 font-medium">Business</th>
                    <th className="py-2 pr-3 font-medium">Plan</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 font-medium text-right">Members</th>
                    <th className="py-2 pr-3 font-medium text-right">Convos / mo</th>
                    <th className="py-2 pr-3 font-medium text-right">Drafts / mo</th>
                    <th className="py-2 pr-3 font-medium">Usage</th>
                    <th className="py-2 pr-3 font-medium">Risk</th>
                    <th className="py-2 pr-3 font-medium">Last activity</th>
                    <th className="py-2 pr-1 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((b) => (
                    <tr key={b.id} className="align-middle">
                      <td className="py-3 pr-3">
                        <div className="font-medium text-foreground">{b.name}</div>
                        <div className="text-[11px] text-muted-foreground">{b.owner}</div>
                      </td>
                      <td className="py-3 pr-3 text-foreground">{b.plan}</td>
                      <td className="py-3 pr-3">
                        <BusinessStatusPill status={b.status} />
                      </td>
                      <td className="py-3 pr-3 text-right text-foreground">{b.membersCount}</td>
                      <td className="py-3 pr-3 text-right text-foreground">
                        {b.conversationsThisMonth}
                      </td>
                      <td className="py-3 pr-3 text-right text-foreground">
                        {b.aiDraftsThisMonth}
                      </td>
                      <td className="py-3 pr-3">
                        <UsageStatusPill status={b.usageStatus} />
                      </td>
                      <td className="py-3 pr-3">
                        <RiskPill level={b.riskLevel} />
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">{b.lastActivity}</td>
                      <td className="py-3 pr-1 text-right">
                        <Link
                          to="/admin/businesses/$businessId"
                          params={{ businessId: b.id }}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-[11.5px] font-medium text-foreground transition hover:bg-secondary"
                        >
                          <Eye className="h-3 w-3" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="space-y-3 md:hidden">
              {rows.map((b) => (
                <li key={b.id} className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to="/admin/businesses/$businessId"
                        params={{ businessId: b.id }}
                        className="text-[13px] font-medium text-foreground hover:underline"
                      >
                        {b.name}
                      </Link>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {b.owner} · {b.plan}
                      </div>
                    </div>
                    <BusinessStatusPill status={b.status} />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <div className="text-muted-foreground">Members</div>
                      <div className="font-medium text-foreground">{b.membersCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Convos</div>
                      <div className="font-medium text-foreground">{b.conversationsThisMonth}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Drafts</div>
                      <div className="font-medium text-foreground">{b.aiDraftsThisMonth}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <UsageStatusPill status={b.usageStatus} />
                    <RiskPill level={b.riskLevel} />
                    <span className="text-[10.5px] text-muted-foreground">· {b.lastActivity}</span>
                  </div>
                  <div className="mt-3">
                    <Link
                      to="/admin/businesses/$businessId"
                      params={{ businessId: b.id }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-[11.5px] font-medium text-foreground hover:bg-secondary"
                    >
                      <Eye className="h-3 w-3" /> View detail
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Admin actions"
            description="Admin actions are mock-only. No tenant data is changed."
          >
            <div className="flex flex-wrap gap-2">
              <DisabledMockButton destructive>
                <Ban className="h-3.5 w-3.5" /> Suspend selected
              </DisabledMockButton>
              <DisabledMockButton hint="Not enabled in MVP">
                <UserCog className="h-3.5 w-3.5" /> Impersonate owner
              </DisabledMockButton>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
