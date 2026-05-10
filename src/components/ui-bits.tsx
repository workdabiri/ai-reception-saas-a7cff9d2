import type { ConvStatus, Channel, ChipStatus } from "@/lib/mock-data";
import { Info } from "lucide-react";

const chipStyles: Record<ChipStatus, string> = {
  new: "bg-info/12 text-info ring-info/30",
  open: "bg-success/12 text-success ring-success/25",
  waiting: "bg-warning/20 text-warning-foreground ring-warning/40",
  closed: "bg-secondary text-muted-foreground ring-border",
  "needs-review": "bg-ai-soft text-[oklch(0.40_0.18_290)] ring-[oklch(0.55_0.20_295)]/25",
  "access-denied": "bg-destructive/12 text-destructive ring-destructive/30",
  future: "bg-surface-muted text-muted-foreground ring-border",
};

const chipLabel: Record<ChipStatus, string> = {
  new: "New",
  open: "Open",
  waiting: "Waiting",
  closed: "Closed",
  "needs-review": "Needs review",
  "access-denied": "Access denied",
  future: "Future",
};

export function StatusChip({ status }: { status: ChipStatus | ConvStatus }) {
  const map: Record<string, ChipStatus> = {
    open: "open",
    pending: "waiting",
    snoozed: "waiting",
    closed: "closed",
  };
  const key = (map[status as string] ?? (status as ChipStatus)) as ChipStatus;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${chipStyles[key]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90 shadow-[0_0_0_2px_currentColor]/0" />
      {chipLabel[key]}
    </span>
  );
}

const channelTone: Record<Channel, string> = {
  email: "bg-primary-soft text-primary ring-primary/20",
  webform: "bg-info/12 text-info ring-info/25",
  sms: "bg-warning/20 text-warning-foreground ring-warning/35",
  whatsapp: "bg-success/12 text-success ring-success/25",
  voice: "bg-secondary text-secondary-foreground ring-border",
};

export function ChannelChip({ channel, label }: { channel: Channel; label: string }) {
  const planned = channel === "sms" || channel === "whatsapp" || channel === "voice";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${channelTone[channel]}`}
    >
      <span className="h-1 w-1 rounded-full bg-current opacity-70" />
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
    <div className="flex items-start gap-3 rounded-xl border border-warning/25 bg-gradient-to-r from-warning/10 via-warning/5 to-transparent px-4 py-3 shadow-soft">
      <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-warning/25 text-warning-foreground">
        <Info className="h-3 w-3" />
      </span>
      <div className="text-[12.5px] leading-snug text-warning-foreground/90">
        <span className="font-semibold text-warning-foreground">Prototype with mock data only.</span>{" "}
        Async MVP, human-review-first. No backend, auth, or providers connected. AI prepares drafts; an operator sends every reply.
      </div>
    </div>
  );
}
