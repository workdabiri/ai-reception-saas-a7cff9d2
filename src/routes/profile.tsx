import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, MockBanner } from "@/components/ui-bits";
import { ThemeToggle } from "@/components/theme-toggle";
import { currentUser } from "@/lib/notifications";
import {
  Shield,
  Building2,
  Bell,
  LogOut,
  KeyRound,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStateParam, presets as statePresets, RouteStatePage, RouteSkeleton } from "@/components/route-state";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Account — AI Reception" },
      {
        name: "description",
        content: "Mock account settings: profile, role, workspace, theme, and notification preferences.",
      },
    ],
  }),
  component: ProfilePage,
});

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="border-b border-border/60 px-5 py-4">
        <h2 className="text-[14px] font-medium text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Mail;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 text-[13px] text-foreground">{value}</div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-foreground">{label}</div>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={[
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          on ? "bg-primary" : "bg-border",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow-sm transition-transform",
            on ? "translate-x-[18px]" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function ProfilePage() {
  const stateOverride = useStateParam();
  if (stateOverride === "session-expired") {
    return <RouteStatePage title="Account">{statePresets.profileSessionExpired()}</RouteStatePage>;
  }
  if (stateOverride === "loading") {
    return (
      <RouteStatePage title="Account" description="Loading account…">
        <RouteSkeleton variant="settings" />
      </RouteStatePage>
    );
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 space-y-6">
      <PageHeader
        title="Account"
        description="Your personal profile, role, and preferences for this workspace."
      />
      <MockBanner />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Section title="Profile information" description="Mock identity for the prototype.">
            <div className="flex items-center gap-4 pb-4 border-b border-border/60">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-background text-[15px] font-medium shadow-soft">
                {currentUser.initials}
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-medium text-foreground">
                  {currentUser.name}
                </div>
                <div className="text-[12px] text-muted-foreground">{currentUser.email}</div>
              </div>
            </div>
            <div className="grid gap-1 sm:grid-cols-2">
              <Field label="Full name" value={currentUser.name} icon={UserIcon} />
              <Field label="Email" value={currentUser.email} icon={Mail} />
              <Field label="Role" value={currentUser.role} icon={Shield} />
              <Field label="Workspace" value={currentUser.workspace} icon={Building2} />
            </div>
          </Section>

          <Section
            title="Notification preferences"
            description="Choose which mock activity sends notifications. Delivery is not connected."
          >
            <ToggleRow
              label="Assigned conversations"
              description="When a conversation is assigned to you."
              defaultChecked
            />
            <ToggleRow
              label="AI draft ready"
              description="When AI prepares a draft for operator review."
              defaultChecked
            />
            <ToggleRow
              label="Security events"
              description="Access denied events and member changes."
              defaultChecked
            />
            <ToggleRow
              label="Channel activity"
              description="Updates from Web Chat and Email channels."
            />
            <ToggleRow
              label="Knowledge warnings"
              description="When knowledge gaps may affect AI drafts."
            />
          </Section>

          <Section
            title="Security & session"
            description="Prototype only — no real authentication is wired."
          >
            <div className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-foreground">Password</div>
                <p className="text-[12px] text-muted-foreground">
                  Password changes are not enabled in this prototype.
                </p>
              </div>
              <button
                disabled
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground cursor-not-allowed"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Change
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-foreground">Sign out</div>
                <p className="text-[12px] text-muted-foreground">
                  Prototype only — no real session is ended.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-[12px] font-medium text-destructive transition hover:bg-destructive/15"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Link>
            </div>
          </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Theme" description="Pick how the workspace looks for you.">
            <ThemeToggle variant="full" />
          </Section>
          <Section title="Quick links">
            <ul className="space-y-1.5 text-[13px]">
              <li>
                <Link
                  to="/notifications"
                  className="inline-flex items-center gap-2 text-foreground hover:underline"
                >
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                  Notification center
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 text-foreground hover:underline"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Workspace settings
                </Link>
              </li>
            </ul>
          </Section>
        </aside>
      </div>
    </div>
  );
}
