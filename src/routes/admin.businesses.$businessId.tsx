import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Ban, RotateCcw, MessageSquarePlus, UserCog, Building2 } from "lucide-react";
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
  DisabledMockButton,
  ProgressBar,
} from "@/components/admin-bits";
import {
  getAdminBusiness,
  adminProviders,
  adminAuditEvents,
  adminUsers,
  adminSupportItems,
} from "@/lib/admin-mock-data";
import { EmptyState } from "@/components/empty-states";

export const Route = createFileRoute("/admin/businesses/$businessId")({
  head: () => ({
    meta: [
      { title: "Business detail — Platform Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminBusinessDetailPage,
});

function AdminBusinessDetailPage() {
  const { businessId } = Route.useParams();
  const business = getAdminBusiness(businessId);

  if (!business) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 lg:px-8">
        <AdminPageHeader title="Business not found" />
        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <EmptyState
            icon={Building2}
            title="That business doesn't exist"
            description="No mock business matches this id."
            badge="Not found"
            tone="warning"
            action={
              <Link
                to="/admin/businesses"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground shadow-soft hover:opacity-95"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Businesses
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const members = adminUsers.filter((u) => u.workspaceId === business.id);
  const owners = members.filter((m) => m.role === "Owner");
  const admins = members.filter((m) => m.role === "Admin");
  const operators = members.filter((m) => m.role === "Operator");
  const viewers = members.filter((m) => m.role === "Viewer");
  const events = adminAuditEvents.filter((e) => e.targetBusiness === business.id);
  const support = adminSupportItems.filter((s) => s.businessId === business.id);

  const quotaTone =
    business.quotaUsedPct >= 100 ? "destructive" : business.quotaUsedPct >= 80 ? "warn" : undefined;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <Link to="/admin/businesses" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Businesses
        </Link>
        <span>/</span>
        <span className="text-foreground">{business.name}</span>
      </div>

      <AdminPageHeader
        title={business.name}
        description={`Owner ${business.owner} · created ${business.createdAt}`}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <BusinessStatusPill status={business.status} />
            <RiskPill level={business.riskLevel} />
          </div>
        }
      />
      <AdminMockNotice />

      {/* Workspace overview KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Members" value={business.membersCount} />
        <KpiCard label="Active channels" value={business.channels.length} />
        <KpiCard label="Messages / mo" value={business.conversationsThisMonth} />
        <KpiCard label="AI drafts / mo" value={business.aiDraftsThisMonth} />
        <KpiCard label="Last activity" value={business.lastActivity} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Channels */}
        <SectionCard title="Channels" description="Mock providers — no real connection.">
          <ul className="space-y-2">
            {adminProviders.map((p) => {
              const active = business.channels.includes(p.id);
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-surface px-3 py-2 ring-1 ring-inset ring-border"
                >
                  <span className="text-[12.5px] text-foreground">{p.name}</span>
                  {active ? (
                    <ProviderStatusPill status={p.status} />
                  ) : (
                    <ProviderStatusPill status={p.status === "mock-active" ? "planned" : p.status} />
                  )}
                </li>
              );
            })}
          </ul>
        </SectionCard>

        {/* Usage */}
        <SectionCard
          title="Usage"
          description="Mock token usage — no real metering."
          action={<UsageStatusPill status={business.usageStatus} />}
        >
          <dl className="space-y-3 text-[12.5px]">
            <div>
              <dt className="text-muted-foreground">Conversations / mo</dt>
              <dd className="text-foreground">{business.conversationsThisMonth.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">AI drafts / mo</dt>
              <dd className="text-foreground">{business.aiDraftsThisMonth.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Mock tokens / mo</dt>
              <dd className="text-foreground">{business.tokensThisMonth.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Quota used</dt>
              <dd className="text-foreground">{business.quotaUsedPct}%</dd>
              <div className="mt-1.5"><ProgressBar pct={business.quotaUsedPct} tone={quotaTone} /></div>
            </div>
          </dl>
        </SectionCard>

        {/* Members summary */}
        <SectionCard title="Members" description={`${members.length} total`}>
          <ul className="space-y-1.5 text-[12.5px]">
            <li className="flex justify-between"><span className="text-muted-foreground">Owners</span><span className="font-medium text-foreground">{owners.length}</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Admins</span><span className="font-medium text-foreground">{admins.length}</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Operators</span><span className="font-medium text-foreground">{operators.length}</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Viewers</span><span className="font-medium text-foreground">{viewers.length}</span></li>
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent audit */}
        <SectionCard title="Recent audit events">
          {events.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">No audit events for this workspace.</p>
          ) : (
            <ul className="divide-y divide-border">
              {events.map((e) => (
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
          )}
        </SectionCard>

        {/* Support notes */}
        <SectionCard title="Support notes">
          {support.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">No support items.</p>
          ) : (
            <ul className="divide-y divide-border">
              {support.map((s) => (
                <li key={s.id} className="py-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[12.5px] font-medium text-foreground">{s.category}</span>
                    <div className="flex items-center gap-1.5">
                      <SupportPriorityPill priority={s.priority} />
                      <SupportStatusPill status={s.status} />
                    </div>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">{s.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Admin actions" description="All actions are mock-only.">
        <div className="flex flex-wrap gap-2">
          <DisabledMockButton destructive>
            <Ban className="h-3.5 w-3.5" /> Suspend business
          </DisabledMockButton>
          <DisabledMockButton>
            <RotateCcw className="h-3.5 w-3.5" /> Reset workspace settings
          </DisabledMockButton>
          <DisabledMockButton>
            <MessageSquarePlus className="h-3.5 w-3.5" /> Open support note
          </DisabledMockButton>
          <DisabledMockButton hint="Not enabled in MVP">
            <UserCog className="h-3.5 w-3.5" /> Impersonate owner
          </DisabledMockButton>
        </div>
      </SectionCard>
    </div>
  );
}
