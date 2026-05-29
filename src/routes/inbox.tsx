import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
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
import { Plus, AlertTriangle, RefreshCw, Loader2, MessageSquare } from "lucide-react";

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
// Channel filter config
// ---------------------------------------------------------------------------

type ChannelFilterValue = "all" | ChannelType;

const CHANNEL_FILTERS: { id: ChannelFilterValue; label: string }[] = [
  { id: "all", label: "All channels" },
  { id: "INTERNAL", label: "Internal" },
  { id: "WEBSITE_CHAT", label: "Web Chat" },
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

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilterValue>("all");

  // Pagination accumulation
  const [pages, setPages] = useState<ConversationWithSummary[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const lastKnownNextCursor = useRef<string | null>(null);

  // Resolve filters for API call
  const filters = {
    status: statusFilter === "all" ? undefined : statusFilter,
    channel: channelFilter === "all" ? undefined : channelFilter,
    limit: 25,
    cursor,
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useConversations(
    businessId,
    filters,
  );

  // Accumulate pages when data arrives — dedup guard prevents duplicate rows
  const dataItems = data?.data;
  useEffect(() => {
    if (!dataItems) return;

    if (!cursor) {
      // First page or filter reset — replace
      setPages(dataItems);
    } else {
      // Subsequent page — append with dedup guard
      setPages((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const nextItems = dataItems.filter((item) => !seen.has(item.id));
        return [...prev, ...nextItems];
      });
    }
  }, [dataItems, cursor]);

  // Track nextCursor so Load More button persists during fetch
  if (data?.nextCursor !== undefined) {
    lastKnownNextCursor.current = data.nextCursor;
  }

  // Reset filters, cursor, and accumulated pages
  const resetFilters = useCallback(() => {
    setStatusFilter("all");
    setChannelFilter("all");
    setCursor(undefined);
    setPages([]);
    lastKnownNextCursor.current = null;
  }, []);

  const handleStatusChange = useCallback((v: StatusFilterValue) => {
    setStatusFilter(v);
    setCursor(undefined);
    setPages([]);
    lastKnownNextCursor.current = null;
  }, []);

  const handleChannelChange = useCallback((v: ChannelFilterValue) => {
    setChannelFilter(v);
    setCursor(undefined);
    setPages([]);
    lastKnownNextCursor.current = null;
  }, []);

  const handleLoadMore = useCallback(() => {
    const next = data?.nextCursor ?? lastKnownNextCursor.current;
    if (next) {
      setCursor(next);
    }
  }, [data?.nextCursor]);

  // Show loading skeleton only on initial load with no accumulated pages
  const isInitialLoading = isLoading && pages.length === 0;

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

  // ── Loading state (initial only — no accumulated pages yet) ─────────────
  if (isInitialLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
        <PageHeader title="Inbox" description="Operator inbox — manage customer conversations." />
        <FilterBar
          statusValue={statusFilter}
          channelValue={channelFilter}
          onStatusChange={handleStatusChange}
          onChannelChange={handleChannelChange}
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
  const conversations = pages.length > 0 ? pages : (data?.data ?? []);
  const showLoadMore =
    data?.nextCursor ?? (isFetching && cursor ? lastKnownNextCursor.current : null);
  const isEmpty = conversations.length === 0;
  const hasActiveFilter = statusFilter !== "all" || channelFilter !== "all";
  const isFilterEmpty = isEmpty && hasActiveFilter;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
      <PageHeader
        title="Inbox"
        description="Operator inbox — manage customer conversations."
        action={
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-soft transition-all opacity-50 cursor-not-allowed"
            title="Coming soon"
          >
            <Plus className="h-3.5 w-3.5" />
            New conversation
          </button>
        }
      />

      <FilterBar
        statusValue={statusFilter}
        channelValue={channelFilter}
        onStatusChange={handleStatusChange}
        onChannelChange={handleChannelChange}
      />

      {/* Empty state — no conversations at all */}
      {isEmpty && !isFilterEmpty && <InboxOperatorFirstEmpty />}

      {/* Empty state — filter returned nothing */}
      {isFilterEmpty && <FilterNoMatchState label="conversations" onReset={resetFilters} />}

      {/* Conversation list */}
      {conversations.length > 0 && (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          {conversations.map((c) => (
            <ConversationRow key={c.id} conversation={c} />
          ))}
        </div>
      )}

      {/* Load more pagination */}
      {showLoadMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MessageSquare className="h-3.5 w-3.5" />
            )}
            Load more conversations
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter bar — combines status pills and channel pills
// ---------------------------------------------------------------------------

function FilterBar({
  statusValue,
  channelValue,
  onStatusChange,
  onChannelChange,
}: {
  statusValue: StatusFilterValue;
  channelValue: ChannelFilterValue;
  onStatusChange: (v: StatusFilterValue) => void;
  onChannelChange: (v: ChannelFilterValue) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => {
          const active = f.id === statusValue;
          return (
            <button
              key={f.id}
              onClick={() => onStatusChange(f.id)}
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
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {CHANNEL_FILTERS.map((f) => {
          const active = f.id === channelValue;
          return (
            <button
              key={f.id}
              onClick={() => onChannelChange(f.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                active
                  ? "bg-primary/80 text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversation row
// ---------------------------------------------------------------------------

function ConversationRow({ conversation: c }: { conversation: ConversationWithSummary }) {
  const statusTone = STATUS_TONE[c.status] ?? "bg-muted text-muted-foreground border-border";
  const statusLabel = STATUS_LABEL[c.status] ?? c.status;
  const channelLabel = CHANNEL_LABEL[c.channel] ?? c.channel;
  const updatedAt = formatRelativeTime(c.updatedAt ?? c.createdAt);
  const customerLabel = c.customerId
    ? `Contact #${c.customerId.slice(0, 8)}`
    : "No customer linked";

  return (
    <Link
      to="/inbox/$conversationId"
      params={{ conversationId: c.id }}
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/50"
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
          <span className="truncate">{customerLabel}</span>
          {c.messageCount > 0 && (
            <>
              <span className="opacity-50">·</span>
              <span className="shrink-0 tabular-nums">
                {c.messageCount} {c.messageCount === 1 ? "msg" : "msgs"}
              </span>
            </>
          )}
          <span className="opacity-50">·</span>
          <span className="shrink-0 tabular-nums">{updatedAt}</span>
        </div>
      </div>
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
