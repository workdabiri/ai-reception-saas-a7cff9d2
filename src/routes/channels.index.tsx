import { createFileRoute, Link } from "@tanstack/react-router";
import { MockBanner, PageHeader } from "@/components/ui-bits";
import { ChannelIcon } from "@/components/channel-icon";
import { ChannelStateTag } from "@/components/channel-state-tag";
import { CHANNELS, CHANNEL_ORDER, type ChannelKey, type ChannelState } from "@/lib/channels";
import { ArrowUpRight, Inbox, Activity, Info, LayoutGrid } from "lucide-react";
import {
  useStateParam,
  presets as statePresets,
  RouteStatePage,
  RouteSkeleton,
} from "@/components/route-state";

export const Route = createFileRoute("/channels/")({
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

/**
 * Maps ChannelKey (registry) → channelId URL segment used in channels.$channelId.tsx.
 * The detail page uses slug-form IDs (web-chat, voice) rather than registry keys.
 */
const CHANNEL_ROUTE_ID: Record<ChannelKey, string> = {
  web_chat: "web-chat",
  email: "email",
  instagram: "instagram",
  whatsapp: "whatsapp",
  telegram: "telegram",
  facebook: "facebook",
  sms: "sms",
  call: "voice",
};

/**
 * Maps roadmapStatus → ChannelState for <ChannelIcon> and <ChannelStateTag>.
 * "future" is treated as not_connected (no adapter, no timeline).
 */
function roadmapToState(status: "active" | "planned" | "future"): ChannelState {
  switch (status) {
    case "active":
      return "active";
    case "planned":
      return "planned";
    case "future":
    default:
      return "not_connected";
  }
}

function ChannelCard({ channelKey }: { channelKey: ChannelKey }) {
  const c = CHANNELS[channelKey];
  const isActive = c.roadmapStatus === "active";
  const detailId = CHANNEL_ROUTE_ID[channelKey];
  const state = roadmapToState(c.roadmapStatus);

  return (
    <div
      className={`group relative flex h-full min-w-[280px] flex-col p-5 transition ${
        isActive
          ? "rounded-2xl border border-border bg-card shadow-soft hover:shadow-card"
          : "muted-card p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <ChannelIcon channel={channelKey} size="lg" state={state} />
        <ChannelStateTag state={state} />
      </div>
      <h3
        className={`mt-4 text-base tracking-tight ${
          isActive ? "font-medium" : "font-medium text-[color:var(--text-secondary)]"
        }`}
      >
        {c.label}
      </h3>
      <p
        className={`mt-1 line-clamp-2 text-xs ${
          isActive ? "text-muted-foreground" : "text-[color:var(--text-tertiary)]"
        }`}
      >
        {c.description}
      </p>

      {/* No per-channel stat grid.
          Unread / customers / waiting require a future channel summary API. */}

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

function ChannelsPage() {
  const stateOverride = useStateParam();
  if (stateOverride === "no-active") {
    return (
      <RouteStatePage title="Channels" description="Channel overview.">
        {statePresets.channelsNoActive()}
      </RouteStatePage>
    );
  }
  if (stateOverride === "provider-unavailable") {
    return (
      <RouteStatePage title="Channels">{statePresets.channelsProviderUnavailable()}</RouteStatePage>
    );
  }
  if (stateOverride === "loading") {
    return (
      <RouteStatePage title="Channels" description="Loading channels…">
        <RouteSkeleton variant="cards" />
      </RouteStatePage>
    );
  }

  // Honest product-roadmap counts sourced from the static registry.
  // These reflect integration status, not live runtime counts.
  const activeCount = CHANNEL_ORDER.filter((k) => CHANNELS[k].roadmapStatus === "active").length;
  const plannedCount = CHANNEL_ORDER.filter((k) => CHANNELS[k].roadmapStatus === "planned").length;
  const futureCount = CHANNEL_ORDER.filter((k) => CHANNELS[k].roadmapStatus === "future").length;
  const totalCount = CHANNEL_ORDER.length;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8 space-y-6">
        <PageHeader
          title="Channels"
          description="See where messages come from and which sources are live."
        />
        <MockBanner />

        {/* Channel roadmap summary — static product status, not live runtime counts. */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Totals icon={Activity} label="Active sources" value={activeCount} tone="success" />
          <Totals icon={Inbox} label="Planned channels" value={plannedCount} tone="info" />
          <Totals icon={Info} label="Future channels" value={futureCount} tone="neutral" />
          <Totals icon={LayoutGrid} label="Total channels" value={totalCount} tone="neutral" />
        </div>

        {/* Cards — swipeable on mobile, grid on larger */}
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex gap-4 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {CHANNEL_ORDER.map((key) => (
              <div key={key} className="w-[280px] shrink-0 sm:w-auto">
                <ChannelCard channelKey={key} />
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Per-channel statistics (unread, customers, waiting) require a future channel summary API.
          No provider SDK is connected. Operators send every reply.
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
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
          {label}
        </span>
        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconCls}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div
        className="mt-3 text-[32px] font-medium leading-none tabular-nums tracking-tight text-foreground"
        style={{ fontFeatureSettings: '"tnum" 1' }}
      >
        {value}
      </div>
    </div>
  );
}
