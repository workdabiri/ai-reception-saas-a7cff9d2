import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, MockBanner } from "@/components/ui-bits";
import {
  NoConversationsState,
  NoActiveWorkspaceState,
  AccessDeniedState,
  RemovedMemberState,
  AIUnavailableState,
  FutureProviderState,
  EmptyAuditState,
} from "@/components/empty-states";

export const Route = createFileRoute("/states")({
  head: () => ({
    meta: [
      { title: "Empty & error states — AI Reception" },
      {
        name: "description",
        content: "Reference gallery of empty, denied and unavailable states.",
      },
    ],
  }),
  component: StatesPage,
});

function StatesPage() {
  const items = [
    { name: "No conversations", node: <NoConversationsState /> },
    { name: "No active workspace", node: <NoActiveWorkspaceState /> },
    { name: "Access denied", node: <AccessDeniedState /> },
    { name: "Removed member", node: <RemovedMemberState /> },
    { name: "AI unavailable", node: <AIUnavailableState /> },
    { name: "Future provider", node: <FutureProviderState provider="WhatsApp" /> },
    { name: "Empty audit log", node: <EmptyAuditState /> },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
        <PageHeader
          title="Empty & error states"
          description="Reference gallery used across the prototype. Calm, helpful and trust-building."
        />
        <MockBanner />

        <div className="grid gap-5 lg:grid-cols-2">
          {items.map((it) => (
            <section
              key={it.name}
              className="rounded-2xl border border-border bg-card p-3 shadow-soft"
            >
              <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {it.name}
              </div>
              {it.node}
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
