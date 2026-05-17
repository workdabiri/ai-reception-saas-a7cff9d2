import type { ConvStatus, Channel, ChipStatus } from "@/lib/mock-data";
import { Info, X } from "lucide-react";
import { useState } from "react";

// Monday-style strict semantics. Each chip color carries a distinct meaning:
//   new        → neutral (untouched)
//   open       → info/blue (being actioned)
//   waiting    → warning/amber (on customer)
//   follow-up  → attention/orange (we're overdue)
//   urgent     → destructive/rose
//   needs-review → ai/violet (AI awaits operator)
//   active     → success/emerald
//   closed     → success, de-emphasized (done)
//   future     → neutral muted (planned)
const chipStyles: Record<ChipStatus | "follow-up" | "urgent" | "active", string> = {
  new: "bg-info/12 text-foreground ring-info/30",
  open: "bg-info/10 text-info ring-info/25",
  waiting: "bg-warning/12 text-foreground ring-warning/30",
  closed: "bg-success/8 text-success/85 ring-success/20",
  "needs-review": "bg-ai-soft text-ai ring-ai/25",
  "follow-up": "bg-attention/12 text-foreground ring-attention/30",
  urgent: "bg-destructive/10 text-destructive ring-destructive/25",
  active: "bg-success/10 text-success ring-success/25",
  "access-denied": "bg-destructive/10 text-destructive ring-destructive/25",
  future: "bg-secondary text-muted-foreground ring-border",
};

const chipLabel: Record<ChipStatus | "follow-up" | "urgent" | "active", string> = {
  new: "New",
  open: "Open",
  waiting: "Waiting",
  closed: "Closed",
  "needs-review": "Needs review",
  "follow-up": "Follow-up",
  urgent: "Urgent",
  active: "Active",
  "access-denied": "Access denied",
  future: "Future",
};

export function StatusChip({ status }: { status: ChipStatus | ConvStatus | "follow-up" | "urgent" | "active" }) {
  const map: Record<string, keyof typeof chipStyles> = {
    open: "open",
    pending: "waiting",
    snoozed: "waiting",
    closed: "closed",
  };
  const key = (map[status as string] ?? (status as keyof typeof chipStyles));
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${chipStyles[key]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {chipLabel[key]}
    </span>
  );
}

// Neutral-first channel chips: all channels share one neutral surface so the
// inbox/dashboard isn't a rainbow of channel backgrounds. A brand-colored dot
// gives each channel an at-a-glance identity. Planned channels read as muted.
const channelDotVar: Record<Channel, string> = {
  email: "var(--channel-email)",
  webform: "var(--channel-webform)",
  sms: "var(--channel-sms)",
  whatsapp: "var(--channel-whatsapp)",
  voice: "var(--channel-voice)",
};

export function ChannelChip({ channel, label }: { channel: Channel; label: string }) {
  const planned = channel === "sms" || channel === "whatsapp" || channel === "voice";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground ring-1 ring-inset ring-border"
      style={planned ? { opacity: 0.7 } : undefined}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: channelDotVar[channel] }}
      />
      {label}
      {planned && (
        <span className="ml-1 text-[9px] uppercase tracking-wider text-muted-foreground/70">
          soon
        </span>
      )}
    </span>
  );
}

export function Avatar({
  initials,
  tone = "neutral",
  size = "md",
}: {
  initials: string;
  tone?: "neutral" | "primary";
  size?: "sm" | "md" | "lg";
}) {
  const cls =
    tone === "primary"
      ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
      : "bg-gradient-to-br from-secondary to-surface-muted text-secondary-foreground";
  const sz =
    size === "sm" ? "h-7 w-7 text-[10px]" : size === "lg" ? "h-10 w-10 text-sm" : "h-8 w-8 text-[11px]";
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full font-medium ring-1 ring-border/60 shadow-soft ${cls} ${sz}`}
    >
      {initials}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[26px] font-medium tracking-tight leading-tight">{title}</h1>
        {description && (
          <p className="mt-2 text-[13px] text-muted-foreground max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function MockBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="callout callout--pending flex items-start gap-3">
      <Info className="callout-icon mt-0.5 shrink-0" />
      <div className="flex-1 callout-body">
        <span className="callout-title" style={{ marginBottom: 0, display: "inline" }}>
          Prototype with mock data only.
        </span>{" "}
        Async MVP, human-review-first. No backend, auth, or providers connected. AI prepares drafts; an operator sends every reply.
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded text-muted-foreground transition hover:text-foreground hover:bg-secondary"
        aria-label="Dismiss"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
