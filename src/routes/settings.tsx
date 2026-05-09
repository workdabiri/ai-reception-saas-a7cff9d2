import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui-bits";
import { currentWorkspace } from "@/lib/mock-data";
import { Mail, Globe, MessageSquare, Phone, Sparkles, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Reception" },
      { name: "description", content: "Workspace, channels and AI preferences." },
    ],
  }),
  component: SettingsPage,
});

const channels = [
  { name: "Email", icon: Mail, status: "Connected (mock)", connected: true },
  { name: "Web form", icon: Globe, status: "Connected (mock)", connected: true },
  { name: "WhatsApp", icon: MessageSquare, status: "Future integration", connected: false },
  { name: "SMS", icon: MessageSquare, status: "Planned capability", connected: false },
  { name: "Voice reception", icon: Phone, status: "Planned capability", connected: false },
];

function SettingsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 space-y-8">
        <PageHeader
          title="Settings"
          description="Workspace, channels, AI preferences. Mock data only."
        />

        {/* Workspace */}
        <Section title="Workspace" description="Basic information about this reception workspace.">
          <Field label="Workspace name" value={currentWorkspace.name} />
          <Field label="Subdomain" value="northwind.airec.app" />
          <Field label="Time zone" value="America/Los_Angeles" />
          <Field label="Business hours" value="Mon–Fri · 8:00 AM – 6:00 PM" />
        </Section>

        {/* Channels */}
        <Section
          title="Channels"
          description="Where customer messages arrive. Async MVP — realtime is a planned capability."
        >
          <ul className="divide-y divide-border">
            {channels.map((c) => {
              const Icon = c.icon;
              return (
                <li key={c.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.status}</div>
                  </div>
                  {c.connected ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-success/20 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="rounded-md border border-dashed border-border bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Not enabled
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>

        {/* AI */}
        <Section
          title="AI assistance"
          description="AI prepares drafts. An operator reviews and sends every reply."
        >
          <div className="rounded-xl border border-primary/20 bg-primary-soft/40 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Human review required
            </div>
            <p className="mt-1 text-sm text-foreground/90">
              AI auto-reply is intentionally disabled. Drafts are suggestions, not sent
              messages. The operator sends the final reply.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <Toggle label="Generate AI drafts for new messages" enabled />
            <Toggle label="Suggest tags from message content" enabled />
            <Toggle label="Auto-reply without operator review" enabled={false} disabled note="Not available in MVP" />
            <Toggle label="Enable realtime live chat" enabled={false} disabled note="Planned capability" />
          </div>
        </Section>

        <Section title="Billing" description="Billing is not active in this prototype.">
          <div className="rounded-lg border border-dashed border-border bg-surface-muted p-4 text-sm text-muted-foreground">
            Plans, invoices and payment methods will appear here. Future integration.
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1.5 mb-3 last:mb-0 sm:grid-cols-[180px_1fr] sm:items-center">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        defaultValue={value}
        className="h-9 w-full rounded-lg border border-input bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}

function Toggle({
  label,
  enabled,
  disabled,
  note,
}: {
  label: string;
  enabled: boolean;
  disabled?: boolean;
  note?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border border-border px-3 py-2.5 ${
        disabled ? "bg-surface-muted/60" : "bg-surface"
      }`}
    >
      <div>
        <div className={`text-sm ${disabled ? "text-muted-foreground" : "font-medium"}`}>
          {label}
        </div>
        {note && <div className="text-[11px] text-muted-foreground">{note}</div>}
      </div>
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
          enabled ? "bg-primary" : "bg-border-strong"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            enabled ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </div>
  );
}
