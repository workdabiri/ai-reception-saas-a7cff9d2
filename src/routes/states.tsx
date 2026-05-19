import { createFileRoute } from "@tanstack/react-router";
import { MockBanner } from "@/components/ui-bits";
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
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card lg:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
            Reference gallery
          </p>
          <h1 className="mt-2 text-display text-3xl font-medium tracking-tight lg:text-4xl">
            Empty &amp; error states
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every state across the prototype — calm, helpful, trust-building. Each one includes a
            clear icon, a status badge, a primary action where relevant, and a short hint to guide
            the operator.
          </p>
        </div>
        <MockBanner />

        <div className="grid gap-5 lg:grid-cols-2">
          {items.map((it) => (
            <section
              key={it.name}
              className="rounded-2xl border border-border bg-card p-3 shadow-soft"
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  {it.name}
                </span>
                <span className="rounded-md border border-border bg-surface-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                  Preview
                </span>
              </div>
              {it.node}
            </section>
          ))}
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-medium text-foreground">Route state previews</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Append <code className="rounded bg-surface-muted px-1">?state=…</code> to a real route
            to preview a mock state.
          </p>
          <ul className="mt-3 grid gap-1.5 text-[12.5px] sm:grid-cols-2">
            {[
              ["/inbox?state=empty", "Inbox — empty"],
              ["/inbox?state=ai-unavailable", "Inbox — AI unavailable"],
              ["/inbox?state=low-confidence", "Inbox — low-confidence draft"],
              ["/inbox?state=loading", "Inbox — loading"],
              ["/inbox?state=access-denied", "Inbox — access denied"],
              ["/customers?state=empty", "Customers — empty"],
              ["/customers?state=access-denied", "Customers — access denied"],
              ["/audit?state=empty", "Audit — empty"],
              ["/audit?state=access-denied", "Audit — access denied"],
              ["/audit?state=error", "Audit — error"],
              ["/members?state=empty", "Members — empty"],
              ["/members?state=pending", "Members — invites pending"],
              ["/members?state=access-denied", "Members — access denied"],
              ["/channels?state=no-active", "Channels — none active"],
              ["/channels?state=provider-unavailable", "Channels — provider unavailable"],
              ["/channels/web-chat?state=provider-unavailable", "Web Chat — provider unavailable"],
              ["/channels/whatsapp?state=planned", "WhatsApp — planned"],
              ["/settings?state=access-denied", "Settings — access denied"],
              ["/settings/ai?state=ai-unavailable", "AI Settings — AI unavailable"],
              ["/knowledge?state=empty", "Knowledge — empty"],
              ["/notifications?state=empty", "Notifications — empty"],
              ["/profile?state=session-expired", "Profile — session expired"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-primary hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
