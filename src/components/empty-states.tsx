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
