/* eslint-disable react-refresh/only-export-components -- co-exports of constants/hooks/contexts alongside components are intentional in this file. */
// Route-level state preview helper for TASK-UX-009.
//
// Lets every product route render canned empty / loading / access-denied /
// provider-unavailable / AI-unavailable variants by appending ?state=<name>
// to the URL — without touching real (mock) data. Pure presentation. All
// styling reuses existing tokens and the EmptyState primitive.

import { useRouterState, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Inbox,
  Users,
  ScrollText,
  ShieldOff,
  Sparkles,
  Plug,
  Bell,
  AlertTriangle,
  Lock,
  UserX,
  RefreshCw,
  BookOpen,
  LogIn,
} from "lucide-react";

import { EmptyState } from "@/components/empty-states";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { PageHeader, MockBanner } from "@/components/ui-bits";

/** Read `?state=<name>` from the current URL. */
export function useStateParam(): string | null {
  const search = useRouterState({
    select: (s) => s.location.search as Record<string, unknown>,
  });
  const v = search?.state;
  return typeof v === "string" && v.length > 0 ? v : null;
}

type Tone = "neutral" | "primary" | "warning" | "destructive";

type CTA = {
  label: string;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

function ActionButton({ cta }: { cta: CTA }) {
  const cls =
    cta.variant === "secondary"
      ? "inline-flex items-center gap-2 h-9 rounded-md border border-border bg-surface px-3 text-[12.5px] font-medium text-foreground transition hover:bg-secondary"
      : "inline-flex items-center gap-2 h-9 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground shadow-soft transition hover:opacity-95";
  if (cta.to) {
    return (
      <Link to={cta.to as "/"} className={cls}>
        {cta.label}
      </Link>
    );
  }
  if (cta.href) {
    return (
      <a href={cta.href} className={cls}>
        {cta.label}
      </a>
    );
  }
  return (
    <button onClick={cta.onClick} className={cls}>
      {cta.label}
    </button>
  );
}

/** Inline state block — drop into a route after the page header. */
export function RouteStateView({
  icon,
  title,
  description,
  badge,
  tone = "neutral",
  actions,
  helper,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  tone?: Tone;
  actions?: CTA[];
  helper?: string;
}) {
  const actionNode =
    actions && actions.length > 0 ? (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {actions.map((a, i) => (
          <ActionButton key={i} cta={a} />
        ))}
      </div>
    ) : undefined;
  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft">
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        badge={badge}
        tone={tone}
        action={actionNode}
        helper={helper}
      />
    </div>
  );
}

/** Wraps a state in the standard page chrome (header + mock banner). */
export function RouteStatePage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
      <PageHeader title={title} description={description} />
      <MockBanner />
      {children}
    </div>
  );
}

/** Loading skeleton variants for routes. */
export function RouteSkeleton({
  variant,
}: {
  variant: "list" | "table" | "cards" | "settings" | "thread";
}) {
  if (variant === "list" || variant === "thread") {
    return <LoadingSkeleton variant="conversation-list" count={6} />;
  }
  if (variant === "table") {
    return <LoadingSkeleton variant="table-rows" count={6} />;
  }
  if (variant === "cards") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} variant="card" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <LoadingSkeleton variant="card" />
      <LoadingSkeleton variant="card" />
      <LoadingSkeleton variant="card" />
    </div>
  );
}

// ─── Canned presets ───────────────────────────────────────────────────────
// Each preset returns a RouteStateView already configured for a given mock
// state. Routes only need to map their state-param to one of these.

