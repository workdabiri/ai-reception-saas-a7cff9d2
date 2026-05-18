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
  Search,
  FileText,
  Link as LinkIcon,
  SearchX,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export type EmptyStateTone = "neutral" | "warning" | "destructive" | "primary";

// Unified, calm icon-tile treatment. Default `neutral` matches the design
// system's empty-state spec (56px tile, app-bg fill, tertiary icon).
const toneStyles: Record<EmptyStateTone, { tile: string; icon: string; chipClass: string }> = {
  neutral: {
    tile: "bg-background dark:bg-white/[0.04]",
    icon: "text-muted-foreground/80",
    chipClass: "state-pill",
  },
  primary: {
    tile: "bg-primary-soft",
    icon: "text-primary",
    chipClass: "state-pill",
  },
  warning: {
    tile: "bg-warning/12",
    icon: "text-warning",
    chipClass: "state-pill state-pill--warning",
  },
  destructive: {
    tile: "bg-destructive/10",
    icon: "text-destructive",
    chipClass: "state-pill state-pill--danger",
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
  compact: _compact,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: EmptyStateTone;
  badge?: string;
  action?: ReactNode;
  helper?: ReactNode;
  /** @deprecated padding is now uniform */
  compact?: boolean;
}) {
  void _compact;
  const t = toneStyles[tone];
  return (
    <div className="mx-auto flex w-full max-w-[360px] flex-col items-center px-6 py-16 text-center">
      <div className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl ${t.tile}`}>
        <Icon strokeWidth={1.75} className={`h-7 w-7 ${t.icon}`} />
      </div>
      {badge && (
        <span className={`mb-3 ${t.chipClass}`}>
          <span className="state-pill-dot" />
          {badge}
        </span>
      )}
      <h3 className="mb-1.5 text-[16px] font-medium leading-tight text-foreground">{title}</h3>
      <p className="mb-5 text-[13px] leading-[1.5] text-muted-foreground">{description}</p>
      {action && <div>{action}</div>}
      {helper && (
        <div className="mt-4 text-[11.5px] leading-relaxed text-muted-foreground/80">{helper}</div>
      )}
    </div>
  );
}

/** Secondary-style small action button used inside empty states. */
function EmptyAction({
  to,
  onClick,
  children,
}: {
  to?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const cls =
    "inline-flex items-center gap-2 h-8 rounded-md border border-border bg-surface px-3 text-[12px] font-medium text-foreground transition hover:bg-secondary hover:border-border-strong";
  if (to) {
    return (
      <Link to={to as "/"} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

// ─── Unified empty-state presets (per design system spec) ─────────────────

export function EmptyInboxState() {
  return (
    <EmptyState
      icon={Inbox}
      title="No conversations yet"
      description="When customers reach out, their messages will appear here."
    />
  );
}

export function EmptySearchState({ onReset }: { onReset?: () => void } = {}) {
  return (
    <EmptyState
      icon={Search}
      title="No matches"
      description="Try adjusting your filters or search terms."
      action={onReset ? <EmptyAction onClick={onReset}>Clear filters</EmptyAction> : undefined}
    />
  );
}

export function EmptyAuditLogState() {
  return (
    <EmptyState
      icon={FileText}
      title="No activity yet"
      description="Audit events will appear here as your team takes actions."
    />
  );
}

export function EmptyCustomersState() {
  return (
    <EmptyState
      icon={Users}
      title="No customers yet"
      description="Customer profiles will be created automatically when conversations begin."
    />
  );
}

export function NoChannelsState() {
  return (
    <EmptyState
      icon={LinkIcon}
      title="No channels connected"
      description="Connect a channel to start receiving messages."
      action={<EmptyAction to="/settings">Connect a channel</EmptyAction>}
    />
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
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-95"
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
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-95">
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
      tone="neutral"
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
      tone="neutral"
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
  // Icon-only tiles — the variant color drives the icon's currentColor.
  // eslint-disable-next-line local/no-pill-contrast-violation
  const toneCls =
    tone === "ai"
      ? "bg-ai-soft text-ai ring-ai/25"
      : tone === "info"
        // eslint-disable-next-line local/no-pill-contrast-violation
        ? "bg-info/10 text-info ring-info/25"
        : "bg-primary-soft text-primary ring-primary/25";
  return (
    <div className="relative flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left shadow-soft">
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset ${toneCls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-medium text-muted-foreground">
            {String(n).padStart(2, "0")}
          </span>
          <h4 className="text-[12.5px] font-medium leading-tight">{title}</h4>
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
      <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-success" /> Operator-first workflow
      </span>
      <h3 className="mt-3 text-[17px] font-medium tracking-tight">
        AI drafts. <span className="text-muted-foreground">You</span> send.
      </h3>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        New messages will land here. The assistant prepares a draft reply — but every message
        leaves your workspace only when an operator reviews and approves it.
      </p>

      <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
        <FlowStep n={1} icon={ArrowDownToLine} tone="info" title="Message arrives" body="Customer writes via email, web form or a connected channel." />
        <FlowStep n={2} icon={Sparkles} tone="ai" title="AI drafts a reply" body="A grounded draft with citations appears in the side panel." />
        <FlowStep n={3} icon={Send} tone="primary" title="Operator sends" body="You edit, approve, and send. Nothing auto-sends — ever." />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-soft hover:bg-primary/92 hover:shadow-card transition-all"
        >
          Connect a channel
        </Link>
        <Link
          to="/states"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-all"
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
      <h3 className="mt-3 text-[14px] font-medium tracking-tight">No {label} match</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
        Try adjusting your search, status, or assignee filter.
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[11.5px] font-medium text-foreground hover:bg-secondary transition-colors"
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
      <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-info" /> Built from real conversations
      </span>
      <h3 className="mt-3 text-[17px] font-medium tracking-tight">No customers yet</h3>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        Customer records appear automatically the first time someone reaches you. The operator stays
        in control — tags, notes, and assignments live next to the thread.
      </p>

      <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
        <FlowStep n={1} icon={ArrowDownToLine} tone="info" title="First message" body="A new sender is captured with channel, contact and history." />
        <FlowStep n={2} icon={Sparkles} tone="ai" title="Profile enriched" body="AI suggests tags from past threads — operator confirms." />
        <FlowStep n={3} icon={Eye} tone="primary" title="You stay in control" body="Every status, tag and follow-up is an operator decision." />
      </div>

      <div className="mt-6">
        <Link
          to="/inbox"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-soft hover:bg-primary/92 hover:shadow-card transition-all"
        >
          Open the inbox
        </Link>
      </div>
    </div>
  );
}
