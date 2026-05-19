import { createFileRoute } from "@tanstack/react-router";
import {
  AdminPageHeader,
  AdminMockNotice,
  SectionCard,
  ProviderStatusPill,
} from "@/components/admin-bits";
import { adminProviders, type AdminProvider } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/provider-health")({
  head: () => ({
    meta: [
      { title: "Provider Health — Platform Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminProviderHealthPage,
});

function ProviderCard({ p }: { p: AdminProvider }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13.5px] font-medium text-foreground">{p.name}</div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">{p.notes}</div>
        </div>
        <ProviderStatusPill status={p.status} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[11.5px] sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Availability</dt>
          <dd className="font-medium text-foreground">
            {p.status === "mock-active" ? `${p.availabilityPct}%` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Last check</dt>
          <dd className="font-medium text-foreground">{p.lastCheck}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Latency</dt>
          <dd className="font-medium text-foreground">
            {p.latencyMs != null ? `${p.latencyMs} ms` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Affected</dt>
          <dd className="font-medium text-foreground">{p.affectedBusinesses}</dd>
        </div>
      </dl>
    </div>
  );
}

const INCIDENTS = [
  {
    at: "2026-05-18 14:21",
    title: "Web Chat — elevated mock latency",
    duration: "8 min",
    note: "Simulated incident. No customers were affected.",
  },
  {
    at: "2026-05-12 09:02",
    title: "Email — mock delivery delay",
    duration: "22 min",
    note: "Mock incident demo.",
  },
];

function AdminProviderHealthPage() {
  const active = adminProviders.filter((p) => p.status === "mock-active");
  const planned = adminProviders.filter((p) => p.status === "planned");
  const future = adminProviders.filter((p) => p.status === "future");

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <AdminPageHeader
        title="Provider Health"
        description="No real provider is connected in this prototype."
      />
      <AdminMockNotice />

      <SectionCard title="Active mock providers" description="Reporting mock telemetry only.">
        <div className="grid gap-3 sm:grid-cols-2">
          {active.map((p) => (
            <ProviderCard key={p.id} p={p} />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Planned providers"
        description="Visible in channel setup as planned — not connected."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {planned.map((p) => (
            <ProviderCard key={p.id} p={p} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Future providers" description="Not on MVP roadmap.">
        <div className="grid gap-3 sm:grid-cols-2">
          {future.map((p) => (
            <ProviderCard key={p.id} p={p} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Incident history" description="Mock incidents for prototype review.">
        <ul className="divide-y divide-border">
          {INCIDENTS.map((i) => (
            <li key={i.title} className="py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12.5px] font-medium text-foreground">{i.title}</span>
                <span className="text-[11px] text-muted-foreground">
                  {i.at} · {i.duration}
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">{i.note}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
