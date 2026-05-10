import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Inbox,
  Users,
  UserCog,
  Settings,
  ScrollText,
  LayoutGrid,
  Search,
  Sparkles,
  Bell,
  Plus,
  Radio,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: number;
};

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/inbox", label: "Inbox", icon: Inbox, badge: 4 },
  { to: "/channels", label: "Channels", icon: Radio, badge: 8 },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/members", label: "Members", icon: UserCog },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/audit", label: "Audit log", icon: ScrollText },
  { to: "/states", label: "States", icon: LayoutGrid },
];

const mobileNav: NavItem[] = [
  { to: "/", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/inbox", label: "Inbox", icon: Inbox, badge: 4 },
  { to: "/channels", label: "Channels", icon: Radio },
  { to: "/customers", label: "People", icon: Users },
  { to: "/settings", label: "More", icon: Settings },
];

export function AppShell({
  children,
  variant = "default",
}: {
  children?: React.ReactNode;
  /** "rail" = 64px icon-only sidebar (use for chat-priority screens like Inbox). */
  variant?: "default" | "rail";
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const rail = variant === "rail";

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen flex w-full bg-app text-foreground">
        {rail ? (
          <RailSidebar isActive={isActive} />
        ) : (
          <FullSidebar isActive={isActive} />
        )}

        {/* Main */}
        <div className="flex-1 flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/75 px-4 backdrop-blur-md lg:px-6">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search conversations, customers…"
                className="h-9 w-full rounded-lg border border-input bg-surface pl-8 pr-16 text-[13px] placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring/40 transition"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center rounded border border-border bg-surface-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warning" />
                </span>
                Mock data
              </span>
              <button className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-soft transition hover:opacity-95 active:translate-y-px">
                <Plus className="h-3.5 w-3.5" />
                New conversation
              </button>
              <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:text-foreground hover:bg-secondary">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-2 ring-surface" />
              </button>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-background text-[11px] font-semibold ring-2 ring-background shadow-soft">
                AH
              </div>
            </div>
          </header>

          <main className="flex-1 min-w-0 pb-20 md:pb-0">{children ?? <Outlet />}</main>
        </div>

        {/* Mobile bottom nav — floating pill */}
        <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-1 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-pop backdrop-blur md:hidden">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to, item.exact);
            return (
              <Link
                key={item.to}
                to={item.to as "/"}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
                {item.badge ? (
                  <span className="absolute right-2 top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-surface">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}

/* ───────────────────────── Full sidebar (default) ───────────────────────── */

function FullSidebar({
  isActive,
}: {
  isActive: (to: string, exact?: boolean) => boolean;
}) {
  return (
    <aside className="hidden md:flex w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur">
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-3">
        <BrandMark />
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight">AI Reception</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Operator workspace
          </div>
        </div>
      </div>

      <WorkspaceSwitcher />

      <div className="px-4 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
        Workspace
      </div>
      <nav className="px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to as "/"}
              className={[
                "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
              ].join(" ")}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary" />
              )}
              <Icon
                className={[
                  "h-[15px] w-[15px] transition",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                ].join(" ")}
              />
              <span className="flex-1">{item.label}</span>
              {"badge" in item && item.badge ? (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto m-3 overflow-hidden rounded-xl border border-sidebar-border bg-gradient-to-br from-primary-soft via-surface to-surface p-3.5 shadow-soft">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Human-in-the-loop AI
        </div>
        <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
          AI prepares drafts. Operators review and send every reply. Nothing goes out automatically.
        </p>
      </div>
    </aside>
  );
}

/* ───────────────────────── Rail sidebar (chat-priority) ───────────────────────── */

const railPrimary = navItems.filter((n) =>
  ["/", "/inbox", "/channels", "/customers", "/members"].includes(n.to),
);
const railSecondary = navItems.filter((n) =>
  ["/settings", "/audit", "/states"].includes(n.to),
);

function RailSidebar({
  isActive,
}: {
  isActive: (to: string, exact?: boolean) => boolean;
}) {
  return (
    <aside className="hidden md:flex w-16 shrink-0 flex-col items-center border-r border-sidebar-border bg-sidebar/95 backdrop-blur py-3">
      {/* Workspace mark — also acts as brand */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label="Workspace"
            className="relative grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background shadow-soft"
          >
            <Sparkles className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          Tehran Dental Clinic · switch workspace
        </TooltipContent>
      </Tooltip>

      <div className="my-3 h-px w-8 bg-sidebar-border" />

      <nav className="flex flex-col items-center gap-1.5">
        {railPrimary.map((item) => (
          <RailItem key={item.to} item={item} active={isActive(item.to, item.exact)} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-1.5">
        {railSecondary.map((item) => (
          <RailItem key={item.to} item={item} active={isActive(item.to, item.exact)} />
        ))}
        <div className="my-1 h-px w-8 bg-sidebar-border" />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label="Account"
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-background text-[11px] font-semibold ring-2 ring-sidebar shadow-soft"
            >
              AH
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Aiden H. · account
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}

function RailItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={item.to as "/"}
          aria-label={item.label}
          className={`group relative grid h-10 w-10 place-items-center rounded-xl transition ${
            active
              ? "bg-primary-soft text-primary"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          }`}
        >
          {active && (
            <span className="absolute -left-2 top-2 bottom-2 w-0.5 rounded-r-full bg-primary" />
          )}
          <Icon className="h-[18px] w-[18px]" />
          {item.badge ? (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-sidebar">
              {item.badge}
            </span>
          ) : null}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {item.label}
        {item.badge ? ` · ${item.badge}` : ""}
      </TooltipContent>
    </Tooltip>
  );
}

function BrandMark() {
  return (
    <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background shadow-soft">
      <Sparkles className="h-4 w-4" />
      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-sidebar" />
    </div>
  );
}
