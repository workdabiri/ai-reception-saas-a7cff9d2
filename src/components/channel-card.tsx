import { Activity, MessageSquare, Users, Clock } from "lucide-react";
import type { ChannelInfo, ChannelStatus } from "@/lib/mock-data";

const statusTone: Record<ChannelStatus, string> = {
  "Mock Active": "bg-success/10 text-success border-success/20",
  Planned: "bg-warning/15 text-warning-foreground border-warning/30",
  Future: "bg-muted text-muted-foreground border-border",
  "Not enabled in MVP": "bg-muted text-muted-foreground border-border",
};

const healthDot: Record<ChannelInfo["health"], string> = {
  ok: "bg-success",
  warn: "bg-warning",
  off: "bg-muted-foreground/40",
};

export function ChannelCard({ c, compact = false }: { c: ChannelInfo; compact?: boolean }) {
  const accent = `oklch(0.6 0.14 ${c.hue})`;
  const soft = `oklch(0.96 0.04 ${c.hue})`;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:shadow-card">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl text-[11px] font-bold"
            style={{ backgroundColor: soft, color: accent }}
          >
            {c.short}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight">{c.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${healthDot[c.health]}`} />
              {c.health === "ok" ? "Healthy" : "Not enabled"}
            </div>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusTone[c.status]}`}
        >
          {c.status}
        </span>
      </div>

      <div className={`mt-4 grid ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"} gap-3 text-xs`}>
        <Stat icon={MessageSquare} label="Unread" value={c.unread} highlight={c.unread > 0} />
        <Stat icon={Users} label="Customers" value={c.customers} />
        <Stat icon={Clock} label="Waiting" value={c.waiting} highlight={c.waiting > 0} />
        <Stat icon={Activity} label="Last msg" value={c.lastMessage} small />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  highlight,
  small,
}: {
  icon: typeof Activity;
  label: string;
  value: number | string;
  highlight?: boolean;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted/40 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div
        className={`mt-0.5 ${small ? "text-xs" : "text-base"} font-semibold tabular-nums ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
