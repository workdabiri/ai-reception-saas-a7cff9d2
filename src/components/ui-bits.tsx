import type { ConvStatus, Channel } from "@/lib/mock-data";

const statusStyles: Record<ConvStatus, string> = {
  open: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  snoozed: "bg-info/10 text-info border-info/20",
  closed: "bg-muted text-muted-foreground border-border",
};

export function StatusChip({ status }: { status: ConvStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium capitalize ${statusStyles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

const channelTone: Record<Channel, string> = {
  email: "bg-secondary text-secondary-foreground",
  webform: "bg-secondary text-secondary-foreground",
  sms: "bg-muted text-muted-foreground",
  whatsapp: "bg-muted text-muted-foreground",
  voice: "bg-muted text-muted-foreground",
};

export function ChannelChip({ channel, label }: { channel: Channel; label: string }) {
  const planned = channel === "sms" || channel === "whatsapp" || channel === "voice";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[11px] font-medium ${channelTone[channel]}`}>
      {label}
      {planned && <span className="text-[10px] opacity-70">·  planned</span>}
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
