import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCheck, Inbox as InboxIcon } from "lucide-react";
import {
  mockNotifications,
  CATEGORY_FILTERS,
  type MockNotification,
  type NotificationCategory,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [{ title: "Notifications — AI Reception" }],
  }),
  component: NotificationsPage,
});

type FilterId = "all" | "unread" | NotificationCategory;

function NotificationsPage() {
  const [items, setItems] = useState<MockNotification[]>(mockNotifications);
  const [filter, setFilter] = useState<FilterId>("all");

  const unread = items.filter((n) => !n.read).length;
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
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Activity across conversations, AI drafts, members and channels.
            Prototype only — no live delivery.
          </p>
        </div>
        <button
          onClick={markAllRead}
          disabled={unread === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-foreground transition hover:bg-secondary disabled:opacity-50"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Mark all read
        </button>
      </header>

      <div className="mt-5 flex flex-wrap gap-1.5 border-b border-border/60 pb-3">
        {CATEGORY_FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[12px] font-medium transition",
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

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <InboxIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-medium text-foreground">
                No notifications
              </div>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                You&rsquo;re all caught up.
              </p>
            </div>
            <button
              onClick={() => setFilter("all")}
              className="rounded-md border border-border bg-surface px-3 py-1 text-[11px] font-medium text-foreground transition hover:bg-secondary"
            >
              Back to all notifications
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {filtered.map((n) => {
              const Icon = n.icon;
              return (
                <li key={n.id}>
                  <Link
                    to={n.to}
                    onClick={() => markOneRead(n.id)}
                    className={cn(
                      "group flex items-start gap-3 px-4 py-3.5 transition hover:bg-secondary/60",
                      !n.read && "bg-primary-soft/30",
                    )}
                  >
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-[13.5px] font-medium leading-tight text-foreground">
                            {n.title}
                          </div>
                          <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">
                            {n.body}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground/80">
                          {n.time}
                        </span>
                        <span className="text-[11px] font-medium text-primary">
                          {n.actionLabel} →
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
