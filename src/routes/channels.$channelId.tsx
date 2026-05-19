import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Copy, ExternalLink, Info } from "lucide-react";
import { PageHeader, MockBanner } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pill } from "@/components/ui/pill";
import { ChannelIcon } from "@/components/channel-icon";
import { ChannelStateTag } from "@/components/channel-state-tag";
import type { ChannelKey, ChannelState } from "@/lib/channels";
import {
  useStateParam,
  presets as statePresets,
  RouteStatePage,
  RouteSkeleton,
} from "@/components/route-state";

export const Route = createFileRoute("/channels/$channelId")({
  head: ({ params }) => ({
    meta: [
      { title: `Channel setup — ${params.channelId} — AI Reception` },
      {
        name: "description",
        content: `Setup details and prototype status for the ${params.channelId} channel.`,
      },
    ],
  }),
  component: ChannelDetailPage,
});

type ChannelStatusLabel = "Mock Active" | "Planned" | "Future";

type ChannelDetail = {
  id: string;
  iconKey: ChannelKey;
  name: string;
  type: string;
  status: ChannelStatusLabel;
  state: ChannelState;
  availability: string;
  description: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  setupSteps: { label: string; done: boolean; note?: string }[];
  requirements: string[];
  limitations: string[];
  mockMetrics: { label: string; value: string }[];
  stateNotes: string[];
};

const CHANNELS: Record<string, ChannelDetail> = {
  "web-chat": {
    id: "web-chat",
    iconKey: "web_chat",
    name: "Web Chat",
    type: "Customer-facing widget",
    status: "Mock Active",
    state: "active",
    availability: "Available in prototype",
    description: "Add a customer-facing website chat widget for inbound messages.",
    primaryActionLabel: "Preview widget",
    secondaryActionLabel: "Copy mock embed code",
    setupSteps: [
      { label: "Create workspace", done: true },
      { label: "Business profile configured", done: true },
      { label: "Web Chat selected", done: true },
      { label: "Embed code copied", done: false, note: "Mock only" },
      { label: "Test message sent", done: false, note: "Mock only" },
    ],
    requirements: [
      "A website where the widget can be embedded",
      "Operator coverage during business hours",
      "Working hours configured in Settings",
    ],
    limitations: [
      "Prototype only — no real script is served",
      "No realtime delivery in this mock",
      "Operators send every reply manually",
    ],
    mockMetrics: [
      { label: "Unread", value: "3" },
      { label: "Customers", value: "14" },
      { label: "Waiting", value: "2" },
    ],
    stateNotes: ["AI may prepare drafts, but operators send final replies."],
  },
  email: {
    id: "email",
    iconKey: "email",
    name: "Email",
    type: "Shared inbox",
    status: "Mock Active",
    state: "active",
    availability: "Available in prototype",
    description: "Triage customer messages from a shared email inbox.",
    primaryActionLabel: "Send mock email test",
    secondaryActionLabel: "Copy mock forwarding address",
    setupSteps: [
      { label: "Shared inbox chosen", done: true, note: "Mock complete" },
      { label: "Forwarding address generated", done: true, note: "Mock complete" },
      { label: "Test email received", done: false, note: "Mock only" },
      { label: "Operator routing configured", done: false, note: "Mock only" },
    ],
    requirements: [
      "An email address you can forward from",
      "Access to your mail provider's forwarding settings",
    ],
    limitations: [
      "Prototype only — no real mailbox is connected",
      "No real provider, no SMTP, no IMAP",
      "Operators send every reply manually",
    ],
    mockMetrics: [
      { label: "Unread", value: "5" },
      { label: "Customers", value: "22" },
      { label: "Waiting", value: "3" },
    ],
    stateNotes: ["AI may prepare drafts, but operators send final replies."],
  },
  instagram: {
    id: "instagram",
    iconKey: "instagram",
    name: "Instagram DM",
    type: "Social DM",
    status: "Planned",
    state: "planned",
    availability: "Not enabled in MVP",
    description: "Instagram DM support is planned for a future integration.",
    primaryActionLabel: "Not enabled in MVP",
    secondaryActionLabel: "Back to Channels",
    setupSteps: [],
    requirements: [
      "A connected Meta Business account (future)",
      "Operator coverage for DM replies (future)",
    ],
    limitations: ["No Instagram provider is connected", "No real messages are sent or received"],
    mockMetrics: [],
    stateNotes: ["This provider is not connected. No real messages are sent or received."],
  },
  whatsapp: {
    id: "whatsapp",
    iconKey: "whatsapp",
    name: "WhatsApp",
    type: "Messaging",
    status: "Planned",
    state: "planned",
    availability: "Not enabled in MVP",
    description: "WhatsApp support is planned. No provider is connected in this prototype.",
    primaryActionLabel: "Not enabled in MVP",
    secondaryActionLabel: "Back to Channels",
    setupSteps: [],
    requirements: [
      "A WhatsApp Business API provider account (future)",
      "Approved sender number and templates (future)",
    ],
    limitations: ["No WhatsApp provider is connected", "No real messages are sent or received"],
    mockMetrics: [],
    stateNotes: ["This provider is not connected. No real messages are sent or received."],
  },
  telegram: {
    id: "telegram",
    iconKey: "telegram",
    name: "Telegram",
    type: "Messaging",
    status: "Planned",
    state: "planned",
    availability: "Not enabled in MVP",
    description: "Telegram support is planned for a future integration.",
    primaryActionLabel: "Not enabled in MVP",
    secondaryActionLabel: "Back to Channels",
    setupSteps: [],
    requirements: ["A Telegram bot token (future)", "Operator coverage for bot replies (future)"],
    limitations: ["No Telegram bot is connected", "No real messages are sent or received"],
    mockMetrics: [],
    stateNotes: ["This provider is not connected. No real messages are sent or received."],
  },
  sms: {
    id: "sms",
    iconKey: "sms",
    name: "SMS",
    type: "Text messaging",
    status: "Planned",
    state: "planned",
    availability: "Not enabled in MVP",
    description: "SMS support is planned. No Twilio or SMS provider is connected.",
    primaryActionLabel: "Not enabled in MVP",
    secondaryActionLabel: "Back to Channels",
    setupSteps: [],
    requirements: [
      "A provider account such as Twilio (future)",
      "A verified sender number (future)",
    ],
    limitations: [
      "No Twilio or SMS provider is connected",
      "No real messages are sent or received",
    ],
    mockMetrics: [],
    stateNotes: ["This provider is not connected. No real messages are sent or received."],
  },
  voice: {
    id: "voice",
    iconKey: "call",
    name: "Voice",
    type: "Voice reception",
    status: "Future",
    state: "planned",
    availability: "Future capability",
    description: "Voice reception is a future capability and is not enabled in this MVP.",
    primaryActionLabel: "Not enabled in MVP",
    secondaryActionLabel: "Back to Channels",
    setupSteps: [],
    requirements: [
      "A voice provider with transcription (future)",
      "Routing rules for inbound calls (future)",
    ],
    limitations: [
      "Voice reception is future-only and not part of the MVP",
      "No calls are received or transcribed",
    ],
    mockMetrics: [],
    stateNotes: ["Voice reception is future-only and not part of the MVP."],
  },
};

