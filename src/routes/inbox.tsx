import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/ui-bits";
import { useBusinessId } from "@/contexts/business-context";
import { useConversations } from "@/hooks/use-conversations";
import type { ConversationStatus, ConversationWithSummary, ChannelType } from "@/lib/api-types";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { InboxOperatorFirstEmpty, FilterNoMatchState } from "@/components/empty-states";
import {
  useStateParam,
  presets as statePresets,
  RouteStatePage,
  RouteSkeleton,
  StateBanner,
} from "@/components/route-state";
import {
  Inbox as InboxIcon,
  Plus,
  ChevronRight,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Route definition
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — AI Reception" },
      {
        name: "description",
        content: "Operator inbox for managing customer conversations. AI drafts, humans send.",
      },
    ],
  }),
  component: InboxPage,
});

// ---------------------------------------------------------------------------
// Status filter config
// ---------------------------------------------------------------------------

type StatusFilterValue = "all" | ConversationStatus;

const STATUS_FILTERS: { id: StatusFilterValue; label: string }[] = [
  { id: "all", label: "All" },
  { id: "NEW", label: "New" },
  { id: "OPEN", label: "Open" },
  { id: "ASSIGNED", label: "Assigned" },
  { id: "WAITING_CUSTOMER", label: "Waiting (customer)" },
  { id: "WAITING_OPERATOR", label: "Waiting (operator)" },
  { id: "ESCALATED", label: "Escalated" },
  { id: "RESOLVED", label: "Resolved" },
];

// ---------------------------------------------------------------------------
// Status badge styling
// ---------------------------------------------------------------------------

const STATUS_TONE: Record<ConversationStatus, string> = {
  NEW: "bg-info/12 text-foreground border-info/30",
  OPEN: "bg-info/10 text-foreground border-info/25",
  ASSIGNED: "bg-primary/10 text-foreground border-primary/25",
  WAITING_CUSTOMER: "bg-warning/12 text-foreground border-warning/30",
  WAITING_OPERATOR: "bg-warning/10 text-foreground border-warning/25",
  ESCALATED: "bg-destructive/10 text-foreground border-destructive/25",
  RESOLVED: "bg-success/10 text-foreground border-success/25",
};

const STATUS_LABEL: Record<ConversationStatus, string> = {
  NEW: "New",
  OPEN: "Open",
  ASSIGNED: "Assigned",
  WAITING_CUSTOMER: "Waiting (customer)",
  WAITING_OPERATOR: "Waiting (operator)",
  ESCALATED: "Escalated",
  RESOLVED: "Resolved",
};

