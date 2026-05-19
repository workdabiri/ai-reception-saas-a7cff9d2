import { createFileRoute } from "@tanstack/react-router";
import {
  AdminPageHeader,
  AdminMockNotice,
  KpiCard,
  SectionCard,
  UsageStatusPill,
  ProgressBar,
} from "@/components/admin-bits";
import {
  adminBusinesses,
  adminPlatformKPIs,
} from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/usage")({
  head: () => ({
    meta: [
      { title: "Usage — Platform Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminUsagePage,
});

function AdminUsagePage() {
  const k = adminPlatformKPIs;
  const sorted = [...adminBusinesses].sort((a, b) => b.tokensThisMonth - a.tokensThisMonth);

  // Mock channel volume rollup.
  const channelVolume = [
    { name: "Web Chat", value: Math.round(k.messagesThisMonth * 0.62) },
    { name: "Email", value: Math.round(k.messagesThisMonth * 0.38) },
  ];
  const channelMax = Math.max(...channelVolume.map((c) => c.value), 1);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <AdminPageHeader
        title="Usage"
        description="Platform-wide usage and quota monitoring. Usage metrics are mock data for prototype review."
      />
      <AdminMockNotice />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total messages" value={k.messagesThisMonth.toLocaleString()} hint="This month" />
        <KpiCard label="AI drafts" value={k.aiDraftsThisMonth.toLocaleString()} hint="Operator-reviewed" />
        <KpiCard label="Mock tokens" value={k.tokensThisMonth.toLocaleString()} hint="Sum across tenants" />
        <KpiCard label="Active businesses" value={k.activeBusinesses} hint="Mock tenants" />
        <KpiCard label="Quota warnings" value={k.quotaWarnings} hint="Approaching / over" tone={k.quotaWarnings > 0 ? "warn" : "neutral"} />
      </div>

      <SectionCard title="Usage by business" description="Sorted by mock token usage.">
        <ul className="space-y-3">
          {sorted.map((b) => {
            const tone =
              b.quotaUsedPct >= 100 ? "destructive" : b.quotaUsedPct >= 80 ? "warn" : undefined;
            return (
              <li key={b.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-foreground">{b.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {b.conversationsThisMonth.toLocaleString()} messages · {b.aiDraftsThisMonth.toLocaleString()} drafts · {b.tokensThisMonth.toLocaleString()} tokens
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-foreground">{b.quotaUsedPct}%</span>
                    <UsageStatusPill status={b.usageStatus} />
                  </div>
                </div>
                <div className="mt-2"><ProgressBar pct={b.quotaUsedPct} tone={tone} /></div>
              </li>
            );
          })}
        </ul>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Usage by channel" description="Mock distribution.">
          <ul className="space-y-3">
            {channelVolume.map((c) => (
              <li key={c.name}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-foreground">{c.name}</span>
                  <span className="text-muted-foreground">{c.value.toLocaleString()} messages</span>
                </div>
                <div className="mt-1"><ProgressBar pct={(c.value / channelMax) * 100} /></div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Quota risk list" description="Workspaces nearing or over quota.">
          {sorted.filter((b) => b.usageStatus !== "healthy").length === 0 ? (
            <p className="text-[12px] text-muted-foreground">All mock workspaces are healthy.</p>
          ) : (
            <ul className="divide-y divide-border">
              {sorted
                .filter((b) => b.usageStatus !== "healthy")
                .map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium text-foreground">{b.name}</div>
                      <div className="text-[11px] text-muted-foreground">{b.quotaUsedPct}% of quota</div>
                    </div>
                    <UsageStatusPill status={b.usageStatus} />
                  </li>
                ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
