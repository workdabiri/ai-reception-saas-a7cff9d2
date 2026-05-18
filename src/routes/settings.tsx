import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, MockBanner } from "@/components/ui-bits";
import { currentWorkspace } from "@/lib/mock-data";
import {
  Mail,
  MessageSquare,
  Phone,
  Sparkles,
  Building2,
  Users2,
  Inbox,
  ShieldCheck,
  Plug,
  Lock,
  Eye,
  AlertTriangle,
  Smartphone,
} from "lucide-react";
import { useState, type ReactNode } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Reception" },
      { name: "description", content: "Workspace, reception, AI and audit preferences." },
    ],
  }),
  component: SettingsPage,
});

const sectionNav = [
  { id: "business", label: "Business profile", icon: Building2 },
  { id: "workspace", label: "Workspace", icon: Users2 },
  { id: "reception", label: "Reception", icon: Inbox },
  { id: "ai", label: "AI assistance", icon: Sparkles },
  { id: "audit", label: "Audit", icon: ShieldCheck },
  { id: "integrations", label: "Future integrations", icon: Plug },
];

const futureIntegrations = [
  { name: "WhatsApp", icon: MessageSquare, label: "Planned", desc: "Receive customer messages from WhatsApp into the inbox." },
  { name: "Twilio", icon: Phone, label: "Planned", desc: "Provider for SMS and voice reception capabilities." },
  { name: "Email", icon: Mail, label: "Planned", desc: "Inbound email parsing and threaded replies." },
  { name: "SMS", icon: Smartphone, label: "Planned", desc: "Two-way SMS conversations through a verified number." },
  { name: "Voice", icon: Phone, label: "Future", desc: "AI-assisted voice reception with operator handoff." },
];

function SettingsPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
        <PageHeader
          title="Settings"
          description="Configure how this workspace receives and processes customer conversations. All data is mock — MVP is async and human-review-first."
        />
        <MockBanner />

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Side nav */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <nav className="rounded-xl border border-border bg-card p-2 shadow-soft">
              {sectionNav.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    {s.label}
                  </a>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-6 min-w-0">
            {/* Business profile */}
            <Section
              id="business"
              icon={Building2}
              title="Business profile"
              description="Identity used across customer-facing surfaces and audit records."
            >
              <Field label="Business name" value={currentWorkspace.name} />
              <Field label="Workspace slug" value="tehran-dental" suffix=".airec.app" />
              <Select label="Locale" value="Persian / English" options={["Persian / English", "English (United States)", "English (UK)", "Español", "Français"]} />
              <Select label="Timezone" value="Asia/Tehran" options={["Asia/Tehran", "Asia/Dubai", "Europe/London", "America/New_York", "Asia/Singapore"]} />
              <div className="grid gap-2 mb-1 sm:grid-cols-[180px_1fr] sm:items-center">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <div>
                  <span className="inline-flex items-center gap-2 rounded-md border border-success/25 bg-success/10 px-2 py-1 text-[11px] font-medium text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" /> Active
                  </span>
                </div>
              </div>
            </Section>

            {/* Workspace */}
            <Section
              id="workspace"
              icon={Users2}
              title="Workspace settings"
              description="How this workspace is shared and how conversations are routed to operators."
            >
              <Field label="Active workspace" value={currentWorkspace.name} readOnly />
              <Select
                label="Workspace visibility"
                value="Private — invite only"
                options={["Private — invite only", "Restricted — domain allowlist", "Open within organization"]}
              />
              <Select
                label="Operator assignment"
                value="Round-robin among active operators"
                options={[
                  "Round-robin among active operators",
                  "Load-balanced (fewest open conversations)",
                  "Manual assignment only",
                ]}
              />
              <Callout
                tone="info"
                icon={Lock}
                title="Workspace-scoped data"
                body="Customers, conversations and notes are isolated to this workspace. Server verifies membership on every tenant-scoped request."
              />
            </Section>

            {/* Reception */}
            <Section
              id="reception"
              icon={Inbox}
              title="Reception settings"
              description="Defaults applied when a new customer message arrives."
            >
              <Select
                label="Default conversation status"
                value="New"
                options={["New", "Open", "Needs review"]}
              />
              <div className="space-y-3 mt-2">
                <Toggle label="Auto-classification of incoming messages" enabled={false} disabled note="Planned capability — operators classify manually for MVP" />
                <Toggle label="Manual review mode" enabled note="Every reply is reviewed and sent by an operator" />
                <Toggle label="Notify assigned operator on new message" enabled />
              </div>
            </Section>

            {/* AI */}
            <Section
              id="ai"
              icon={Sparkles}
              title="AI assistance"
              description="AI prepares drafts. An operator reviews and sends every reply."
            >
              <Callout
                tone="primary"
                icon={Sparkles}
                title="Human review required"
                body="AI auto-reply is intentionally disabled in MVP. Drafts are suggestions, never sent automatically."
              />
              <div className="space-y-3 mt-4">
                <Toggle label="AI draft assistance" enabled={false} disabled note="Future capability — operators draft manually for MVP" />
                <Toggle label="Human review required for every reply" enabled locked note="Cannot be disabled in MVP" />
                <Toggle label="Auto-reply without operator review" enabled={false} disabled note="Not available in MVP" />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Card title="Confidence threshold" hint="Placeholder — no AI active.">
                  <RangeMock value={75} />
                  <p className="mt-2 text-[11px] text-muted-foreground">Drafts below this confidence will be flagged for extra review.</p>
                </Card>
                <Card title="Source / context requirement" hint="Placeholder — no AI active.">
                  <Select compact label="" value="At least one supporting source" options={["No requirement", "At least one supporting source", "Two or more supporting sources"]} />
                  <p className="mt-2 text-[11px] text-muted-foreground">Drafts must cite workspace knowledge before being suggested.</p>
                </Card>
              </div>
            </Section>

            {/* Audit */}
            <Section
              id="audit"
              icon={ShieldCheck}
              title="Audit settings"
              description="What this workspace records to the audit log for compliance and review."
            >
              <div className="space-y-3">
                <Toggle label="Audit sensitive actions" enabled />
                <Toggle label="Track member changes" enabled />
                <Toggle label="Track role changes" enabled />
                <Toggle label="Track settings changes" enabled />
                <Toggle label="Track conversation deletions" enabled />
              </div>
              <Callout
                tone="info"
                icon={Eye}
                title="Audit log retention"
                body="Audit entries are retained for 90 days in this prototype. Retention policies are a planned capability."
              />
            </Section>

            {/* Future integrations */}
            <Section
              id="integrations"
              icon={Plug}
              title="Future integrations"
              description="Channel and provider integrations are not enabled in MVP."
            >
              <Callout
                tone="warning"
                icon={AlertTriangle}
                title="Not enabled in MVP"
                body="These integrations are visual placeholders only. No external providers are connected."
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {futureIntegrations.map((c) => {
                  const Icon = c.icon;
                  const tagVariant =
                    c.label === "Future"
                      ? "muted-status-tag--future"
                      : "muted-status-tag--planned";
                  return (
                    <div key={c.name} className="muted-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="muted-icon-tile grid h-9 w-9 place-items-center rounded-lg">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[color:var(--text-secondary)]">
                              {c.name}
                            </div>
                            <span className={`muted-status-tag mt-1 ${tagVariant}`}>
                              {c.label}
                            </span>
                          </div>
                        </div>
                        <span className="muted-status-tag muted-status-tag--not-enabled">
                          Not enabled
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-[color:var(--text-tertiary)]">
                        {c.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-medium">{title}</h2>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  suffix,
  readOnly,
}: {
  label: string;
  value: string;
  suffix?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="grid gap-2 mb-3 last:mb-0 sm:grid-cols-[180px_1fr] sm:items-center">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-stretch overflow-hidden rounded-lg border border-input bg-surface focus-within:ring-2 focus-within:ring-ring/40">
        <input
          defaultValue={value}
          readOnly={readOnly}
          className={`h-9 w-full bg-transparent px-3 text-sm focus:outline-none ${readOnly ? "text-muted-foreground" : ""}`}
        />
        {suffix && (
          <span className="grid place-items-center border-l border-border bg-surface-muted px-3 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  compact,
}: {
  label: string;
  value: string;
  options: string[];
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-2 ${compact ? "" : "mb-3 last:mb-0 sm:grid-cols-[180px_1fr] sm:items-center"}`}>
      {label && <label className="text-xs font-medium text-muted-foreground">{label}</label>}
      <select
        defaultValue={value}
        className="h-9 w-full rounded-lg border border-input bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  label,
  enabled,
  disabled,
  locked,
  note,
}: {
  label: string;
  enabled: boolean;
  disabled?: boolean;
  locked?: boolean;
  note?: string;
}) {
  const [on, setOn] = useState(enabled);
  const isInteractive = !disabled && !locked;
  return (
    <div
      className={`flex items-center justify-between rounded-lg border border-border px-4 py-3 ${
        disabled ? "bg-surface-muted/60" : "bg-surface"
      }`}
    >
      <div className="min-w-0 pr-3">
        <div className={`flex items-center gap-2 text-sm ${disabled ? "text-muted-foreground" : "font-medium"}`}>
          {label}
          {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
        </div>
        {note && <div className="mt-1 text-[11px] text-muted-foreground">{note}</div>}
      </div>
      <button
        type="button"
        disabled={!isInteractive}
        onClick={() => isInteractive && setOn((v) => !v)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
          on ? "bg-primary" : "bg-border-strong"
        } ${!isInteractive ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        aria-pressed={on}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            on ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">{title}</div>
        {hint && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function RangeMock({ value }: { value: number }) {
  return (
    <div>
      <div className="relative h-1.5 w-full rounded-full bg-secondary">
        <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${value}%` }} />
        <div
          className="absolute -top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-white shadow"
          style={{ left: `calc(${value}% - 7px)` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>0</span>
        <span className="font-medium text-foreground">{value}%</span>
        <span>100</span>
      </div>
    </div>
  );
}

function Callout({
  tone,
  icon: Icon,
  title,
  body,
}: {
  tone: "info" | "warning" | "primary";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  const toneCls = {
    info: "callout--info",
    warning: "callout--warning",
    primary: "callout--primary",
  } as const;
  return (
    <div className={`callout mt-4 ${toneCls[tone]}`}>
      <div className="callout-title">
        <Icon className="callout-icon" />
        {title}
      </div>
      <p className="callout-body">{body}</p>
    </div>
  );
}