const CHANNEL_LABEL: Record<ChannelType, string> = {
  INTERNAL: "Internal",
  WEBSITE_CHAT: "Web Chat",
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

function InboxPage() {
  const stateOverride = useStateParam();
  const businessId = useBusinessId();
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  // Resolve filters
  const filters = {
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 25,
    cursor,
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useConversations(
    businessId,
    filters,
  );

  // ── State override support ──────────────────────────────────────────────
  if (stateOverride === "empty") {
    return (
      <RouteStatePage title="Inbox" description="Operator inbox">
        {statePresets.inboxEmpty()}
      </RouteStatePage>
    );
  }
  if (stateOverride === "access-denied") {
    return (
      <RouteStatePage title="Inbox" description="Operator inbox">
        {statePresets.inboxAccessDenied()}
      </RouteStatePage>
    );
  }
  if (stateOverride === "loading") {
    return (
      <RouteStatePage title="Inbox" description="Operator inbox">
        <RouteSkeleton variant="list" />
      </RouteStatePage>
    );
  }

  // ── No businessId configured ────────────────────────────────────────────
  if (!businessId) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
        <PageHeader title="Inbox" description="Operator inbox — manage customer conversations." />
        <StateBanner
          icon={AlertTriangle}
          tone="warning"
          title="No business configured"
          description="Set VITE_DEV_BUSINESS_ID in your .env file to connect to the backend API."
        />
      </div>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
        <PageHeader title="Inbox" description="Operator inbox — manage customer conversations." />
        <StatusFilterBar
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setCursor(undefined);
          }}
        />
        <LoadingSkeleton variant="conversation-list" count={6} />
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (isError) {
    const apiErr = error as { isUnauthenticated?: boolean; isForbidden?: boolean } | undefined;

    if (apiErr?.isUnauthenticated) {
      return (
        <RouteStatePage title="Inbox" description="Operator inbox">
          {statePresets.profileSessionExpired()}
        </RouteStatePage>
      );
    }

    if (apiErr?.isForbidden) {
      return (
        <RouteStatePage title="Inbox" description="Operator inbox">
          {statePresets.inboxAccessDenied()}
        </RouteStatePage>
      );
    }

    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
        <PageHeader title="Inbox" description="Operator inbox — manage customer conversations." />
        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="mx-auto flex w-full max-w-[360px] flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h3 className="mb-1.5 text-[16px] font-medium leading-tight text-foreground">
              Could not load conversations
            </h3>
            <p className="mb-5 text-[13px] leading-[1.5] text-muted-foreground">
              Something went wrong while fetching your inbox. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 h-9 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground shadow-soft transition hover:opacity-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Data loaded ─────────────────────────────────────────────────────────
  const conversations = data?.data ?? [];
  const nextCursor = data?.nextCursor;
  const isEmpty = conversations.length === 0 && !cursor;
  const isFilterEmpty = conversations.length === 0 && statusFilter !== "all";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
      <PageHeader
        title="Inbox"
        description="Operator inbox — manage customer conversations."
        action={
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-95 shadow-soft transition-all"
            title="New conversation (coming soon)"
          >
            <Plus className="h-3.5 w-3.5" />
            New conversation
          </button>
        }
      />

      <StatusFilterBar
        value={statusFilter}
        onChange={(v) => {
          setStatusFilter(v);
          setCursor(undefined);
        }}
      />

      {/* Empty state — no conversations at all */}
      {isEmpty && !isFilterEmpty && <InboxOperatorFirstEmpty />}

      {/* Empty state — filter returned nothing */}
      {isFilterEmpty && (
        <FilterNoMatchState
          label="conversations"
          onReset={() => {
            setStatusFilter("all");
            setCursor(undefined);
          }}
        />
      )}

      {/* Conversation list */}
      {conversations.length > 0 && (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          {conversations.map((c) => (
            <ConversationRow key={c.id} conversation={c} businessId={businessId} />
          ))}
        </div>
      )}

      {/* Load more / pagination */}
      {nextCursor && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setCursor(nextCursor)}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            Load more conversations
          </button>
        </div>
      )}

      {/* Fetching indicator (when loading more) */}
      {isFetching && !isLoading && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status filter bar
// ---------------------------------------------------------------------------

function StatusFilterBar({
  value,
  onChange,
}: {
  value: StatusFilterValue;
  onChange: (v: StatusFilterValue) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {STATUS_FILTERS.map((f) => {
        const active = f.id === value;
        return (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversation row
// ---------------------------------------------------------------------------

function ConversationRow({
  conversation: c,
  businessId: _businessId,
}: {
  conversation: ConversationWithSummary;
  businessId: string;
}) {
  const statusTone = STATUS_TONE[c.status] ?? "bg-muted text-muted-foreground border-border";
  const statusLabel = STATUS_LABEL[c.status] ?? c.status;
  const channelLabel = CHANNEL_LABEL[c.channel] ?? c.channel;
  const updatedAt = formatRelativeTime(c.updatedAt ?? c.createdAt);

  return (
    <Link
      to="/inbox"
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-muted transition-colors group"
    >
      {/* Status indicator dot */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div
          className={`h-2 w-2 rounded-full ${
            c.status === "NEW"
              ? "bg-info"
              : c.status === "RESOLVED"
                ? "bg-muted-foreground/30"
                : c.status === "ESCALATED"
                  ? "bg-destructive"
                  : "bg-primary"
          }`}
        />
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {c.subject ?? "No subject"}
          </span>
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium ${statusTone}`}
          >
            <span className="h-1 w-1 rounded-full bg-current opacity-60" />
            {statusLabel}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded border border-border bg-surface-muted/60 px-1.5 py-0.5 text-[10px] font-medium">
            {channelLabel}
          </span>
          <span className="truncate">
            {c.customerId ? `Customer ${c.customerId.slice(0, 8)}…` : "Unknown contact"}
          </span>
          <span className="opacity-50">·</span>
          <span className="shrink-0 tabular-nums">{updatedAt}</span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Time formatting helper
// ---------------------------------------------------------------------------

function formatRelativeTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
