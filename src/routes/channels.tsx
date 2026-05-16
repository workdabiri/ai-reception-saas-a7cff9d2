import { createFileRoute, Link } from "@tanstack/react-router";
import { MockBanner, PageHeader } from "@/components/ui-bits";
import { ChannelIcon } from "@/components/channel-icon";
import {
  channelOverview,
  type ChannelStatus,
  type ChannelHealth,
  type ChannelOverview,
} from "@/lib/mock-data";
import {
  ArrowUpRight,
  Inbox,
  Users,
  Clock,
  Activity,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/channels")({
  head: () => ({
    meta: [
      { title: "Channels — AI Reception" },
      {
        name: "description",
        content:
          "Channel overview: web chat, email, Instagram, WhatsApp, Telegram, SMS, voice.",
      },
    ],
  }),
  component: ChannelsPage,
});

const statusTone: Record<ChannelStatus, string> = {
  "Mock Active": "bg-success/10 text-success border-success/20",
  Planned: "bg-warning/15 text-warning-foreground border-warning/30",
  Future: "bg-muted text-muted-foreground border-border",
  "Not enabled in MVP": "bg-muted text-muted-foreground border-border",
};

const healthLabel: Record<ChannelHealth, string> = {
  healthy: "Healthy (mock)",
  degraded: "Degraded",
  offline: "Offline",
  "n/a": "Not connected",
};

const healthDot: Record<ChannelHealth, string> = {
  healthy: "bg-success",
  degraded: "bg-warning",
  offline: "bg-destructive",
  "n/a": "bg-muted-foreground/40",
};

function StatusPill({ status }: { status: ChannelStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 text-[11px] font-medium ${statusTone[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

function ChannelCard({ c }: { c: ChannelOverview }) {
  const isActive = c.status === "Mock Active";
  return (
    <div
      className={`group relative flex h-full min-w-[280px] flex-col rounded-2xl border bg-card p-5 shadow-soft transition hover:shadow-card ${
        isActive ? "border-border" : "border-dashed border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <ChannelIcon channel={c.key} />
        <StatusPill status={c.status} />
      </div>
      <h3 className="mt-4 text-base font-medium tracking-tight">{c.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
        {c.description}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Unread" value={c.unread} highlight={c.unread > 0} />
        <Stat label="Customers" value={c.customers} />
        <Stat label="Waiting" value={c.waiting} highlight={c.waiting > 0} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${healthDot[c.health]}`} />
          {healthLabel[c.health]}
        </span>
        <span className="tabular-nums">{c.lastMessage}</span>
      </div>

      {isActive ? (
        <Link
          to="/inbox"
          className="mt-4 inline-flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted"
        >
          Open in inbox <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <button
          disabled
          className="mt-4 inline-flex cursor-not-allowed items-center justify-between rounded-lg border border-dashed border-border bg-surface-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground"
        >
          Not enabled in MVP <Info className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface-muted/60 px-2 py-2">
      <div
        className={`text-base font-medium tabular-nums ${highlight ? "text-primary" : ""}`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function ChannelsPage() {
  const totals = channelOverview.reduce(
    (acc, c) => ({
      unread: acc.unread + c.unread,
      customers: acc.customers + c.customers,
      waiting: acc.waiting + c.waiting,
    }),
    { unread: 0, customers: 0, waiting: 0 },
  );

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8 space-y-6">
        <PageHeader
          title="Channels"
          description="See where messages come from, what's waiting, and which sources are live."
        />
        <MockBanner />

        {/* Totals */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Totals icon={Inbox} label="Total unread" value={totals.unread} tone="info" />
          <Totals icon={Users} label="Customers across channels" value={totals.customers} tone="primary" />
          <Totals icon={Clock} label="Waiting for operator" value={totals.waiting} tone="warning" />
          <Totals icon={Activity} label="Active sources" value={channelOverview.filter(c => c.status === "Mock Active").length} tone="success" />
        </div>

        {/* Cards — swipeable on mobile, grid on larger */}
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex gap-4 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {channelOverview.map((c) => (
              <div key={c.key} className="w-[280px] shrink-0 sm:w-auto">
                <ChannelCard c={c} />
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Channel data is mock. No provider SDK is connected. Operators send every reply.
        </p>
      </div>
    </>
  );
}

function Totals({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
  tone?: "neutral" | "info" | "primary" | "warning" | "success";
}) {
  const iconCls = {
    neutral: "bg-secondary text-secondary-foreground",
    info: "bg-info/10 text-info",
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning/15 text-warning-foreground dark:text-[var(--status-warning-text)]",
    success: "bg-success/10 text-success",
  }[tone];
  const accent = {
    neutral: "transparent",
    info: "var(--color-info)",
    primary: "var(--color-primary)",
    warning: "var(--color-attention)",
    success: "var(--color-success)",
  }[tone];
  return (
    <div
      style={{ ["--kpi-accent" as never]: accent }}
      className="kpi-accent relative overflow-hidden rounded-xl bg-surface px-6 py-5 shadow-card dark:shadow-none"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">{label}</span>
        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconCls}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="mt-3 text-[32px] font-medium leading-none tabular-nums tracking-tight text-foreground" style={{ fontFeatureSettings: '"tnum" 1' }}>
        {value}
      </div>
    </div>
  );
}
