import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Inbox,
  Timer,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  ArrowRight,
  Repeat2,
  Calendar,
  ChevronDown,
  Search,
  Filter,
  CircleDot,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";
import { Avatar, MockBanner, StatusChip } from "@/components/ui-bits";
import { ChannelIcon } from "@/components/channel-icon";
import { channelOverview } from "@/lib/mock-data";
import { useBusinessContext } from "@/contexts/business-context";
import { useAuditEvents } from "@/hooks/use-audit-events";
import { useConversations } from "@/hooks/use-conversations";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import type {
  ConversationStatus,
  ChannelType,
  MessageDirection,
  MessageSenderType,
} from "@/lib/api-types";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Operations Command Center — AI Reception" },
      {
        name: "description",
        content:
          "Operator-first reception workspace. Review AI drafts, triage customer conversations, and monitor team workload.",
      },
    ],
  }),
  component: DashboardPage,
});

type Tone = "info" | "warning" | "attention" | "ai" | "danger" | "success" | "neutral";

// Neutral-first KPIs: only states that *demand* attention carry a semantic
// tint. Operational counts (Open) stay fully neutral so the row reads as one
// premium card family, not five colorful tiles.
//
// KPI definitions — matches backend aggregate contract (PR #77):
// - openConversations: all non-RESOLVED conversations
// - waitingForOperator: conversations in WAITING_OPERATOR status
// - needsFollowUp: active convs where last msg is INBOUND and >24h old
// - draftsPendingReview: aiDraftStatus=READY, not RESOLVED
// - accessAlerts: DENIED audit events in last 24h (null = lacks audit.read)
type KpiCard = {
  label: string;
  hint: string;
  icon: typeof Inbox;
  tone: Tone;
};

const KPI_CARDS: KpiCard[] = [
  {
    label: "Open conversations",
    hint: "All active conversations",
    icon: Inbox,
    tone: "info",
  },
  {
    label: "Waiting for operator",
    hint: "Awaiting operator reply",
    icon: Timer,
    tone: "warning",
  },
  {
    label: "Needs follow-up",
    hint: "Inbound, older than 24h",
    icon: Repeat2,
    tone: "attention",
  },
  {
    label: "Drafts pending review",
    hint: "Human review required",
    icon: Sparkles,
    tone: "ai",
  },
  {
    label: "Access alerts",
    hint: "DENIED events in last 24h",
    icon: ShieldAlert,
    tone: "danger",
  },
];

// Icon-only wrappers: the variant text-* sets the icon's currentColor on a
// soft tinted tile; no body text is rendered inside. Exempt from the
// Golden Contrast Rule (which targets text-bearing pills).
/* eslint-disable local/no-pill-contrast-violation */
const iconTone: Record<Tone, string> = {
  neutral: "bg-secondary text-muted-foreground",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-foreground",
  attention: "bg-attention/10 text-foreground",
  ai: "bg-ai-soft text-ai",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
};
/* eslint-enable local/no-pill-contrast-violation */

const toneAccent: Record<Tone, string> = {
  neutral: "transparent",
  info: "var(--color-info)",
  warning: "var(--color-warning)",
  attention: "var(--color-attention)",
  ai: "var(--color-ai)",
  danger: "var(--color-destructive)",
  success: "var(--color-success)",
};

// ---------------------------------------------------------------------------
// Audit display helpers
// ---------------------------------------------------------------------------

/** Derives 2-char initials for the audit avatar.
 * For USER actors with enriched display info, derives from user name.
 * Falls back to type-based initials when actorUser is absent.
 */
function auditActorInitials(actorType: string, actorUserName?: string): string {
  if (actorType === "AI_RECEPTIONIST") return "AI";
  if (actorType === "SYSTEM") return "SY";
  // USER
  if (actorUserName) {
    const parts = actorUserName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] ?? "?").toUpperCase() + (parts[1][0] ?? "").toUpperCase();
    }
    return (actorUserName[0] ?? "?").toUpperCase() + (actorUserName[1] ?? "").toUpperCase();
  }
  return "US"; // USER — no name available
}

/**
 * Formats a raw action string (e.g. "member.invited") for display.
 * Capitalises the verb fragment and replaces dots with spaces.
 */
function formatAction(action: string): string {
  const parts = action.split(".");
  // e.g. "member.invited" → "member invited"
  return parts.join(" ");
}

