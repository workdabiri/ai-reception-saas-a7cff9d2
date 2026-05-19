import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import {
  AdminPageHeader,
  AdminMockNotice,
  SectionCard,
  AuditResultPill,
} from "@/components/admin-bits";
import { adminAuditEvents, type AdminAuditCategory } from "@/lib/admin-mock-data";
import { useStateParam, RouteSkeleton } from "@/components/route-state";
import { EmptyState } from "@/components/empty-states";
import { Pill } from "@/components/ui/pill";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Platform Audit — Platform Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminAuditPage,
});

const CATS: { id: "all" | AdminAuditCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "business", label: "Business" },
  { id: "user", label: "User" },
  { id: "access", label: "Access" },
  { id: "feature-flag", label: "Feature flag" },
  { id: "provider", label: "Provider" },
  { id: "support", label: "Support" },
];

function AdminAuditPage() {
  const stateOverride = useStateParam();
  const [cat, setCat] = useState<(typeof CATS)[number]["id"]>("all");

  const rows = useMemo(() => {
    return cat === "all" ? adminAuditEvents : adminAuditEvents.filter((e) => e.category === cat);
  }, [cat]);

  if (stateOverride === "loading") {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
        <AdminPageHeader title="Platform Audit" />
        <AdminMockNotice />
        <RouteSkeleton variant="table" />
      </div>
    );
  }
  if (stateOverride === "empty") {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
        <AdminPageHeader title="Platform Audit" />
        <AdminMockNotice />
        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <EmptyState
            icon={ScrollText}
            title="No audit events"
            description="Platform-wide audit events will appear here."
            badge="Empty state"
            tone="neutral"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <AdminPageHeader
        title="Platform Audit"
        description="Mock platform-level audit log. No real audit backend."
      />
      <AdminMockNotice />

      <div className="flex flex-wrap items-center gap-1.5">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={[
              "h-8 rounded-full px-3 text-[11.5px] font-medium ring-1 ring-inset transition",
              cat === c.id
                ? "bg-foreground text-background ring-foreground"
                : "bg-surface text-foreground ring-border hover:bg-secondary",
            ].join(" ")}
          >
            {c.label}
          </button>
        ))}
      </div>

      <SectionCard title={`${rows.length} events`} description="Read-only mock view.">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">When</th>
                <th className="py-2 pr-3 font-medium">Actor</th>
                <th className="py-2 pr-3 font-medium">Action</th>
                <th className="py-2 pr-3 font-medium">Target</th>
                <th className="py-2 pr-3 font-medium">Result</th>
                <th className="py-2 pr-3 font-medium">Source</th>
                <th className="py-2 pr-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((e) => (
                <tr key={e.id}>
                  <td className="py-3 pr-3 text-muted-foreground">{e.timestamp}</td>
                  <td className="py-3 pr-3">
                    <div className="font-medium text-foreground">{e.actor}</div>
                    <div className="text-[11px] text-muted-foreground">{e.actorType}</div>
                  </td>
                  <td className="py-3 pr-3 text-foreground">{e.action}</td>
                  <td className="py-3 pr-3 text-foreground">{e.target}</td>
                  <td className="py-3 pr-3"><AuditResultPill result={e.result} /></td>
                  <td className="py-3 pr-3 text-muted-foreground">{e.source}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{e.metadata}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="space-y-3 md:hidden">
          {rows.map((e) => (
            <li key={e.id} className="rounded-lg border border-border bg-surface p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12.5px] font-medium text-foreground">{e.action}</span>
                <AuditResultPill result={e.result} />
              </div>
              <p className="mt-1 text-[11.5px] text-muted-foreground">{e.actor} → {e.target}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted-foreground">
                <Pill variant="neutral" size="sm">{e.category}</Pill>
                <span>{e.timestamp}</span>
                <span>· {e.source}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{e.metadata}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
