import { createFileRoute, Link } from "@tanstack/react-router";
import { MockBanner, PageHeader } from "@/components/ui-bits";
import { ChannelIcon } from "@/components/channel-icon";
import { ChannelStateTag } from "@/components/channel-state-tag";
import type { ChannelState } from "@/lib/channels";
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
import {
  useStateParam,
  presets as statePresets,
  RouteStatePage,
  RouteSkeleton,
} from "@/components/route-state";

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

function statusToState(status: ChannelStatus): ChannelState {
  switch (status) {
    case "Mock Active":
      return "active";
    case "Planned":
      return "planned";
    case "Future":
    case "Not enabled in MVP":
    default:
      return "not_connected";
  }
}

const ROUTE_ID: Record<string, string> = {
  webchat: "web-chat",
  email: "email",
  instagram: "instagram",
  whatsapp: "whatsapp",
  telegram: "telegram",
  sms: "sms",
  facebook: "facebook",
  voice: "voice",
};

function ChannelCard({ c }: { c: ChannelOverview }) {
  const isActive = c.status === "Mock Active";
  const detailId = ROUTE_ID[c.key] ?? c.key;
  return (
    <div
      className={`group relative flex h-full min-w-[280px] flex-col p-5 transition ${
        isActive
          ? "rounded-2xl border border-border bg-card shadow-soft hover:shadow-card"
          : "muted-card p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <ChannelIcon channel={c.key} size="lg" state={statusToState(c.status)} />
        <ChannelStateTag state={statusToState(c.status)} />
      </div>
      <h3
        className={`mt-4 text-base tracking-tight ${
          isActive
            ? "font-medium"
            : "font-medium text-[color:var(--text-secondary)]"
        }`}
      >
        {c.name}
      </h3>
      <p
        className={`mt-1 line-clamp-2 text-xs ${
          isActive ? "text-muted-foreground" : "text-[color:var(--text-tertiary)]"
        }`}
      >
        {c.description}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Unread" value={c.unread} highlight={c.unread > 0} muted={!isActive} />
        <Stat label="Customers" value={c.customers} muted={!isActive} />
        <Stat label="Waiting" value={c.waiting} highlight={c.waiting > 0} muted={!isActive} />
      </div>

      <div
        className={`mt-4 flex items-center justify-between border-t pt-3 text-[11px] ${
          isActive
            ? "border-border/70 text-muted-foreground"
            : "border-[color:var(--border-subtle)] text-[color:var(--text-tertiary)]"
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isActive ? healthDot[c.health] : "bg-[color:var(--text-disabled)]"
            }`}
          />
          {healthLabel[c.health]}
        </span>
        <span className="tabular-nums">{c.lastMessage}</span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {isActive ? (
          <Link
            to="/inbox"
            className="inline-flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-muted"
          >
            Open in inbox <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <button
            disabled
            className="muted-cta inline-flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium"
          >
            Not enabled in MVP <Info className="h-3.5 w-3.5" />
          </button>
        )}
        <Link
          to="/channels/$channelId"
          params={{ channelId: detailId }}
          className="inline-flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-muted"
        >
          {isActive ? "View setup" : "Configure"} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-2 py-2 ${
        muted ? "bg-[color:var(--bg-app)]" : "bg-surface-muted/60"
      }`}
    >
      <div
        className={`text-base font-medium tabular-nums ${
          muted
            ? "text-[color:var(--text-tertiary)]"
            : highlight
              ? "text-primary"
              : ""
        }`}
      >
        {value}
      </div>
      <div
        className={`text-[10px] uppercase tracking-wider ${
          muted ? "text-[color:var(--text-disabled)]" : "text-muted-foreground"
        }`}
      >
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
  // Icon-only tiles (h-8 w-8 holding a single <Icon/>): variant text-* sets
  // the icon's currentColor, not body text. Exempt from the contrast rule.
  /* eslint-disable local/no-pill-contrast-violation */
  const iconCls = {
    neutral: "bg-secondary text-secondary-foreground",
    info: "bg-info/10 text-info",
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/10 text-success",
  }[tone];
  /* eslint-enable local/no-pill-contrast-violation */
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