function ChannelDetailPage() {
  const { channelId } = Route.useParams();
  const channel = CHANNELS[channelId];
  const stateOverride = useStateParam();

  if (!channel) {
    return <UnknownChannel id={channelId} />;
  }

  if (stateOverride === "provider-unavailable") {
    return (
      <RouteStatePage title={channel.name}>
        {statePresets.channelDetailProviderUnavailable()}
      </RouteStatePage>
    );
  }
  if (stateOverride === "planned") {
    return <RouteStatePage title={channel.name}>{statePresets.channelPlanned()}</RouteStatePage>;
  }
  if (stateOverride === "loading") {
    return (
      <RouteStatePage title={channel.name} description="Loading setup…">
        <RouteSkeleton variant="settings" />
      </RouteStatePage>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8 space-y-6">
      <BackLink />
      <Header channel={channel} />
      <MockBanner />

      {channel.id === "web-chat" ? (
        <WebChatBody channel={channel} />
      ) : channel.id === "email" ? (
        <EmailBody channel={channel} />
      ) : (
        <PlannedBody channel={channel} />
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/channels"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to Channels
    </Link>
  );
}

function statusPillVariant(status: ChannelStatusLabel) {
  if (status === "Mock Active") return "success" as const;
  if (status === "Planned") return "warn" as const;
  return "muted" as const;
}

function Header({ channel }: { channel: ChannelDetail }) {
  return (
    <PageHeader
      eyebrow={channel.type}
      title={channel.name}
      description={channel.description}
      action={
        <div className="flex items-center gap-2">
          <Pill variant={statusPillVariant(channel.status)}>{channel.status}</Pill>
          <ChannelStateTag state={channel.state} />
        </div>
      }
    />
  );
}

/* -------------------- Web Chat -------------------- */

const WEB_CHAT_EMBED = `<script
  src="https://example.ai-reception-saas.dev/widget.js"
  data-business-id="tehran-dental-clinic"
  data-channel="web-chat">
</script>`;

const WIDGET_STATES = [
  "Welcome",
  "Form",
  "Submitted",
  "Active thread",
  "Offline",
  "AI unavailable",
  "Provider unavailable",
  "Closed",
];

function WebChatBody({ channel }: { channel: ChannelDetail }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card
          title="Header actions"
          subtitle="Open the customer-facing preview or copy the mock embed."
        >
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/widget-preview">
                Preview widget <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <CopyButton text={WEB_CHAT_EMBED} label="Copy mock embed code" />
            <Button asChild variant="outline">
              <Link to="/chat/$businessId" params={{ businessId: "tehran-dental-clinic" }}>
                Open public chat page <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </Card>

        <Card title="Setup status">
          <SetupChecklist steps={channel.setupSteps} />
        </Card>

        <Card
          title="Mock embed code"
          subtitle="Mock embed code — prototype only. No real script is served."
        >
          <MockCodeBlock code={WEB_CHAT_EMBED} />
        </Card>

        <Card title="Send a test message" subtitle="Local mock only — nothing is sent.">
          <TestMessagePanel
            fields={[
              { id: "name", label: "Customer name", placeholder: "Sara" },
              {
                id: "message",
                label: "Message",
                placeholder: "Hi, I'd like to book…",
                multiline: true,
              },
            ]}
            buttonLabel="Send test message"
            resultText="Test message would appear in Inbox as Web Chat."
          />
        </Card>

        <Card
          title="Widget states preview"
          subtitle="Open any state inside the widget preview surface."
        >
          <div className="flex flex-wrap gap-2">
            {WIDGET_STATES.map((s) => (
              <Button key={s} asChild variant="outline" size="sm">
                <Link to="/widget-preview">{s}</Link>
              </Button>
            ))}
          </div>
        </Card>

        <Card title="Operator routing">
          <KVList
            items={[
              { k: "Default assignee", v: "Unassigned" },
              { k: "First response mode", v: "Human review" },
              { k: "AI draft", v: "Enabled (mock)" },
              { k: "Auto-send", v: "Disabled" },
            ]}
          />
          <Note text="AI may prepare drafts, but operators send final replies." />
        </Card>
      </div>

      <Sidebar channel={channel} />
    </div>
  );
}

/* -------------------- Email -------------------- */

const EMAIL_FORWARD = "inbox+tehran-dental-clinic@example.ai-reception-saas.dev";

function EmailBody({ channel }: { channel: ChannelDetail }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card title="Header actions">
          <div className="flex flex-wrap gap-2">
            <Button>Send mock email test</Button>
            <CopyButton text={EMAIL_FORWARD} label="Copy mock forwarding address" />
          </div>
        </Card>

        <Card
          title="Mock forwarding address"
          subtitle="Mock forwarding address — prototype only. No real mailbox is connected."
        >
          <MockCodeBlock code={EMAIL_FORWARD} />
        </Card>

        <Card title="Setup checklist">
          <SetupChecklist steps={channel.setupSteps} />
        </Card>

        <Card title="Send a test email" subtitle="Local mock only — nothing is sent.">
          <TestMessagePanel
            fields={[
              { id: "sender", label: "Sender email", placeholder: "person@example.com" },
              { id: "subject", label: "Subject", placeholder: "Booking inquiry" },
              { id: "message", label: "Message", placeholder: "Hi, I'd like to…", multiline: true },
            ]}
            buttonLabel="Send mock test email"
            resultText="Mock email would appear in Inbox as Email."
          />
        </Card>

        <Card title="Routing rules">
          <KVList
            items={[
              { k: "New email conversations", v: "Unassigned" },
              { k: "Needs follow-up after", v: "24h" },
              { k: "AI draft", v: "Human review required" },
              { k: "Auto-send", v: "Disabled" },
            ]}
          />
          <Note text="No real email provider is connected. Operators send every reply." />
        </Card>
      </div>

      <Sidebar channel={channel} />
    </div>
  );
}

/* -------------------- Planned / Future -------------------- */

function PlannedBody({ channel }: { channel: ChannelDetail }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card title="Header actions">
          <div className="flex flex-wrap gap-2">
            <Button disabled>{channel.primaryActionLabel}</Button>
            <Button asChild variant="outline">
              <Link to="/channels">Back to Channels</Link>
            </Button>
          </div>
        </Card>

        <Card title="What this channel will support">
          <p className="text-sm text-muted-foreground">{channel.description}</p>
        </Card>

        <Card title="Current prototype status">
          <KVList
            items={[
              { k: "Status", v: channel.status },
              { k: "Availability", v: channel.availability },
              { k: "Provider", v: "Not connected" },
              { k: "Operator routing", v: "Not configured" },
            ]}
          />
        </Card>

        <Card title="Requirements before enabling">
          <ul className="space-y-2 text-sm text-muted-foreground">
            {channel.requirements.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/60" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Safety note">
          <Note text={channel.stateNotes[0] ?? "This provider is not connected."} />
        </Card>
      </div>

      <Sidebar channel={channel} />
    </div>
  );
}

/* -------------------- Sidebar -------------------- */

function Sidebar({ channel }: { channel: ChannelDetail }) {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <ChannelIcon channel={channel.iconKey} state={channel.state} size="lg" />
          <div className="min-w-0">
            <div className="text-sm font-medium">{channel.name}</div>
            <div className="text-xs text-muted-foreground">{channel.availability}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <KVRow k="Type" v={channel.type} />
          <KVRow k="Status" v={channel.status} />
        </div>
      </div>

      {channel.mockMetrics.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Mock metrics
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {channel.mockMetrics.map((m) => (
              <div key={m.label} className="rounded-lg bg-surface-muted/60 px-2 py-2">
                <div className="text-base font-medium tabular-nums">{m.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Limitations
        </div>
        <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          {channel.limitations.map((l) => (
            <li key={l} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/60" />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/* -------------------- Reusable bits -------------------- */

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-3">
        <h2 className="text-sm font-medium tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function SetupChecklist({ steps }: { steps: { label: string; done: boolean; note?: string }[] }) {
  if (steps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No setup steps in this prototype. This channel is not enabled in MVP.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {steps.map((s) => (
        <li
          key={s.label}
          className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-surface px-3 py-2"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${
                s.done
                  ? "bg-success/15 text-foreground ring-1 ring-success/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.done ? <Check className="h-3 w-3" /> : null}
            </span>
            <span className="truncate text-sm">{s.label}</span>
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {s.done ? "Complete" : (s.note ?? "Pending")}
          </span>
        </li>
      ))}
    </ul>
  );
}

function MockCodeBlock({ code }: { code: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-[color:var(--bg-app)] p-3">
      <pre className="font-mono text-[12px] leading-relaxed text-foreground whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard?.writeText(text);
        } catch {
          /* mock — ignore */
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </Button>
  );
}

type TestField = {
  id: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
};

function TestMessagePanel({
  fields,
  buttonLabel,
  resultText,
}: {
  fields: TestField[];
  buttonLabel: string;
  resultText: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.id} className={f.multiline ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
            <Label htmlFor={`tm-${f.id}`} className="text-xs">
              {f.label}
            </Label>
            {f.multiline ? (
              <Textarea
                id={`tm-${f.id}`}
                placeholder={f.placeholder}
                value={values[f.id] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                rows={3}
              />
            ) : (
              <Input
                id={`tm-${f.id}`}
                placeholder={f.placeholder}
                value={values[f.id] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            setSent(true);
            setTimeout(() => setSent(false), 2400);
          }}
        >
          {buttonLabel}
        </Button>
        {sent && (
          <span className="inline-flex items-center gap-1.5 text-xs text-success">
            <Check className="h-3.5 w-3.5" />
            {resultText}
          </span>
        )}
      </div>
    </div>
  );
}

function KVList({ items }: { items: { k: string; v: string }[] }) {
  return (
    <dl className="divide-y divide-border/70">
      {items.map((i) => (
        <div key={i.k} className="flex items-center justify-between gap-3 py-2 text-sm">
          <dt className="text-muted-foreground">{i.k}</dt>
          <dd className="font-medium">{i.v}</dd>
        </div>
      ))}
    </dl>
  );
}

function KVRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-surface-muted/60 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="text-xs font-medium">{v}</div>
    </div>
  );
}

function Note({ text }: { text: string }) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg border border-border/70 bg-surface-muted/40 px-3 py-2 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

/* -------------------- Unknown channel -------------------- */

function UnknownChannel({ id }: { id: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
          <Info className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-xl font-medium tracking-tight">Channel not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This channel{id ? ` (“${id}”)` : ""} does not exist or is not available in this workspace.
        </p>
        <div className="mt-5">
          <Button asChild>
            <Link to="/channels">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Channels
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