export const presets = {
  // Inbox
  inboxEmpty: () => (
    <RouteStateView
      icon={Inbox}
      title="No conversations yet"
      description="New customer messages from active channels will appear here."
      badge="Empty state"
      tone="neutral"
      actions={[
        { label: "View channels", to: "/channels", variant: "primary" },
        { label: "Open Web Chat preview", to: "/widget-preview", variant: "secondary" },
      ]}
      helper="Prototype only — mock data, no live providers."
    />
  ),
  inboxAccessDenied: () => (
    <RouteStateView
      icon={ShieldOff}
      title="This conversation isn't available"
      description="This conversation belongs to a workspace you cannot access."
      badge="Access denied"
      tone="destructive"
      actions={[{ label: "Return to Dashboard", to: "/", variant: "primary" }]}
    />
  ),
  // Customers
  customersEmpty: () => (
    <RouteStateView
      icon={Users}
      title="No customers yet"
      description="Customers will appear after conversations are received from active channels."
      badge="Empty state"
      tone="neutral"
      actions={[
        { label: "Open Web Chat preview", to: "/widget-preview", variant: "primary" },
        { label: "View channels", to: "/channels", variant: "secondary" },
      ]}
    />
  ),
  customersAccessDenied: () => (
    <RouteStateView
      icon={ShieldOff}
      title="Customer access restricted"
      description="Your current role does not allow customer access."
      badge="Access restricted"
      tone="destructive"
      actions={[{ label: "Open role preview", to: "/role-preview", variant: "primary" }]}
    />
  ),
  // Audit
  auditEmpty: () => (
    <RouteStateView
      icon={ScrollText}
      title="Empty audit log"
      description="Workspace activity and security events will appear here."
      badge="Empty state"
      tone="neutral"
      actions={[{ label: "Return to Dashboard", to: "/", variant: "primary" }]}
    />
  ),
  auditAccessDenied: () => (
    <RouteStateView
      icon={Lock}
      title="Audit access restricted"
      description="Only Owner and Admin roles can review sensitive audit events."
      badge="Access restricted"
      tone="destructive"
      actions={[{ label: "Open role preview", to: "/role-preview", variant: "primary" }]}
    />
  ),
  auditError: () => (
    <RouteStateView
      icon={AlertTriangle}
      title="Could not load audit events"
      description="This is a mock error state for the prototype."
      badge="Mock error"
      tone="warning"
      actions={[
        { label: "Try again", href: "?state=", variant: "primary" },
        { label: "Return to Dashboard", to: "/", variant: "secondary" },
      ]}
    />
  ),
  // Members
  membersEmpty: () => (
    <RouteStateView
      icon={Users}
      title="No team members yet"
      description="Invite operators to help manage customer conversations."
      badge="Empty state"
      tone="neutral"
      actions={[{ label: "Invite member", to: "/members", variant: "primary" }]}
    />
  ),
  membersAccessDenied: () => (
    <RouteStateView
      icon={ShieldOff}
      title="Member management restricted"
      description="Your current role cannot invite members or change roles."
      badge="Access restricted"
      tone="destructive"
      actions={[{ label: "Open role preview", to: "/role-preview", variant: "primary" }]}
    />
  ),
  // Channels
  channelsNoActive: () => (
    <RouteStateView
      icon={Plug}
      title="No active channels"
      description="Start with Web Chat or Email to receive mock messages."
      badge="Empty state"
      tone="neutral"
      actions={[
        { label: "Configure Web Chat", to: "/channels/$channelId", variant: "primary" },
        { label: "Configure Email", to: "/channels/$channelId", variant: "secondary" },
      ]}
      helper="Prototype only — channels are mock."
    />
  ),
  channelsProviderUnavailable: () => (
    <RouteStateView
      icon={AlertTriangle}
      title="Provider unavailable"
      description="This is a mock provider unavailable state. No real provider is connected."
      badge="Provider unavailable"
      tone="warning"
      actions={[{ label: "View channel setup", to: "/channels", variant: "primary" }]}
    />
  ),
  channelDetailProviderUnavailable: () => (
    <RouteStateView
      icon={AlertTriangle}
      title="Provider unavailable"
      description="This mock provider is temporarily unreachable. Operators can still review setup."
      badge="Provider unavailable"
      tone="warning"
      actions={[{ label: "Back to channels", to: "/channels", variant: "primary" }]}
    />
  ),
  channelPlanned: () => (
    <RouteStateView
      icon={Plug}
      title="Planned — not enabled"
      description="This channel is planned but not enabled in the MVP."
      badge="Planned"
      tone="neutral"
      actions={[{ label: "Back to channels", to: "/channels", variant: "primary" }]}
      helper="Future integration. No external services are connected."
    />
  ),
  // Settings / AI / Knowledge
  settingsAccessDenied: () => (
    <RouteStateView
      icon={ShieldOff}
      title="Settings access restricted"
      description="Only Owner and Admin roles can change workspace settings."
      badge="Access restricted"
      tone="destructive"
      actions={[{ label: "Open role preview", to: "/role-preview", variant: "primary" }]}
    />
  ),
  aiUnavailable: () => (
    <RouteStateView
      icon={Sparkles}
      title="AI assistance unavailable"
      description="AI draft configuration is visible, but AI generation is not connected in this prototype."
      badge="AI unavailable"
      tone="warning"
      actions={[
        { label: "Review knowledge base", to: "/knowledge", variant: "primary" },
        { label: "Continue manually", to: "/inbox", variant: "secondary" },
      ]}
      helper="Operators continue manually — human-review-first."
    />
  ),
  aiAccessDenied: () => (
    <RouteStateView
      icon={ShieldOff}
      title="AI settings restricted"
      description="Only Owner and Admin roles can configure AI assistance."
      badge="Access restricted"
      tone="destructive"
      actions={[{ label: "Open role preview", to: "/role-preview", variant: "primary" }]}
    />
  ),
  knowledgeEmpty: () => (
    <RouteStateView
      icon={BookOpen}
      title="Knowledge base is empty"
      description="Add FAQs and business rules so operators and future AI drafts have better context."
      badge="Empty state"
      tone="neutral"
      actions={[{ label: "Add FAQ (mock)", to: "/knowledge", variant: "primary" }]}
    />
  ),
  knowledgeAccessDenied: () => (
    <RouteStateView
      icon={ShieldOff}
      title="Knowledge access restricted"
      description="Only Owner and Admin roles can edit the knowledge base."
      badge="Access restricted"
      tone="destructive"
      actions={[{ label: "Open role preview", to: "/role-preview", variant: "primary" }]}
    />
  ),
  // Notifications / profile
  notificationsEmpty: () => (
    <RouteStateView
      icon={Bell}
      title="No notifications"
      description="You're all caught up."
      badge="Empty state"
      tone="neutral"
      actions={[{ label: "Return to Dashboard", to: "/", variant: "primary" }]}
    />
  ),
  profileSessionExpired: () => (
    <RouteStateView
      icon={UserX}
      title="Session expired"
      description="Please sign in again to continue."
      badge="Session expired"
      tone="warning"
      actions={[
        { label: "Sign in again", to: "/login", variant: "primary" },
        { label: "Session info", to: "/session-expired", variant: "secondary" },
      ]}
    />
  ),
};

/** Tiny inline banner for AI / provider notices that sit ABOVE real content. */
export function StateBanner({
  icon: Icon = AlertTriangle,
  tone = "warning",
  title,
  description,
  actions,
}: {
  icon?: LucideIcon;
  tone?: "warning" | "info" | "destructive" | "neutral";
  title: string;
  description?: string;
  actions?: CTA[];
}) {
  const toneCls = {
    warning: "border-warning/30 bg-warning/10",
    info: "border-info/25 bg-info/10",
    destructive: "border-destructive/30 bg-destructive/10",
    neutral: "border-border bg-surface-muted/60",
  }[tone];
  return (
    <div
      role="status"
      className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${toneCls}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-foreground">{title}</div>
          {description && (
            <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {actions.map((a, i) => (
            <ActionButton key={i} cta={a} />
          ))}
        </div>
      )}
    </div>
  );
}

// Re-export for convenience
export { RefreshCw, LogIn };
