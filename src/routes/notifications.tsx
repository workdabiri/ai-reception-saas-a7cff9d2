import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, MockBanner } from "@/components/ui-bits";
import {
  mockNotifications,
  categoryMeta,
  type MockNotification,
  type NotificationCategory,
} from "@/lib/notifications";
import { CheckCheck, Inbox, Check } from "lucide-react";
import {
  useStateParam,
  presets as statePresets,
  RouteStatePage,
  RouteSkeleton,
} from "@/components/route-state";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — AI Reception" },
      {
        name: "description",
        content:
          "Full activity feed: conversations, AI drafts, members, channels, and security events.",
      },
    ],
  }),
  component: NotificationsPage,
});

type Filter = "all" | "unread" | NotificationCategory;

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "conversation", label: "Conversations" },
  { id: "ai", label: "AI" },
  { id: "security", label: "Security" },
  { id: "members", label: "Members" },
  { id: "channels", label: "Channels" },
  { id: "knowledge", label: "Knowledge" },
];

function NotificationsPage() {
  const stateOverride = useStateParam();
  const [items, setItems] = useState<MockNotification[]>(mockNotifications);
  const [filter, setFilter] = useState<Filter>("all");

  if (stateOverride === "empty") {
    return (
      <RouteStatePage title="Notifications">{statePresets.notificationsEmpty()}</RouteStatePage>
    );
  }
  if (stateOverride === "loading") {
    return (
      <RouteStatePage title="Notifications" description="Loading notifications…">
        <RouteSkeleton variant="list" />
      </RouteStatePage>
    );
  }

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((n) => n.unread);
    return items.filter((n) => n.category === filter);
  }, [items, filter]);

  const unread = items.filter((n) => n.unread).length;

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 space-y-6">
      <PageHeader
        title="Notifications"
        description="A unified feed of activity across this workspace. All entries are mock — no real-time delivery."
      />
      <MockBanner />

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <div>
            <div className="text-[14px] font-medium text-foreground">Activity</div>
            <div className="text-[11px] text-muted-foreground">
              {unread} unread of {items.length}
            </div>
          </div>
          <button
            onClick={markAll}
            disabled={unread === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-foreground transition hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-border/60 px-4 py-3">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={[
                  "rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset transition-colors",
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

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <Inbox className="h-5 w-5" />
            </div>
            <div className="mt-3 text-[14px] font-medium text-foreground">No notifications</div>
            <p className="mt-1 text-[12px] text-muted-foreground">You're all caught up.</p>
            <button
              onClick={() => setFilter("all")}
              className="mt-3 inline-flex items-center text-[12px] font-medium text-primary hover:underline"
            >
              Back to all notifications
            </button>
          </div>
        ) : (
          <ul>
            {filtered.map((n) => {
              const meta = categoryMeta[n.category];
              const Icon = meta.icon;
              return (
                <li
                  key={n.id}
                  className="group flex gap-3 border-b border-border/60 px-4 py-4 last:border-b-0 hover:bg-secondary/30 transition-colors"
                >
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ring-1 ring-inset ${meta.tint}`}
                  >
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {n.unread && <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />}
                          <p className="text-[13.5px] font-medium text-foreground truncate">
                            {n.title}
                          </p>
                        </div>
                        <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">
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
                          onClick={() => markRead(n.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium text-foreground transition hover:bg-secondary"
                        >
                          <Check className="h-3 w-3" />
                          Mark read
                        </button>
                      )}
                    </div>
                    <div className="mt-2">
                      <Link
                        to={n.to as "/"}
                        className="inline-flex items-center text-[12px] font-medium text-primary hover:underline"
                      >
                        {n.actionLabel}
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
