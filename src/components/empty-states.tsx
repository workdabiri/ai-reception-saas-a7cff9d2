import {
  Inbox,
  Building2,
  ShieldOff,
  UserX,
  Sparkles,
  Plug,
  ScrollText,
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
      className={`flex flex-col items-center text-center rounded-2xl border border-dashed border-border bg-surface ${
        compact ? "px-6 py-8" : "px-8 py-14"
      }`}
    >
      <div
        className={`grid h-12 w-12 place-items-center rounded-xl ring-4 ${t.icon} ${t.ring}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      {badge && (
        <span
          className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${t.chip}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {badge}
        </span>
      )}
      <h3 className="mt-3 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
      {helper && (
        <div className="mt-5 text-[11px] text-muted-foreground">{helper}</div>
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