/** Formats an ISO timestamp to a short local time string. */
function fmtAuditTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * Formats the dashboard summary generatedAt timestamp to a compact
 * "Updated HH:MM" string. Returns null on missing/invalid input so the
 * caller can suppress the element entirely.
 */
function fmtGeneratedAt(iso: string | undefined): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return null;
    return `Updated ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return null;
  }
}

/** Parses an ISO timestamp to ms-since-epoch for sort comparisons. Returns 0 on invalid input. */
function auditTimeMs(iso: string): number {
  const value = Date.parse(iso);
  return Number.isFinite(value) ? value : 0;
}

/** Sort key: oldest waiting first. Returns 0 on invalid dates so they sink to bottom. */
type QueueChipStatus = "new" | "open" | "waiting" | "urgent" | "closed";

/** Map real ConversationStatus to a StatusChip-compatible key */
const CONV_STATUS_CHIP: Record<ConversationStatus, QueueChipStatus> = {
  NEW: "new",
  OPEN: "open",
  ASSIGNED: "open",
  WAITING_CUSTOMER: "waiting",
  WAITING_OPERATOR: "waiting",
  ESCALATED: "urgent",
  RESOLVED: "closed",
};

/** Map real ChannelType to a display label */
const CHANNEL_DISPLAY: Record<ChannelType, string> = {
  WEBSITE_CHAT: "Web Chat",
  INTERNAL: "Internal",
};

/** Statuses that should appear in the attention queue (non-resolved) */
const ACTIVE_STATUSES: ReadonlySet<ConversationStatus> = new Set([
  "NEW",
  "OPEN",
  "ASSIGNED",
  "WAITING_CUSTOMER",
  "WAITING_OPERATOR",
  "ESCALATED",
]);

/** Calculate human-readable relative wait time from an ISO string. Returns "—" on invalid input. */
function calcWait(iso: string | null | undefined): string {
  if (!iso) return "—";
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "—";
  const diff = Math.max(0, Date.now() - ms);
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(diff / 86_400_000);
  return `${days}d`;
}

/** Formats an ISO timestamp to compact relative time for recent messages. */
function fmtRecentTime(iso: string): string {
  try {
    const ms = Date.parse(iso);
    if (!Number.isFinite(ms)) return "\u2014";
    const diff = Math.max(0, Date.now() - ms);
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(diff / 3_600_000);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(diff / 86_400_000);
    if (days < 7) return `${days}d`;
    return new Date(ms).toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "\u2014";
  }
}

/** Returns a concise direction/sender label for the recent messages panel. */
function recentMsgDirectionLabel(
  direction: MessageDirection | null,
  senderType: MessageSenderType | null,
): string | null {
  if (direction === "INTERNAL") return "Internal";
  if (direction === "SYSTEM" || senderType === "SYSTEM") return "System";
  if (senderType === "AI_RECEPTIONIST") return "AI";
  if (direction === "INBOUND" || senderType === "CUSTOMER") return "Inbound";
  if (direction === "OUTBOUND" || senderType === "OPERATOR") return "Outbound";
  return null;
}

/** Sort key: oldest waiting first. Returns 0 on invalid dates so they sink to bottom. */
function queueSortKey(iso: string | null | undefined): number {
  if (!iso) return Number.MAX_SAFE_INTEGER;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : Number.MAX_SAFE_INTEGER;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function DashboardPage() {
  const { businessId, businesses } = useBusinessContext();
  const activeBusiness = businesses.find((b) => b.id === businessId) ?? businesses[0];
  const businessName = activeBusiness?.name;

  const {
    data: auditData,
    isLoading: auditLoading,
    error: auditError,
  } = useAuditEvents(businessId);

  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations(businessId, { limit: 12 });
  // limit increased to 12 (was 8) so the single shared query has enough
  // conversations to populate both the attention queue and recent messages
  // without a second API call.

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useDashboardSummary(businessId);

  // Whether the current user lacks audit.read (403 = OPERATOR or VIEWER)
  const auditForbidden = auditError?.isForbidden ?? false;

  // Latest 5 events for the dashboard panel, sorted defensively by createdAt.
  const recentAuditEvents = [...(auditData ?? [])]
    .sort((a, b) => auditTimeMs(b.createdAt) - auditTimeMs(a.createdAt))
    .slice(0, 5);

  // Active queue: filter resolved, sort oldest-waiting first.
  const queueRows = [...(conversationsData?.data ?? [])]
    .filter((c) => ACTIVE_STATUSES.has(c.status))
    .sort(
      (a, b) =>
        queueSortKey(a.lastMessageAt ?? a.updatedAt ?? a.createdAt) -
        queueSortKey(b.lastMessageAt ?? b.updatedAt ?? b.createdAt),
    );

  // Recent messages: conversations with real last-message content, newest first.
  const recentRows = [...(conversationsData?.data ?? [])]
    .filter((c) => !!c.lastMessageContent?.trim())
    .sort((a, b) => {
      const ta = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
      const tb = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
    })
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8 space-y-6">
      {/* Command bar header — neutral, premium */}
      <header className="rounded-2xl border border-border bg-card shadow-xs dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-8 lg:py-4">
          <div className="min-w-0 flex items-center gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary ring-1 ring-primary/15">
              <CircleDot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-2 py-1 text-foreground ring-1 ring-inset ring-success/25">
                  <span className="live-indicator-dot !h-1.5 !w-1.5" />
                  Live
                </span>
                <span className="truncate text-foreground/80 font-medium">
                  {businessName ?? "—"}
                </span>
              </div>
              <h1 className="mt-1 truncate text-[20px] font-medium tracking-tight leading-tight text-foreground">
                Operations <span className="text-muted-foreground">Command Center</span>
              </h1>
              <p className="mt-1 hidden sm:block text-[13px] text-muted-foreground max-w-[480px] leading-relaxed">
                Triage AI-prepared drafts, monitor channel health, and keep every customer reply
                human-reviewed.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="hidden md:inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 h-9 text-[12px] font-medium text-foreground/80 hover:bg-secondary">
              <Calendar className="h-3.5 w-3.5" />
              Today
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
            <button className="hidden lg:inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 h-9 text-[12px] font-medium text-muted-foreground hover:bg-secondary">
              <Search className="h-3.5 w-3.5" />
              <span>Search…</span>
              <kbd className="ml-2 rounded border border-border bg-secondary px-1 py-1 text-[10px]">
                ⌘K
              </kbd>
            </button>
            <Link
              to="/channels"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 h-9 text-[12px] font-medium text-foreground/80 hover:bg-secondary"
            >
              Channels
            </Link>
            <Link
              to="/inbox"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 h-9 text-[12.5px] font-medium text-primary-foreground shadow-soft hover:bg-primary/90 active:translate-y-px"
            >
              Open inbox <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <MockBanner />

      {/* KPI row — live aggregate metrics from backend dashboard summary API */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 px-0.5">
          {/* generatedAt timestamp — shown only when data is available */}
          {summaryData?.generatedAt && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {fmtGeneratedAt(summaryData.generatedAt)}
            </span>
          )}
          {summaryError && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-destructive/80">
              <AlertCircle className="h-3 w-3" />
              Could not load KPIs
            </span>
          )}
        </div>
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {KPI_CARDS.map((card, idx) => {
            const Icon = card.icon;

            // Resolve live value from summary, fall back gracefully
            let displayValue: string;
            let displayHint = card.hint;

            if (summaryLoading) {
              displayValue = "…";
            } else if (summaryError) {
              displayValue = "—";
            } else if (summaryData) {
              // Index-aligned to KPI_CARDS order
              const raw = [
                summaryData.openConversations,
                summaryData.waitingForOperator,
                summaryData.needsFollowUp,
                summaryData.draftsPendingReview,
                summaryData.accessAlerts,
              ][idx];

              if (raw === null) {
                // accessAlerts === null means caller lacks audit.read
                displayValue = "—";
                displayHint = "Requires audit access";
              } else {
                displayValue = String(raw);
              }
            } else {
              displayValue = "—";
            }

            return (
              <div
                key={card.label}
                style={{ ["--kpi-accent" as never]: toneAccent[card.tone] }}
                className="kpi-accent group relative overflow-hidden rounded-xl bg-surface py-5 px-6 shadow-card transition hover:shadow-elev"
              >
                <div className="relative flex items-start justify-between gap-2">
                  <span className="text-[10.5px] font-medium uppercase tracking-[0.10em] text-muted-foreground">
                    {card.label}
                  </span>
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconTone[card.tone]}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="relative mt-4">
                  <div
                    className={`text-[32px] font-medium leading-none tabular-nums tracking-tight ${summaryLoading ? "text-muted-foreground/40" : "text-foreground"}`}
                  >
                    {displayValue}
                  </div>
                </div>
                <div className="relative mt-2 text-[12px] leading-snug text-muted-foreground truncate">
                  {displayHint}
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* Today's queue + recent messages */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-medium tracking-tight">Today's attention queue</h2>
                <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground ring-1 ring-inset ring-border">
                  {conversationsLoading ? "…" : `${queueRows.length} items`}
                </span>
              </div>
              <p className="text-[11.5px] text-muted-foreground">
                Triage in order — oldest waiting first.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-disabled="true"
                className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[11.5px] font-medium text-foreground/40 cursor-not-allowed select-none"
                title="Filter coming soon"
              >
                <Filter className="h-3 w-3" /> Filter
              </button>
              <Link
                to="/inbox"
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
              >
                View inbox <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            {conversationsLoading ? (
              /* Loading skeleton */
              <div className="divide-y divide-border">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    <div className="h-7 w-7 rounded-full bg-secondary animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-1/3 rounded bg-secondary animate-pulse" />
                      <div className="h-2 w-1/2 rounded bg-secondary animate-pulse" />
                    </div>
                    <div className="h-5 w-16 rounded-full bg-secondary animate-pulse" />
                    <div className="h-5 w-10 rounded bg-secondary animate-pulse" />
                  </div>
                ))}
              </div>
            ) : conversationsError ? (
              /* Error state */
              <div className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                <p className="text-[12px] font-medium text-foreground">Could not load queue</p>
                <p className="text-[11px] text-muted-foreground max-w-[200px] leading-relaxed">
                  {conversationsError.message ?? "An error occurred loading conversations."}
                </p>
              </div>
            ) : queueRows.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-success/10 ring-1 ring-success/20">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <p className="text-[12px] font-medium text-foreground">Queue is clear</p>
                <p className="text-[11px] text-muted-foreground">
                  No active conversations in the queue.
                </p>
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <thead className="bg-surface-muted/60 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Customer</th>
                    <th className="px-3 py-3 text-left font-medium">Subject</th>
                    <th className="px-3 py-3 text-left font-medium">Channel</th>
                    <th className="px-3 py-3 text-left font-medium">Status</th>
                    <th className="px-3 py-3 text-left font-medium">Waiting</th>
                    <th className="px-5 py-3 text-left font-medium">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {queueRows.map((conv) => {
                    const chipKey = CONV_STATUS_CHIP[conv.status] ?? "open";
                    const channelDisplay = CHANNEL_DISPLAY[conv.channel] ?? conv.channel;
                    const customerLabel = conv.customerId
                      ? `Customer \u2022 ${conv.customerId.slice(0, 8)}`
                      : "Unknown customer";
                    const customerInitials = conv.customerId
                      ? conv.customerId.slice(0, 2).toUpperCase()
                      : "??";
                    const waitIso = conv.lastMessageAt ?? conv.updatedAt ?? conv.createdAt;
                    return (
                      <tr key={conv.id} className="group transition hover:bg-surface-muted/40">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar initials={customerInitials} size="sm" />
                            <span className="font-medium text-muted-foreground text-[12px]">
                              {customerLabel}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-foreground/80 max-w-[220px] truncate">
                          {conv.subject ?? "No subject"}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground ring-1 ring-inset ring-border">
                            {channelDisplay}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <StatusChip status={chipKey} />
                        </td>
                        <td className="px-3 py-3 text-muted-foreground font-mono-tab text-[12px]">
                          {calcWait(waitIso)}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {conv.assignedUserId ? (
                            <span className="text-foreground/80">Assigned</span>
                          ) : (
                            <span className="italic text-foreground/60">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-xl border border-border bg-card shadow-card flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-[14px] font-medium">Recent messages</h2>
              <p className="text-[11.5px] text-muted-foreground">Latest inbound activity.</p>
            </div>
            <Link
              to="/inbox"
              className="text-[12px] font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {conversationsLoading ? (
            /* Loading skeleton */
            <div className="divide-y divide-border flex-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3">
                  <div className="h-8 w-8 rounded-full bg-secondary animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 w-1/2 rounded bg-secondary animate-pulse" />
                    <div className="h-2 w-3/4 rounded bg-secondary animate-pulse" />
                    <div className="h-2 w-1/3 rounded bg-secondary animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversationsError ? (
            /* Error state */
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center flex-1">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
              <p className="text-[12px] font-medium text-foreground">Could not load messages</p>
              <p className="text-[11px] text-muted-foreground max-w-[180px] leading-relaxed">
                {conversationsError.message ?? "An error occurred."}
              </p>
            </div>
          ) : recentRows.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center flex-1">
              <p className="text-[12px] text-muted-foreground">No recent messages yet.</p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-border">
              {recentRows.map((conv) => {
                const customerLabel = conv.customerId
                  ? `Customer \u2022 ${conv.customerId.slice(0, 8)}`
                  : "Unknown customer";
                const customerInitials = conv.customerId
                  ? conv.customerId.slice(0, 2).toUpperCase()
                  : "??";
                const channelDisplay = CHANNEL_DISPLAY[conv.channel] ?? conv.channel;
                const dirLabel = recentMsgDirectionLabel(
                  conv.lastMessageDirection,
                  conv.lastMessageSenderType,
                );
                const timeDisplay = conv.lastMessageAt
                  ? fmtRecentTime(conv.lastMessageAt)
                  : "\u2014";
                const snippet = conv.lastMessageContent?.trim() ?? "";
                return (
                  <li key={conv.id}>
                    <Link
                      to="/inbox/$conversationId"
                      params={{ conversationId: conv.id }}
                      className="flex gap-3 px-4 py-3 transition hover:bg-surface-hover"
                    >
                      <Avatar initials={customerInitials} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[12px] font-medium text-muted-foreground">
                            {customerLabel}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground font-mono-tab">
                            {timeDisplay}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[12px] text-foreground/80 leading-[1.4]">
                          {snippet}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="inline-flex items-center rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground ring-1 ring-inset ring-border">
                            {channelDisplay}
                          </span>
                          {dirLabel && (
                            <span className="inline-flex items-center rounded-full bg-secondary/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
                              {dirLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Channel command center + AI drafts */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-primary">
                Channel command center
              </p>
              <h2 className="mt-1 text-[13px] font-medium tracking-tight">
                Where customers reach you
              </h2>
            </div>
            <Link
              to="/channels"
              className="text-[11.5px] font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              All sources <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-3 sm:p-4">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
            >
              {channelOverview.map((c) => {
                // Normalize display state from mock-data without mutating source.
                //
                // Backend currently only supports WEBSITE_CHAT conversations.
                // Only web_chat is treated as operationally active in this surface.
                // Email is demoted from "Mock Active" to Planned — no backend channel
                // type or adapter exists for email yet.
                // All other channels remain Planned/Future as in mock-data.
                const active = c.key === "webchat";
                const planned = c.key !== "webchat" && c.status !== "Future";

                return (
                  <Link
                    key={c.key}
                    to={active ? "/inbox" : "/channels"}
                    className={`group relative flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card ${active ? "border-border hover:border-primary/30" : "border-dashed border-border/80 bg-surface-muted/40"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`grid h-9 w-9 place-items-center rounded-lg ring-1 ring-inset ${active ? "bg-primary-soft ring-primary/15" : "bg-secondary ring-border"}`}
                      >
                        <ChannelIcon channel={c.key} size={20} />
                      </div>
                      {active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[9.5px] font-medium uppercase tracking-wider text-foreground ring-1 ring-success/25">
                          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Active
                        </span>
                      ) : (
                        <span
                          className={`rounded-full px-2 py-1 text-[9.5px] font-medium uppercase tracking-wider ring-1 ring-inset ${planned ? "bg-secondary text-muted-foreground ring-border" : "bg-surface-muted text-muted-foreground/70 ring-border"}`}
                        >
                          {c.status === "Future" ? "Future" : "Planned"}
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] font-medium tracking-tight truncate">{c.name}</div>
                    {/* Description-only footer for all cards.
                        Fabricated unread/customers/waiting/lastMessage stats removed —
                        per-channel aggregates require a future channel summary API. */}
                    <div
                      className={`border-t pt-2 text-[10.5px] leading-snug text-muted-foreground/90 ${active ? "border-border/70" : "border-dashed border-border/70"}`}
                    >
                      {active
                        ? "Website chat is the currently supported customer channel. Live counts require a future channel summary API."
                        : c.description}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary ring-1 ring-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="text-[13px] font-medium tracking-tight">AI draft review</h2>
                <p className="text-[11px] text-muted-foreground">Operator sends every reply.</p>
              </div>
            </div>
            <span className="rounded-md border border-primary/20 bg-primary-soft px-2 py-1 text-[10px] font-medium text-primary uppercase tracking-wider">
              Human review
            </span>
          </div>
          {/* AI Draft Assist is a Stage 2 feature (R9 — Not Started).
              No draft content, confidence scores, or approve/reject endpoints
              exist in the backend yet. Fabricated rows removed. */}
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary ring-1 ring-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[13px] font-medium tracking-tight">AI Draft Assist — Stage 2</p>
              <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                When enabled, AI-generated reply suggestions will appear here for operator review
                before sending.
              </p>
            </div>
            <p className="text-[10.5px] text-muted-foreground/70">
              Every reply remains human-reviewed and human-sent.
            </p>
          </div>
        </div>
      </section>

      {/* Operator workload + Audit + Planned */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-[13px] font-medium tracking-tight">Operator workload</h2>
            <p className="text-[11.5px] text-muted-foreground">
              Workload analytics require a dedicated endpoint.
            </p>
          </div>
          {/* Operator Workload requires a per-operator aggregate endpoint.
              No groupBy, no resolvedAt timestamp, no presence model exist.
              OPERATOR lacks members.read — client-side derivation is not
              RBAC-safe. AI Draft counts (R9) not yet built. Fabricated rows
              removed. Real workload analytics are planned for Stage 2. */}
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-muted-foreground ring-1 ring-border">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[13px] font-medium tracking-tight">Workload analytics — Stage 2</p>
              <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                Per-operator assignment counts require a dedicated workload endpoint.
              </p>
            </div>
            <p className="text-[10.5px] text-muted-foreground/70">
              Assignment distribution, resolution rates, and team capacity will appear here when
              backend aggregation is available.
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-[13px] font-medium tracking-tight">Trust &amp; access</h2>
              <p className="text-[11.5px] text-muted-foreground">Recent audit activity.</p>
            </div>
            <Link
              to="/audit"
              className="text-[11.5px] font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              Full log <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Permission gate: OPERATOR + VIEWER lack audit.read */}
          {auditForbidden ? (
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary ring-1 ring-border">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-[12px] font-medium text-foreground">Audit log restricted</p>
              <p className="text-[11px] text-muted-foreground max-w-[180px] leading-relaxed">
                Audit access requires Owner or Admin role.
              </p>
            </div>
          ) : auditLoading ? (
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="h-7 w-7 rounded-full bg-secondary animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 w-3/4 rounded bg-secondary animate-pulse" />
                    <div className="h-2 w-1/2 rounded bg-secondary animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentAuditEvents.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-muted-foreground">
              No audit events yet.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentAuditEvents.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-medium text-secondary-foreground ring-1 ring-border">
                    {auditActorInitials(e.actorType, e.actorUser?.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] truncate">
                      <span className="font-medium">
                        {e.actorType === "AI_RECEPTIONIST"
                          ? "AI Receptionist"
                          : e.actorType === "SYSTEM"
                            ? "System"
                            : (e.actorUser?.name ?? "User")}
                      </span>{" "}
                      <span className="text-muted-foreground">{formatAction(e.action)}</span>
                    </div>
                    <div className="text-[10.5px] text-muted-foreground tabular-nums">
                      {fmtAuditTime(e.createdAt)}
                    </div>
                  </div>
                  <StatusChip
                    status={
                      e.result === "DENIED" || e.result === "FAILED" ? "access-denied" : "open"
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3 rounded-xl border border-border bg-card shadow-card p-5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-[13px] font-medium tracking-tight">Planned capabilities</h3>
              <p className="text-[11px] text-muted-foreground">Roadmap.</p>
            </div>
          </div>
          <ul className="mt-3 space-y-2 text-[12px]">
            {[
              "WhatsApp channel",
              "SMS channel",
              "Voice reception",
              "Realtime live chat",
              "Billing & subscriptions",
            ].map((p) => (
              <li
                key={p}
                className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2"
              >
                <span className="truncate">{p}</span>
                <StatusChip status="future" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
