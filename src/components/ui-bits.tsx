import type { ConvStatus, Channel, ChipStatus } from "@/lib/mock-data";

const chipStyles: Record<ChipStatus, string> = {
  new: "bg-info/10 text-info border-info/20",
  open: "bg-success/10 text-success border-success/20",
  waiting: "bg-warning/15 text-warning-foreground border-warning/30",
  closed: "bg-muted text-muted-foreground border-border",
  "needs-review": "bg-primary-soft text-primary border-primary/20",
  "access-denied": "bg-destructive/10 text-destructive border-destructive/20",
  future: "bg-surface-muted text-muted-foreground border-dashed border-border",
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
  // Map legacy ConvStatus values onto the chip status set
  const map: Record<string, ChipStatus> = {
    open: "open",
    pending: "waiting",
    snoozed: "waiting",
    closed: "closed",
  };
  const key = (map[status as string] ?? (status as ChipStatus)) as ChipStatus;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${chipStyles[key]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {chipLabel[key]}
    </span>
  );
}

const channelTone: Record<Channel, string> = {
  email: "bg-info/10 text-info border-info/20",
  webform: "bg-secondary text-secondary-foreground",
  "web-chat": "bg-primary-soft text-primary border-primary/20",
  instagram: "bg-[oklch(0.95_0.05_330)] text-[oklch(0.45_0.15_330)] border-[oklch(0.85_0.08_330)]",
  whatsapp: "bg-[oklch(0.95_0.06_150)] text-[oklch(0.4_0.15_150)] border-[oklch(0.85_0.1_150)]",
  telegram: "bg-[oklch(0.95_0.05_215)] text-[oklch(0.45_0.15_215)] border-[oklch(0.85_0.08_215)]",
  sms: "bg-muted text-muted-foreground border-border",
  voice: "bg-muted text-muted-foreground border-border",
};

const plannedChannels: Channel[] = ["instagram", "whatsapp", "telegram", "sms", "voice"];

export function ChannelChip({ channel, label }: { channel: Channel; label: string }) {
  const planned = plannedChannels.includes(channel);
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${channelTone[channel]}`}>
      {label}
      {planned && <span className="ml-0.5 text-[9px] opacity-70 uppercase tracking-wider">· planned</span>}
    </span>
  );
}

export function Avatar({ initials, tone = "neutral" }: { initials: string; tone?: "neutral" | "primary" }) {
  const cls =
    tone === "primary"
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-secondary-foreground";
  return (
    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${cls}`}>
      {initials}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function MockBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
      <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-warning/30 text-[10px] font-bold text-warning-foreground">
        i
      </span>
      <div className="text-[13px] leading-snug text-warning-foreground">
        <span className="font-semibold">Prototype with mock data only.</span>{" "}
        Async MVP, human-review-first. No backend, auth, or providers connected.
        AI prepares drafts; an operator sends every reply.
      </div>
    </div>
  );
}
