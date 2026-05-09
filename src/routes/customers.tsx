import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Avatar, PageHeader } from "@/components/ui-bits";
import { customers } from "@/lib/mock-data";
import { Search, Plus, Download } from "lucide-react";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — AI Reception" },
      { name: "description", content: "Customer directory and context for operators." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <PageHeader
          title="Customers"
          description="Everyone who has reached out. Mock data for the prototype."
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

        <div className="mt-6 rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search customers"
                className="h-9 w-full rounded-lg border border-input bg-surface pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {customers.length} customers
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left">
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">Phone</th>
                <th className="px-4 py-2.5 font-medium">Tags</th>
                <th className="px-4 py-2.5 font-medium text-right">Conversations</th>
                <th className="px-4 py-2.5 font-medium text-right">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-surface-muted/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={c.initials} />
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.length === 0 && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.conversations}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {c.lastSeen}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
