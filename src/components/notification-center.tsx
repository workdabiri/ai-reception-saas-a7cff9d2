import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check, CheckCheck, Inbox as InboxIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  mockNotifications,
  CATEGORY_FILTERS,
  type MockNotification,
  type NotificationCategory,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

type FilterId = "all" | "unread" | NotificationCategory;

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MockNotification[]>(mockNotifications);
  const [filter, setFilter] = useState<FilterId>("all");

  const unreadCount = items.filter((n) => !n.read).length;

  const filtered = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.category === filter;
  });

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const markOneRead = (id: string) =>
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Open notifications"
          className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:text-foreground hover:bg-secondary"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span
              aria-hidden
              className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-2 ring-surface"
            />
          )}
          {unreadCount > 0 && (
            <span className="sr-only">{unreadCount} unread notifications</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-1rem)] sm:w-[400px] p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="text-[13px] font-medium text-foreground">
              Notifications
            </div>
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-px text-[10px] font-medium text-foreground ring-1 ring-inset ring-primary/25">
                {unreadCount} unread
              </span>
            )}
          </div>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-1 overflow-x-auto border-b border-border/60 px-3 py-2 [&::-webkit-scrollbar]:hidden">
          {CATEGORY_FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition",
                  active
                    ? "bg-primary-soft text-foreground ring-1 ring-inset ring-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyState onReset={() => setFilter("all")} />
          ) : (
            <ul className="divide-y divide-border/60">
              {filtered.map((n) => (
                <NotificationRow
                  key={n.id}
                  n={n}
                  onClick={() => {
                    markOneRead(n.id);
                    setOpen(false);
                  }}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 bg-surface/60 px-3 py-2">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-md py-1.5 text-[12px] font-medium text-foreground transition hover:bg-secondary"
          >
            View all activity
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  n,
  onClick,
}: {
  n: MockNotification;
  onClick?: () => void;
}) {
  const Icon = n.icon;
  return (
    <li>
      <Link
        to={n.to}
        onClick={onClick}
        className={cn(
          "group flex items-start gap-3 px-4 py-3 transition hover:bg-secondary/60",
          !n.read && "bg-primary-soft/30",
        )}
      >
        <span
          className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1 ring-inset"
          style={{
            background: `color-mix(in oklab, var(--${toneVar(n.tone)}) 10%, transparent)`,
            color: `var(--${toneVar(n.tone)})`,
            borderColor: "transparent",
            // @ts-expect-error css var passthrough
            "--tw-ring-color": `color-mix(in oklab, var(--${toneVar(n.tone)}) 25%, transparent)`,
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium leading-tight text-foreground">
                {n.title}
              </div>
              <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground line-clamp-2">
                {n.body}
              </p>
            </div>
            {!n.read && (
              <span
                aria-label="Unread"
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
              />
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className="text-[10.5px] text-muted-foreground/80">
              {n.time}
            </span>
            <span className="text-[10.5px] font-medium text-primary opacity-0 transition group-hover:opacity-100">
              {n.actionLabel} →
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-muted-foreground">
        <InboxIcon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-[13px] font-medium text-foreground">
          No notifications
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">
          You&rsquo;re all caught up.
        </p>
      </div>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:bg-secondary"
      >
        <Check className="h-3 w-3" />
        Back to all notifications
      </button>
    </div>
  );
}

function toneVar(tone: string): string {
  switch (tone) {
    case "info":
      return "info";
    case "ai":
      return "color-primary";
    case "destructive":
      return "destructive";
    case "primary":
      return "color-primary";
    case "success":
      return "success";
    case "warn":
      return "warning";
    default:
      return "muted-foreground";
  }
}
