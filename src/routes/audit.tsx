import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui-bits";
import { auditEvents } from "@/lib/mock-data";
import { Filter, Download } from "lucide-react";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit log — AI Reception" },
      { name: "description", content: "A clear record of who did what, and when." },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        <PageHeader
          title="Audit log"
          description="A clear record of every action taken in this workspace."
          action={
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          }
        />

        <div className="mt-6 rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Actor</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
                <th className="px-4 py-2.5 font-medium">Target</th>
                <th className="px-4 py-2.5 font-medium text-right">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditEvents.map((e) => (
                <tr key={e.id} className="hover:bg-surface-muted/60">
                  <td className="px-4 py-3 font-medium">{e.actor}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[11px] font-medium">
                      {e.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.target}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                    {e.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Showing 7 mock events · Async MVP · Audit retention is a planned capability.
        </p>
      </div>
    </AppShell>
  );
}
