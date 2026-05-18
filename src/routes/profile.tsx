import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { mockUser } from "@/lib/notifications";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Account — AI Reception" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your profile, role and preferences. Prototype only — no real account
          changes are saved.
        </p>
      </header>

      {/* Identity */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-background text-sm font-medium shadow-soft">
            {mockUser.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-medium text-foreground">
              {mockUser.name}
            </div>
            <div className="text-[13px] text-muted-foreground">
              {mockUser.email}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium bg-primary-soft text-foreground ring-1 ring-inset ring-primary/25">
                <Shield className="h-2.5 w-2.5" />
                {mockUser.role}
              </span>
              <span className="text-muted-foreground">
                · {mockUser.workspace}
              </span>
              <span className="text-muted-foreground">· {mockUser.status}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Profile fields */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-medium text-foreground">
          Profile information
        </h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Read-only in this prototype.
        </p>
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Full name" value={mockUser.name} />
          <Field label="Email" value={mockUser.email} />
          <Field label="Role" value={mockUser.role} />
          <Field label="Active workspace" value={mockUser.workspace} />
        </dl>
      </section>

      {/* Preferences */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-medium text-foreground">Preferences</h2>
        <div className="mt-3 space-y-3">
          <Row
            label="Theme"
            description="Light, dark, night, or follow system."
            control={<ThemeToggle variant="full" />}
          />
          <Row
            label="Notification preferences"
            description="Choose which activity sends you in-app alerts."
            control={
              <Link
                to="/notifications"
                className="rounded-md border border-border bg-surface px-2.5 py-1 text-[12px] font-medium text-foreground transition hover:bg-secondary"
              >
                Open notifications
              </Link>
            }
          />
        </div>
      </section>

      {/* Security / Session */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-medium text-foreground">
          Security &amp; session
        </h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Two-factor and session management will live here in the production
          build.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface p-3">
          <div>
            <div className="text-[13px] font-medium text-foreground">
              Sign out
            </div>
            <div className="text-[11.5px] text-muted-foreground">
              Prototype only — no real session is ended.
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-[12px] font-medium text-destructive transition hover:bg-destructive/15"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Link>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface px-3 py-2">
      <dt className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13px] text-foreground">{value}</dd>
    </div>
  );
}

function Row({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface p-3">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-foreground">{label}</div>
        <div className="text-[11.5px] text-muted-foreground">{description}</div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
