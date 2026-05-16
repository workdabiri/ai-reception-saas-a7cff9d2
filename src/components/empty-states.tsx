import {
  Inbox,
  Building2,
  ShieldOff,
  UserX,
  Sparkles,
  Plug,
  ScrollText,
  Users,
  Inbox as InboxIcon,
  Send,
  Eye,
  ArrowDownToLine,
  SearchX,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export type EmptyStateTone = "neutral" | "warning" | "destructive" | "primary";

const toneStyles: Record<
  EmptyStateTone,
  { icon: string; ring: string; chip: string }
> = {
  neutral: {
    icon: "bg-secondary text-muted-foreground",
    ring: "ring-border",
    chip: "border-border bg-surface text-muted-foreground",
  },
  primary: {
    icon: "bg-primary-soft text-primary",
    ring: "ring-primary/20",
    chip: "border-primary/20 bg-primary-soft text-primary",
  },
  warning: {
    icon: "bg-warning/15 text-warning-foreground",
    ring: "ring-warning/30",
    chip: "border-warning/30 bg-warning/10 text-warning-foreground",
  },
  destructive: {
    icon: "bg-destructive/10 text-destructive",
    ring: "ring-destructive/20",
    chip: "border-destructive/20 bg-destructive/5 text-destructive",
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  tone = "neutral",
  badge,
  action,
  helper,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: EmptyStateTone;
  badge?: string;
  action?: ReactNode;
  helper?: ReactNode;
  compact?: boolean;
}) {
  const t = toneStyles[tone];
  return (
    <div
      className={`relative flex flex-col items-center text-center overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface to-surface-muted/40 ${
        compact ? "px-6 py-10" : "px-8 py-16"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
      <div
        className={`grid h-14 w-14 place-items-center rounded-2xl ring-8 ring-background shadow-soft ${t.icon} ${t.ring}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      {badge && (
        <span
          className={`mt-5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${t.chip}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {badge}
        </span>
      )}
      <h3 className="mt-4 text-[17px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
      {helper && (
        <div className="mt-5 max-w-md text-[11.5px] leading-relaxed text-muted-foreground/80">{helper}</div>
      )}
    </div>
  );
}

// Pre-configured states from the prototype spec ----------------------------

export function NoConversationsState() {
  return (
    <EmptyState
      icon={Inbox}
      title="No conversations yet"
      description="New customer messages will appear here when connected channels are added."
      action={
        <Link
          to="/settings"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-95"
        >
          Configure channels
        </Link>
      }
      helper="Channels are a planned capability — none are enabled in MVP."
    />
  );
}

export function NoActiveWorkspaceState() {
  return (
    <EmptyState
      icon={Building2}
      tone="primary"
      badge="Workspace required"
      title="No active workspace"
      description="Select or create a workspace to continue."
      action={
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-95">
          Choose a workspace
        </button>
      }
    />
  );
}

export function AccessDeniedState() {
  return (
    <EmptyState
      icon={ShieldOff}
      tone="destructive"
      badge="Access denied"
      title="You don't have permission for this action"
      description="You do not have permission to perform this action in this workspace."
      helper="Server-side membership is verified on every tenant-scoped request."
    />
  );
}

export function RemovedMemberState() {
  return (
    <EmptyState
      icon={UserX}
      tone="destructive"
      badge="Removed"
      title="Workspace access revoked"
      description="Your access to this workspace has been removed."
      helper="Removed members lose access immediately. Contact a workspace owner to be re-invited."
    />
  );
}

export function AIUnavailableState() {
  return (
    <EmptyState
      icon={Sparkles}
      tone="warning"
      badge="AI unavailable"
      title="AI assistance is paused"
      description="AI assistance is unavailable. Operators can continue manually."
      helper="Manual review mode remains the source of truth — every reply is operator-sent."
    />
  );
}

export function FutureProviderState({ provider }: { provider?: string }) {
  return (
    <EmptyState
      icon={Plug}
      badge="Planned"
      title={provider ? `${provider} is not enabled` : "Provider not enabled"}
      description="This provider is planned but not enabled in the MVP."
      helper="Future integration. No external services are connected."
    />
  );
}

export function EmptyAuditState() {
  return (
    <EmptyState
      icon={ScrollText}
      title="No audit events yet"
      description="Audit events will appear here when sensitive actions occur."
      helper="Sensitive actions include role changes, settings updates and access decisions."
    />
  );
}

// ─── Operator-first educational empty states ──────────────────────────────
// Goal: a first-time operator understands the "AI drafts, humans send" loop
// in under 30 seconds, even when there is no real data to look at yet.

function FlowStep({
  n,
  icon: Icon,
  title,
  body,
  tone,
}: {
  n: number;
  icon: LucideIcon;
  title: string;
  body: string;
  tone: "info" | "ai" | "primary";
}) {
  const toneCls =
    tone === "ai"
      ? "bg-ai-soft text-ai ring-ai/25"
      : tone === "info"
        ? "bg-info/10 text-info ring-info/25"
        : "bg-primary-soft text-primary ring-primary/25";
  return (
    <div className="relative flex items-start gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 text-left shadow-soft">
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset ${toneCls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-semibold text-muted-foreground">
            {String(n).padStart(2, "0")}
          </span>
          <h4 className="text-[12.5px] font-semibold leading-tight">{title}</h4>
        </div>
        <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

/** Inbox — total empty. Teaches the 3-step operator-first flow in ~30s. */
export function InboxOperatorFirstEmpty() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-6 py-10 text-center sm:py-14">
      <div className="relative">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary ring-8 ring-background shadow-soft">
          <InboxIcon className="h-6 w-6" />
        </div>
        <span className="absolute -right-1.5 -bottom-1.5 grid h-6 w-6 place-items-center rounded-full bg-ai text-ai-foreground ring-4 ring-background shadow-soft">
          <Sparkles className="h-3 w-3" />
        </span>
      </div>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-success" /> Operator-first workflow
      </span>
      <h3 className="mt-3 text-[17px] font-semibold tracking-tight">
        AI drafts. <span className="text-muted-foreground">You</span> send.
      </h3>
      <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        New messages will land here. The assistant prepares a draft reply — but every message
        leaves your workspace only when an operator reviews and approves it.
      </p>

      <div className="mt-6 grid w-full gap-2.5 sm:grid-cols-3">
        <FlowStep n={1} icon={ArrowDownToLine} tone="info" title="Message arrives" body="Customer writes via email, web form or a connected channel." />
        <FlowStep n={2} icon={Sparkles} tone="ai" title="AI drafts a reply" body="A grounded draft with citations appears in the side panel." />
        <FlowStep n={3} icon={Send} tone="primary" title="Operator sends" body="You edit, approve, and send. Nothing auto-sends — ever." />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          to="/settings"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/92 hover:shadow-card transition-all"
        >
          Connect a channel
        </Link>
        <Link
          to="/states"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-all"
        >
          <Eye className="h-3.5 w-3.5" /> See sample conversation
        </Link>
      </div>
      <p className="mt-4 max-w-md text-[11px] leading-relaxed text-muted-foreground/80">
        Prototype with mock data — no channels are actually connected. The workflow stays the same when they are.
      </p>
    </div>
  );
}

/** Filter returned 0 results. Soft, actionable, with optional reset. */
export function FilterNoMatchState({
  label = "conversations",
  onReset,
}: {
  label?: string;
  onReset?: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-12 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-muted-foreground ring-1 ring-border">
        <SearchX className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-[14px] font-semibold tracking-tight">No {label} match</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
        Try adjusting your search, status, or assignee filter.
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[11.5px] font-medium text-foreground hover:bg-secondary transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/** Customers — total empty. Teaches that records auto-build from the inbox. */
export function CustomersOperatorFirstEmpty() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-6 py-12 text-center sm:py-14">
      <div className="relative">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary ring-8 ring-background shadow-soft">
          <Users className="h-6 w-6" />
        </div>
        <span className="absolute -right-1.5 -bottom-1.5 grid h-6 w-6 place-items-center rounded-full bg-info text-info-foreground ring-4 ring-background shadow-soft">
          <UserPlus className="h-3 w-3" />
        </span>
      </div>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-info" /> Built from real conversations
      </span>
      <h3 className="mt-3 text-[17px] font-semibold tracking-tight">No customers yet</h3>
      <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        Customer records appear automatically the first time someone reaches you. The operator stays
        in control — tags, notes, and assignments live next to the thread.
      </p>

      <div className="mt-6 grid w-full gap-2.5 sm:grid-cols-3">
        <FlowStep n={1} icon={ArrowDownToLine} tone="info" title="First message" body="A new sender is captured with channel, contact and history." />
        <FlowStep n={2} icon={Sparkles} tone="ai" title="Profile enriched" body="AI suggests tags from past threads — operator confirms." />
        <FlowStep n={3} icon={Eye} tone="primary" title="You stay in control" body="Every status, tag and follow-up is an operator decision." />
      </div>

      <div className="mt-6">
        <Link
          to="/inbox"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/92 hover:shadow-card transition-all"
        >
          Open the inbox
        </Link>
      </div>
    </div>
  );
}
