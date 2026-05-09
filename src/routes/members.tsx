import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Avatar, PageHeader } from "@/components/ui-bits";
import { members } from "@/lib/mock-data";
import { Plus, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members — AI Reception" },
      { name: "description", content: "Manage operators, admins and viewers." },
    ],
  }),
  component: MembersPage,
});

const roleTone: Record<string, string> = {
  Owner: "bg-primary/10 text-primary border-primary/20",
  Admin: "bg-info/10 text-info border-info/20",
  Operator: "bg-success/10 text-success border-success/20",
  Viewer: "bg-muted text-muted-foreground border-border",
};

function MembersPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        <PageHeader
          title="Members"
          description="Owner, admin, operator and viewer roles for this workspace."
          action={
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-95">
              <Plus className="h-3.5 w-3.5" /> Invite member
            </button>
          }
        />

        <div className="mt-6 rounded-xl border border-border bg-card shadow-card divide-y divide-border">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-4 p-4">
              <Avatar initials={m.initials} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{m.name}</span>
                  {m.status === "Invited" && (
                    <span className="rounded-md border border-warning/30 bg-warning/15 px-1.5 py-0.5 text-[11px] font-medium text-warning-foreground">
                      Invite pending
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{m.email}</div>
              </div>
              <span
                className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${roleTone[m.role]}`}
              >
                {m.role}
              </span>
              <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-border bg-surface p-5">
          <h3 className="text-sm font-semibold">Roles &amp; permissions</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Roles are visualized in the prototype. Permission enforcement is a planned capability.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              ["Owner", "Full access to workspace, billing and members."],
              ["Admin", "Manage members, settings and all conversations."],
              ["Operator", "Reply to conversations and manage customers."],
              ["Viewer", "Read-only access to inbox and customer context."],
            ].map(([role, desc]) => (
              <div key={role} className="rounded-lg border border-border bg-card p-3">
                <div className="text-sm font-semibold">{role}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
