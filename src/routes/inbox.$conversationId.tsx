import { createFileRoute, Link } from "@tanstack/react-router";
import { useBusinessId } from "@/contexts/business-context";
import { useConversation } from "@/hooks/use-conversations";
import { useMessages } from "@/hooks/use-messages";
import type {
  ConversationWithSummary,
  ConversationStatus,
  ChannelType,
  Message,
  MessageDirection,
  MessageSenderType,
} from "@/lib/api-types";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import {
  useStateParam,
  presets as statePresets,
  RouteStatePage,
  RouteSkeleton,
  StateBanner,
} from "@/components/route-state";
import { ArrowLeft, AlertTriangle, RefreshCw, MessageSquare, Lock, Bot, Clock } from "lucide-react";

// ---------------------------------------------------------------------------
// Route definition
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/inbox/$conversationId")({
  head: () => ({
    meta: [
      { title: "Conversation — AI Reception" },
      {
        name: "description",
        content: "Conversation detail view. Read-only message timeline.",
      },
    ],
  }),
  component: ConversationDetailPage,
});

// ---------------------------------------------------------------------------
// Status / channel display maps (shared with inbox.tsx — extract later)
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
// Direction visual config
// ---------------------------------------------------------------------------

interface DirectionStyle {
  alignment: "left" | "right" | "center";
  bubbleCls: string;
  label: string;
}

