import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MockBanner, PageHeader } from "@/components/ui-bits";
import { ChannelCard } from "@/components/channel-card";
import { channels } from "@/lib/mock-data";
import { Info } from "lucide-react";

export const Route = createFileRoute("/channels")({
  head: () => ({
    meta: [
      { title: "Channels — AI Reception" },
      {
        name: "description",
        content: "Channel overview: web chat, email, Instagram, WhatsApp, Telegram, SMS, voice.",
      },
    ],
  }),
  component: ChannelsPage,
});

function ChannelsPage() {
  const totalUnread = channels.reduce((s, c) => s + c.unread, 0);
  const totalCustomers = channels.reduce((s, c) => s + c.customers, 0);
  const totalWaiting = channels.reduce((s, c) => s + c.waiting, 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-8">
        <PageHeader
          title="Channels"
          description="Where customers reach you. See volume, unread counts, and waiting conversations per source."
        />

        <MockBanner />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Channels live (mock)" value="2" />
          <Kpi label="Unread across all channels" value={totalUnread} tone="primary" />
          <Kpi label="Customers reachable" value={totalCustomers} />
          <Kpi label="Waiting for operator" value={totalWaiting} tone="warning" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {channels.map((c) => (
            <ChannelCard key={c.id} c={c} />
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-muted/60 p-4 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            Channel statuses reflect MVP scope. Web Chat and Email surface mock activity for the prototype.
            Instagram, WhatsApp, Telegram, SMS, and Voice are <span className="font-medium text-foreground">planned or future</span> —
            no real provider is connected. No backend, no auto-reply, no realtime.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  tone?: "neutral" | "primary" | "warning";
}) {
  const ring =
    tone === "primary"
      ? "ring-primary/20"
      : tone === "warning"
        ? "ring-warning/30"
        : "ring-border";
  const accent =
    tone === "primary"
      ? "text-primary"
      : tone === "warning"
        ? "text-warning-foreground"
        : "text-foreground";
  return (
    <div className={`rounded-xl border border-border bg-card p-4 shadow-soft ring-1 ${ring}`}>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1.5 text-2xl font-semibold tabular-nums ${accent}`}>{value}</div>
    </div>
  );
}
