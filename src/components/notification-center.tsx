import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check, CheckCheck, Inbox } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  mockNotifications,
  categoryMeta,
  type MockNotification,
  type NotificationCategory,
} from "@/lib/notifications";

type Filter = "all" | "unread" | NotificationCategory;

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "conversation", label: "Conversations" },
  { id: "ai", label: "AI" },
  { id: "security", label: "Security" },
  { id: "members", label: "Members" },
  { id: "channels", label: "Channels" },
];

function NotificationRow({
  n,
  onMarkRead,
  onNavigate,
}: {
  n: MockNotification;
  onMarkRead: (id: string) => void;
  onNavigate: () => void;
}) {
  const meta = categoryMeta[n.category];
  const Icon = meta.icon;
  return (
    <li className="group relative flex gap-3 border-b border-border/60 px-4 py-3 last:border-b-0 hover:bg-secondary/40 transition-colors">
      <div
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset ${meta.tint}`}
      >
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {n.unread && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                  aria-label="Unread"
                />
              )}
              <p className="text-[13px] font-medium leading-tight text-foreground truncate">
                {n.title}
              </p>
            </div>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground line-clamp-2">
              {n.body}
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{meta.label}</span>
              <span className="opacity-50">·</span>
              <span>{n.time}</span>
            </div>
          </div>
          {n.unread && (
            <button
              onClick={() => onMarkRead(n.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Mark as read"
              title="Mark as read"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="mt-2">
          <Link
            to={n.to as "/"}
            onClick={onNavigate}
            className="inline-flex items-center text-[12px] font-medium text-primary hover:underline"
          >
            {n.actionLabel}
          </Link>
        </div>
      </div>
    </li>
  );
}

function NotificationBody({
  items,
  filter,
  setFilter,
  onMarkRead,
  onMarkAll,
  onClose,
}: {
  items: MockNotification[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  onMarkRead: (id: string) => void;
  onMarkAll: () => void;
  onClose: () => void;
}) {
  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((n) => n.unread);
    return items.filter((n) => n.category === filter);
  }, [items, filter]);

  const unreadCount = items.filter((n) => n.unread).length;

  return (
    <div className="flex flex-col max-h-[80vh] sm:max-h-[560px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div>
          <div className="text-[14px] font-medium text-foreground">Notifications</div>
          <div className="text-[11px] text-muted-foreground">
            {unreadCount} unread · Prototype only
          </div>
        </div>
        <button
          onClick={onMarkAll}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Mark all read
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border/60 px-3 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={[
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ring-1 ring-inset",
                active
                  ? "bg-primary-soft text-foreground ring-primary/30"
                  : "bg-transparent text-muted-foreground ring-border hover:bg-secondary hover:text-foreground",
              ].join(" ")}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <Inbox className="h-5 w-5" />
            </div>
            <div className="mt-3 text-[14px] font-medium text-foreground">
              No notifications
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              You're all caught up.
            </p>
            <button
              onClick={() => setFilter("all")}
              className="mt-3 inline-flex items-center text-[12px] font-medium text-primary hover:underline"
            >
              Back to all notifications
            </button>
          </div>
        ) : (
          <ul>
            {filtered.map((n) => (
              <NotificationRow
                key={n.id}
                n={n}
                onMarkRead={onMarkRead}
                onNavigate={onClose}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border/60 bg-surface-muted/50 px-4 py-2.5">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block text-center text-[12px] font-medium text-primary hover:underline"
        >
          View all activity
        </Link>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<MockNotification[]>(mockNotifications);
  const isMobile = useIsMobile();

  const unread = items.filter((n) => n.unread).length;

  const markRead = (id: string) =>
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  const markAll = () =>
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  const Trigger = (
    <button
      aria-label="Open notifications"
      className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:text-foreground hover:bg-secondary"
    >
      <Bell className="h-4 w-4" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-medium tabular-nums bg-destructive text-destructive-foreground ring-2 ring-surface">
          {unread}
        </span>
      )}
    </button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{Trigger}</SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <NotificationBody
            items={items}
            filter={filter}
            setFilter={setFilter}
            onMarkRead={markRead}
            onMarkAll={markAll}
            onClose={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{Trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 overflow-hidden"
      >
        <NotificationBody
          items={items}
          filter={filter}
          setFilter={setFilter}
          onMarkRead={markRead}
          onMarkAll={markAll}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