function getDirectionStyle(
  direction: MessageDirection,
  senderType: MessageSenderType,
): DirectionStyle {
  switch (direction) {
    case "INBOUND":
      return {
        alignment: "left",
        bubbleCls: "bg-muted/50 border border-border",
        label: "Customer",
      };
    case "OUTBOUND":
      return {
        alignment: "right",
        bubbleCls: "bg-primary/10 border border-primary/20",
        label: senderType === "AI_RECEPTIONIST" ? "AI Receptionist" : "Operator",
      };
    case "INTERNAL":
      return {
        alignment: "right",
        bubbleCls: "bg-warning/8 border border-warning/20",
        label: "Internal note",
      };
    case "SYSTEM":
      return {
        alignment: "center",
        bubbleCls: "bg-surface-muted border border-border",
        label: "System",
      };
    default:
      return {
        alignment: "left",
        bubbleCls: "bg-muted/50 border border-border",
        label: "Unknown",
      };
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

function ConversationDetailPage() {
  const stateOverride = useStateParam();
  const businessId = useBusinessId();
  const { conversationId } = Route.useParams();

  const {
    data: conversation,
    isLoading: convLoading,
    isError: convError,
    error: convErr,
    refetch: refetchConv,
  } = useConversation(businessId, conversationId);

  const {
    data: messagesData,
    isLoading: msgsLoading,
    isError: msgsError,
    error: msgsErr,
    refetch: refetchMsgs,
  } = useMessages(businessId, conversationId, { limit: 50 });

  // ── State override support ──────────────────────────────────────────────
  if (stateOverride === "empty") {
    return (
      <RouteStatePage title="Conversation" description="Conversation detail">
        {statePresets.inboxEmpty()}
      </RouteStatePage>
    );
  }
  if (stateOverride === "access-denied") {
    return (
      <RouteStatePage title="Conversation" description="Conversation detail">
        {statePresets.inboxAccessDenied()}
      </RouteStatePage>
    );
  }
  if (stateOverride === "loading") {
    return (
      <RouteStatePage title="Conversation" description="Conversation detail">
        <RouteSkeleton variant="list" />
      </RouteStatePage>
    );
  }

  // ── No businessId configured ────────────────────────────────────────────
  if (!businessId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 space-y-6">
        <BackLink />
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
  if (convLoading || msgsLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 space-y-6">
        <BackLink />
        <LoadingSkeleton variant="card" count={1} />
        <LoadingSkeleton variant="text" count={6} />
      </div>
    );
  }

  // ── Error state — conversation ─────────────────────────────────────────
  if (convError) {
    const apiErr = convErr as
      | {
          isUnauthenticated?: boolean;
          isForbidden?: boolean;
          isNotFound?: boolean;
        }
      | undefined;

    if (apiErr?.isUnauthenticated) {
      return (
        <RouteStatePage title="Conversation" description="Conversation detail">
          {statePresets.profileSessionExpired()}
        </RouteStatePage>
      );
    }

    if (apiErr?.isForbidden) {
      return (
        <RouteStatePage title="Conversation" description="Conversation detail">
          {statePresets.inboxAccessDenied()}
        </RouteStatePage>
      );
    }

    if (apiErr?.isNotFound) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 space-y-6">
          <BackLink />
          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <div className="mx-auto flex w-full max-w-[360px] flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-muted">
                <MessageSquare className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="mb-1.5 text-[16px] font-medium leading-tight text-foreground">
                Conversation not found
              </h3>
              <p className="mb-5 text-[13px] leading-[1.5] text-muted-foreground">
                This conversation doesn't exist or has been removed.
              </p>
              <Link
                to="/inbox"
                className="inline-flex items-center gap-2 h-9 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground shadow-soft transition hover:opacity-95"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to inbox
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 space-y-6">
        <BackLink />
        <ErrorCard onRetry={() => refetchConv()} />
      </div>
    );
  }

  // ── Error state — messages ─────────────────────────────────────────────
  if (msgsError) {
    const apiErr = msgsErr as
      | {
          isUnauthenticated?: boolean;
          isForbidden?: boolean;
        }
      | undefined;

    if (apiErr?.isUnauthenticated) {
      return (
        <RouteStatePage title="Conversation" description="Conversation detail">
          {statePresets.profileSessionExpired()}
        </RouteStatePage>
      );
    }

    if (apiErr?.isForbidden) {
      return (
        <RouteStatePage title="Conversation" description="Conversation detail">
          {statePresets.inboxAccessDenied()}
        </RouteStatePage>
      );
    }

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 space-y-6">
        <BackLink />
        {conversation && <ConversationHeader conversation={conversation} />}
        <ErrorCard
          title="Could not load messages"
          description="Something went wrong while fetching messages. Please try again."
          onRetry={() => refetchMsgs()}
        />
      </div>
    );
  }

  // ── Data loaded ─────────────────────────────────────────────────────────
  const messages = messagesData?.data ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 space-y-6">
      <BackLink />

      {conversation && <ConversationHeader conversation={conversation} />}

      {/* Message timeline */}
      {messages.length === 0 ? <EmptyMessagesState /> : <MessageTimeline messages={messages} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Back link
// ---------------------------------------------------------------------------

function BackLink() {
  return (
    <Link
      to="/inbox"
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to inbox
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Conversation header
// ---------------------------------------------------------------------------

function ConversationHeader({ conversation: c }: { conversation: ConversationWithSummary }) {
  const statusTone = STATUS_TONE[c.status] ?? "bg-muted text-muted-foreground border-border";
  const statusLabel = STATUS_LABEL[c.status] ?? c.status;
  const channelLabel = CHANNEL_LABEL[c.channel] ?? c.channel;
  const customerLabel = c.customerId
    ? `Contact #${c.customerId.slice(0, 8)}`
    : "No customer linked";
  const createdAt = formatRelativeTime(c.createdAt);
  const updatedAt = formatRelativeTime(c.updatedAt);

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft p-5 space-y-3">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-lg font-semibold text-foreground leading-tight">
          {c.subject ?? "No subject"}
        </h1>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium ${statusTone}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
          {statusLabel}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded border border-border bg-surface-muted/60 px-1.5 py-0.5 text-[10px] font-medium">
          {channelLabel}
        </span>
        <span>{customerLabel}</span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {c.messageCount} {c.messageCount === 1 ? "message" : "messages"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Created {createdAt}
        </span>
        <span className="tabular-nums">Updated {updatedAt}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message timeline
// ---------------------------------------------------------------------------

function MessageTimeline({ messages }: { messages: Message[] }) {
  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
}

function MessageBubble({ message: m }: { message: Message }) {
  const style = getDirectionStyle(m.direction, m.senderType);
  const timestamp = formatRelativeTime(m.createdAt);

  if (style.alignment === "center") {
    return (
      <div className="flex justify-center">
        <div className={`rounded-lg px-4 py-2 max-w-md text-center ${style.bubbleCls}`}>
          <p className="text-[11px] font-medium text-muted-foreground italic">{m.content}</p>
          <span className="mt-1 block text-[10px] text-muted-foreground/60 tabular-nums">
            {timestamp}
          </span>
        </div>
      </div>
    );
  }

  const isRight = style.alignment === "right";

  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] space-y-1 ${isRight ? "text-right" : "text-left"}`}>
        {/* Sender label */}
        <div
          className={`flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground ${isRight ? "justify-end" : "justify-start"}`}
        >
          {m.direction === "INTERNAL" && <Lock className="h-3 w-3" />}
          {m.senderType === "AI_RECEPTIONIST" && <Bot className="h-3 w-3" />}
          <span>{style.label}</span>
        </div>

        {/* Bubble */}
        <div className={`rounded-xl px-4 py-3 ${style.bubbleCls}`}>
          <p className="text-[13px] leading-[1.6] text-foreground whitespace-pre-wrap break-words">
            {m.content}
          </p>
        </div>

        {/* Timestamp */}
        <span className="block text-[10px] text-muted-foreground/60 tabular-nums">{timestamp}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty messages state
// ---------------------------------------------------------------------------

function EmptyMessagesState() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="mx-auto flex w-full max-w-[360px] flex-col items-center px-6 py-16 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-muted">
          <MessageSquare className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="mb-1.5 text-[16px] font-medium leading-tight text-foreground">
          No messages yet
        </h3>
        <p className="text-[13px] leading-[1.5] text-muted-foreground">
          This conversation doesn't have any messages. Messages will appear here once the
          conversation starts.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error card
// ---------------------------------------------------------------------------

function ErrorCard({
  title = "Could not load conversation",
  description = "Something went wrong while fetching this conversation. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="mx-auto flex w-full max-w-[360px] flex-col items-center px-6 py-16 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <h3 className="mb-1.5 text-[16px] font-medium leading-tight text-foreground">{title}</h3>
        <p className="mb-5 text-[13px] leading-[1.5] text-muted-foreground">{description}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 h-9 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground shadow-soft transition hover:opacity-95"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    </div>
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
