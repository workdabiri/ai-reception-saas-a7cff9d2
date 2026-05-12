import { useEffect, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Inbox,
  Users,
  UserCog,
  Settings,
  FileCheck2,
  AlertCircle,
  Search,
  Sparkles,
  Bell,
  Plus,
  Radio,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
  ChevronsUpDown,
  Shield,
  User,
  MoreHorizontal,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { workspaces, type WorkspaceRole } from "@/lib/mock-data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ───────────────────────── Single shared menu config ───────────────────────── */

type NavItem = {
  id: string;
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: number;
};

type NavSection = {
  id: string;
  title: string;
  items: NavItem[];
};

const MENU_CONFIG: { sections: NavSection[]; bottomItems: NavItem[] } = {
  sections: [
    {
      id: "workspace",
      title: "Workspace",
      items: [
        { id: "dashboard", to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { id: "inbox", to: "/inbox", label: "Inbox", icon: Inbox, badge: 4 },
        { id: "channels", to: "/channels", label: "Channels", icon: Radio, badge: 8 },
        { id: "customers", to: "/customers", label: "Customers", icon: Users },
      ],
    },
    {
      id: "management",
      title: "Management",
      items: [
        { id: "members", to: "/members", label: "Members", icon: UserCog },
        { id: "settings", to: "/settings", label: "Settings", icon: Settings },
      ],
    },
    {
      id: "trust",
      title: "Trust & System",
      items: [
        { id: "audit", to: "/audit", label: "Audit log", icon: FileCheck2, badge: 2 },
        { id: "states", to: "/states", label: "States", icon: AlertCircle },
      ],
    },
  ],
  bottomItems: [
    { id: "help", to: "/settings", label: "Help", icon: HelpCircle },
    { id: "profile", to: "/settings", label: "Profile", icon: User },
  ],
};

const allMenuItems = () => MENU_CONFIG.sections.flatMap((section) => section.items);
const menuItem = (id: string) => allMenuItems().find((item) => item.id === id)!;
const mobilePrimaryItems = () => ["inbox", "channels", "customers", "dashboard"].map(menuItem);
const mobileMoreItems = () => [
  menuItem("members"),
  menuItem("settings"),
  menuItem("audit"),
  menuItem("states"),
  ...MENU_CONFIG.bottomItems,
];

const STORAGE_KEY = "app.sidebar.collapsed";

const roleTone: Record<WorkspaceRole, string> = {
  Owner: "bg-primary-soft text-primary",
  Admin: "bg-info/10 text-info",
  Operator: "bg-success/10 text-success",
  Viewer: "bg-muted text-muted-foreground",
};

/* ───────────────────────── AppShell ───────────────────────── */

export function AppShell({
  children,
}: {
  children?: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mobilePrimary = mobilePrimaryItems();
  const mobileMore = mobileMoreItems();

  const isInbox = (path: string) => path === "/inbox" || path.startsWith("/inbox/");

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") return true;
    if (stored === "0") return false;
    if (isInbox(window.location.pathname)) return true;
    return window.matchMedia("(max-width: 1279px)").matches;
  });

  // Route-aware default: collapse on Inbox, follow viewport elsewhere.
  // User's manual toggle (stored in localStorage) always wins.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return;
    if (isInbox(pathname)) {
      setCollapsed(true);
    } else {
      setCollapsed(window.matchMedia("(max-width: 1279px)").matches);
    }
  }, [pathname]);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    if (stored !== null) return;
    const mql = window.matchMedia("(max-width: 1279px)");
    const apply = () => {
      if (isInbox(window.location.pathname)) return;
      setCollapsed(mql.matches);
    };
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      }
      return next;
    });
  };

  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen flex w-full bg-app text-foreground">
        <SharedSidebar
          collapsed={collapsed}
          isActive={isActive}
        />

        {/* Main */}
        <div data-sidebar-collapsed={collapsed} className="flex-1 flex min-w-0 flex-col transition-[width] duration-300 ease-in-out">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/75 px-4 backdrop-blur-md lg:px-6">
            <button
              onClick={toggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden md:inline-grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:text-foreground hover:bg-secondary"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
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
              <ThemeToggle />
              <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:text-foreground hover:bg-secondary">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-2 ring-surface" />
              </button>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-background text-[11px] font-semibold ring-2 ring-background shadow-soft">
                AH
              </div>
            </div>
          </header>

          <main className="flex-1 min-w-0 pb-20 md:pb-0">
            {children ?? <Outlet />}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-1 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-pop backdrop-blur md:hidden">
          {mobilePrimary.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to, item.exact);
            return (
              <Link
                key={item.id}
                to={item.to as "/"}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.id === "dashboard" ? "Home" : item.id === "customers" ? "People" : item.label}
                {item.badge ? (
                  <span className="absolute right-2 top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-surface">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium text-muted-foreground transition hover:bg-secondary"
          >
            <MoreHorizontal className="h-[18px] w-[18px]" />
            More
          </button>
        </nav>

        {/* Mobile "More" sheet */}
        {moreOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-foreground/40 animate-fade-in"
              onClick={() => setMoreOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-surface p-4 shadow-pop animate-slide-in-right">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">More</div>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 pb-6">
                {mobileMore.map((it) => {
                  const Icon = it.icon;
                  return (
                    <Link
                      key={it.id}
                      to={it.to as "/"}
                      onClick={() => setMoreOpen(false)}
                      className="relative flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 text-[11px] font-medium text-foreground transition hover:bg-secondary"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {it.label}
                      {it.badge ? (
                        <span className="absolute right-2 top-2 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                          {it.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

/* ───────────────────────── Unified sidebar ───────────────────────── */

function SharedSidebar({
  collapsed,
  isActive,
}: {
  collapsed: boolean;
  isActive: (to: string, exact?: boolean) => boolean;
}) {
  const ws = workspaces[0];

  return (
    <aside
      data-collapsed={collapsed}
      className={`hidden md:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur transition-[width] duration-300 ease-in-out overflow-hidden sticky top-0 h-screen [height:100dvh] self-start ${
        collapsed ? "w-16" : "w-[240px]"
      }`}
    >
      {/* Workspace area */}
      <div className={`flex items-center gap-2.5 px-3 pt-4 pb-3 ${collapsed ? "justify-center" : ""}`}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Workspace"
                className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.42_0.18_268)] text-primary-foreground font-semibold text-sm shadow-ring-primary"
              >
                {ws.initials}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              <div className="font-medium">{ws.name}</div>
              <div className="text-[10px] text-muted-foreground">
                {ws.role} · {ws.status}
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <button className="flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border bg-surface px-2.5 py-2 text-left transition hover:bg-sidebar-accent">
            <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.42_0.18_268)] text-primary-foreground font-semibold text-sm shadow-soft">
              {ws.initials}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-surface" />
            </div>
            <div className="min-w-0 flex-1 transition-opacity duration-200">
              <div className="truncate text-[13px] font-semibold leading-tight">
                {ws.name}
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                <Shield className="h-2.5 w-2.5" />
                <span className={`rounded px-1 py-px text-[10px] font-semibold ${roleTone[ws.role]}`}>
                  {ws.role}
                </span>
                <span className="opacity-50">·</span>
                <span>{ws.status}</span>
              </div>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="mx-3 h-px bg-sidebar-border" />

      {/* Sections */}
      <div className="flex-1 overflow-y-auto py-2">
        {MENU_CONFIG.sections.map((section, idx) => (
          <div key={section.id} className={idx > 0 ? "mt-3" : ""}>
            {!collapsed ? (
              <div className="px-4 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
                {section.title}
              </div>
            ) : idx > 0 ? (
              <div className="mx-3 my-2 h-px bg-sidebar-border/60" />
            ) : null}
            <nav className={`px-2 space-y-0.5 ${collapsed ? "flex flex-col items-center" : ""}`}>
              {section.items.map((item) => (
                <NavRow
                  key={item.to + item.label}
                  item={item}
                  collapsed={collapsed}
                  active={isActive(item.to, item.exact)}
                />
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom area */}
      <div className={`mt-auto border-t border-sidebar-border ${collapsed ? "flex flex-col items-center gap-1.5 py-3" : "p-3 space-y-2"}`}>
        {!collapsed && (
          <div className="sidebar-ai-card rounded-xl p-3.5">
            <div className="relative z-10 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.10em] text-white/85">
              <span className="grid h-4 w-4 place-items-center rounded-md bg-white/15 ring-1 ring-white/25">
                <Sparkles className="h-2.5 w-2.5" />
              </span>
              AI Active
            </div>
            <div className="relative z-10 mt-1.5 text-[12.5px] font-semibold leading-tight text-white">
              Human-in-the-loop
            </div>
            <p className="relative z-10 mt-1 text-[11px] leading-snug text-white/75">
              AI prepares drafts. Operators review and send every reply.
            </p>
          </div>
        )}

        {collapsed ? (
          <>
            {MENU_CONFIG.bottomItems.map((it) => (
              <BottomIcon key={it.id} icon={it.icon} label={it.label} />
            ))}
          </>
        ) : (
          <div className="flex items-center gap-1 rounded-lg border border-sidebar-border bg-surface p-1">
            {MENU_CONFIG.bottomItems.map((it) => {
              const Icon = it.icon;
              return (
                <button
                  key={it.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {it.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

function NavRow({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  if (collapsed) {
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

  return (
    <Link
      to={item.to as "/"}
      className={[
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-200",
        active
          ? "nav-active"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
      ].join(" ")}
    >
      {active && <span className="nav-active-bar" />}
      <Icon
        className={[
          "h-[16px] w-[16px] transition-colors",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        ].join(" ")}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span
          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums shadow-soft ${
            active
              ? "gradient-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function BottomIcon({
  icon: Icon,
  label,
}: {
  icon: typeof HelpCircle;
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label={label}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
        >
          <Icon className="h-[16px] w-[16px]" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
