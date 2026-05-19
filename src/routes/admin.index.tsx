import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AdminPageHeader,
  AdminMockNotice,
  KpiCard,
  SectionCard,
  BusinessStatusPill,
  UsageStatusPill,
  RiskPill,
  ProviderStatusPill,
  AuditResultPill,
  SupportPriorityPill,
  SupportStatusPill,
} from "@/components/admin-bits";
import {
  adminBusinesses,
  adminProviders,
  adminAuditEvents,
  adminSupportItems,
  adminPlatformKPIs,
} from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Platform Admin Overview — AI Reception" },
      {
        name: "description",
        content: "Internal mock platform admin overview for the AI Reception SaaS prototype.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const k = adminPlatformKPIs;
  const topBusinesses = adminBusinesses.slice(0, 4);
  const recentEvents = adminAuditEvents.slice(0, 5);
  const openSupport = adminSupportItems.filter((s) => s.status !== "resolved");

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <AdminPageHeader
        title="Platform Admin Overview"
        description="Monitor businesses, usage, provider status, and support activity across the AI Reception SaaS platform."
      />
      <AdminMockNotice />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Active businesses" value={k.activeBusinesses} hint="Mock tenants" />
        <KpiCard
          label="Trial workspaces"
          value={k.trialWorkspaces}
          hint="Mock trials"
          tone="info"
        />
        <KpiCard
          label="Messages / mo"
          value={k.messagesThisMonth.toLocaleString()}
          hint="Across all mock tenants"
        />
        <KpiCard
          label="AI drafts / mo"
          value={k.aiDraftsThisMonth.toLocaleString()}
          hint="Operator-reviewed"
        />
        <KpiCard
          label="Provider alerts"
          value={k.providerAlerts}
          hint="Mock providers"
          tone={k.providerAlerts > 0 ? "warn" : "neutral"}
        />
        <KpiCard
          label="Support items"
          value={k.supportItemsOpen}
          hint="Open / waiting"
          tone={k.supportItemsOpen > 0 ? "warn" : "neutral"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Business health */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Business health"
            description="Top mock tenants by recent activity."
            action={
              <Link
                to="/admin/businesses"
                className="text-[12px] font-medium text-primary hover:underline"
              >
                View all →
              </Link>
            }
          >
            <ul className="divide-y divide-border">
              {topBusinesses.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/admin/businesses/$businessId"
                      params={{ businessId: b.id }}
                      className="text-[13px] font-medium text-foreground hover:underline"
                    >
                      {b.name}
                    </Link>
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {b.plan} · {b.membersCount} members · last activity {b.lastActivity}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <BusinessStatusPill status={b.status} />
                    <UsageStatusPill status={b.usageStatus} />
                    <RiskPill level={b.riskLevel} />
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* Provider health */}
        <SectionCard
          title="Provider health"
          description="Mock providers only."
          action={
            <Link
              to="/admin/provider-health"
              className="text-[12px] font-medium text-primary hover:underline"
            >
              Details →
            </Link>
          }
        >
          <ul className="space-y-2">
            {adminProviders.slice(0, 6).map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-md bg-surface px-3 py-2 ring-1 ring-inset ring-border"
              >
                <span className="text-[12.5px] font-medium text-foreground">{p.name}</span>
                <ProviderStatusPill status={p.status} />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent audit */}
        <SectionCard
          title="Recent platform audit"
          action={
            <Link
              to="/admin/audit"
              className="text-[12px] font-medium text-primary hover:underline"
            >
              Open log →
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {recentEvents.map((e) => (
              <li key={e.id} className="py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12.5px] font-medium text-foreground">{e.action}</span>
                  <AuditResultPill result={e.result} />
                </div>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {e.actor} → {e.target} · {e.timestamp}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Support queue */}
        <SectionCard
          title="Support queue"
          action={
            <Link
              to="/admin/support"
              className="text-[12px] font-medium text-primary hover:underline"
            >
              Open queue →
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {openSupport.map((s) => (
              <li key={s.id} className="py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12.5px] font-medium text-foreground">{s.business}</span>
                  <div className="flex items-center gap-1.5">
                    <SupportPriorityPill priority={s.priority} />
                    <SupportStatusPill status={s.status} />
                  </div>
                </div>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {s.category} · {s.requester} · owner {s.owner}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
