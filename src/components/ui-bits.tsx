import type { ConvStatus, Channel, ChipStatus } from "@/lib/mock-data";
import { Info } from "lucide-react";

const chipStyles: Record<ChipStatus | "follow-up" | "urgent" | "active", string> = {
  new: "bg-info/12 text-info ring-info/30",
  open: "bg-info/12 text-info ring-info/25",
  waiting: "bg-warning/15 text-warning-foreground ring-warning/35",
  closed: "bg-secondary text-muted-foreground ring-border",
  "needs-review": "bg-ai-soft text-ai ring-ai/30",
  "follow-up": "bg-attention/12 text-attention ring-attention/30",
  urgent: "bg-destructive/12 text-destructive ring-destructive/30",
  active: "bg-success/12 text-success ring-success/25",
  "access-denied": "bg-destructive/12 text-destructive ring-destructive/30",
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${chipStyles[key]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {chipLabel[key]}
    </span>
  );
}

// Neutral-first: channel chip is a neutral pill with a small colored dot only.
// Active channels get a subtle brand/info dot; planned/future use slate/disabled.
const channelDot: Record<Channel, string> = {
  email: "bg-primary",
  webform: "bg-info",
  sms: "bg-muted-foreground/40",
  whatsapp: "bg-muted-foreground/40",
  voice: "bg-muted-foreground/40",
};

export function ChannelChip({ channel, label }: { channel: Channel; label: string }) {
  const planned = channel === "sms" || channel === "whatsapp" || channel === "voice";
  const tone = planned
    ? "bg-secondary text-muted-foreground/80 ring-border"
    : "bg-secondary text-foreground/80 ring-border";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tone}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${channelDot[channel]}`} />
      {label}
      {planned && <span className="ml-0.5 text-[9px] uppercase tracking-wider opacity-70">planned</span>}
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
      className={`grid shrink-0 place-items-center rounded-full font-semibold ring-1 ring-border/60 shadow-soft ${cls} ${sz}`}
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
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[26px] font-semibold tracking-tight leading-tight">{title}</h1>
        {description && (
          <p className="mt-1.5 text-[13px] text-muted-foreground max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function MockBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
      <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-secondary text-muted-foreground ring-1 ring-inset ring-border">
        <Info className="h-3 w-3" />
      </span>
      <div className="text-[12.5px] leading-snug text-muted-foreground">
        <span className="font-semibold text-foreground">Prototype with mock data only.</span>{" "}
        Async MVP, human-review-first. No backend, auth, or providers connected. AI prepares drafts; an operator sends every reply.
      </div>
    </div>
  );
}
