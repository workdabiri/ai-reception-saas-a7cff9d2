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
  BookOpen,
  HelpCircle,
  ChevronsUpDown,
  Shield,
  User,
  MoreHorizontal,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/notification-center";
import { ProfileMenu } from "@/components/profile-menu";
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
        { id: "knowledge", to: "/knowledge", label: "Knowledge", icon: BookOpen },
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
    { id: "studio", to: "/studio", label: "Design Studio", icon: Sparkles },
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

// Role tones follow the strict monday-style semantics — Owner=brand, Admin=info,
// Operator=success, Viewer=neutral. Subtle ring-inset for premium chip feel.
const roleTone: Record<WorkspaceRole, string> = {
  Owner: "bg-primary-soft text-foreground ring-1 ring-inset ring-primary/25",
  Admin: "bg-info/10 text-foreground ring-1 ring-inset ring-info/25",
  Operator: "bg-success/10 text-foreground ring-1 ring-inset ring-success/25",
  Viewer: "bg-secondary text-muted-foreground ring-1 ring-inset ring-border",
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
        <div data-sidebar-collapsed={collapsed} className="flex-1 flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 glass-chrome px-4 lg:px-6">
            <button
              onClick={toggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden md:inline-grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:text-foreground hover:bg-secondary"
            >
              <PanelLeftClose
                className={`sidebar-toggle-icon h-4 w-4 ${collapsed ? "rotate-180" : ""}`}
              />
            </button>
            <div className="relative w-full max-w-md group">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                placeholder="Search conversations, customers…"
                className="h-9 w-full cursor-text rounded-lg border border-border/60 bg-surface pl-9 pr-16 text-[14px] text-foreground placeholder:text-muted-foreground/80 transition-[border-color,box-shadow,background-color] hover:border-border focus:outline-none focus:border-primary focus:bg-surface-hover focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-primary)_15%,transparent)]"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center rounded border border-border/60 bg-surface px-1.5 text-[11px] font-medium text-muted-foreground/80">
                ⌘K
              </kbd>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span
                className="hidden lg:inline-flex items-center gap-1.5 rounded-md border-[0.5px] px-2 py-[3px] text-[11px] font-medium"
                style={{
                  background: "rgba(253, 171, 61, 0.10)",
                  color: "var(--foreground)",
                  borderColor: "rgba(253, 171, 61, 0.30)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "var(--status-pending)" }}
                />
                Mock data
              </span>
              <button className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground shadow-soft transition hover:opacity-95 active:translate-y-px">
                <Plus className="h-3.5 w-3.5" />
                New conversation
              </button>
              <ThemeToggle />
              <NotificationCenter />
              <ProfileMenu />
            </div>
          </header>

          <main className="flex-1 min-w-0 pb-16 md:pb-0">
            {children ?? <Outlet />}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around bg-surface border-t border-border/60 shadow-[0_-2px_8px_rgba(15,17,36,0.04)] md:hidden"
          style={{ padding: "8px 0", paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
        >
          {mobilePrimary.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to, item.exact);
            const label = item.label;
            return (
              <Link
                key={item.id}
                to={item.to as "/"}
                className="group relative flex flex-col items-center justify-center gap-1 min-w-[56px] px-2 py-1.5 rounded-lg transition-all duration-150 ease-out hover:bg-secondary/60"
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-b-[2px] bg-primary" />
                )}
                <div className="relative">
                  <Icon
                    strokeWidth={1.75}
                    className={`h-[22px] w-[22px] transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                  />
                  {item.badge ? (
                    <span className="absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-[8px] text-[10px] font-medium tabular-nums bg-app text-foreground/80 border-[1.5px] border-surface">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[11px] font-medium leading-none ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="group relative flex flex-col items-center justify-center gap-1 min-w-[56px] px-2 py-1.5 rounded-lg transition-all duration-150 ease-out hover:bg-secondary/60"
          >
            <MoreHorizontal strokeWidth={1.75} className="h-[22px] w-[22px] text-muted-foreground" />
            <span className="text-[11px] font-medium leading-none text-muted-foreground">More</span>
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
                <div className="text-sm font-medium">More</div>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {mobileMore.map((it) => {
                  const Icon = it.icon;
                  return (
                    <Link
                      key={it.id}
                      to={it.to as "/"}
                      onClick={() => setMoreOpen(false)}
                      className="relative flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-2 py-3 text-[11px] font-medium text-foreground transition hover:bg-secondary"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {it.label}
                      {it.badge ? (
                        <span className="absolute right-2 top-2 flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-[9px] text-[11px] font-medium tabular-nums bg-background dark:bg-white/[0.08] text-muted-foreground">
                          {it.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 pb-6">
                <div className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  Theme
                </div>
                <ThemeToggle variant="full" />
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
      className={`hidden md:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur sidebar-anim sticky top-0 h-screen [height:100dvh] self-start px-2 py-3 ${
        collapsed ? "w-16" : "w-[240px]"
      }`}
    >
      {/* TOP: Workspace switcher (fixed) */}
      <header className="shrink-0">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Workspace"
                className="relative mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.42_0.18_268)] text-primary-foreground font-medium text-sm shadow-ring-primary"
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
          <button className="flex h-14 w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left transition hover:bg-sidebar-accent">
            <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.42_0.18_268)] text-primary-foreground font-medium text-sm shadow-soft">
              {ws.initials}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-surface" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium leading-tight">
                {ws.name}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                <Shield className="h-2.5 w-2.5" />
                <span className={`rounded px-1 py-px text-[10px] font-medium ${roleTone[ws.role]}`}>
                  {ws.role}
                </span>
                <span className="opacity-50">·</span>
                <span>{ws.status}</span>
              </div>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        )}
      </header>

      {/* MIDDLE: Scrollable nav */}
      <nav className="sidebar-nav my-4 flex-1 overflow-y-auto">
        {MENU_CONFIG.sections.map((section, idx) => (
          <section key={section.id} className={idx > 0 ? "mt-4" : ""}>
            <h4 className="sidebar-section-title px-3 mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground/70">
              {section.title}
            </h4>
            <div className="space-y-px">
              {section.items.map((item) => (
                <NavRow
                  key={item.to + item.label}
                  item={item}
                  collapsed={collapsed}
                  active={isActive(item.to, item.exact)}
                />
              ))}
            </div>
          </section>
        ))}
      </nav>

      {/* BOTTOM: AI Active card (fixed) */}
      <div className="shrink-0">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="AI Active — Human-in-the-loop"
                // eslint-disable-next-line local/no-pill-contrast-violation -- icon-only tile; text-primary sets icon currentColor
                className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-primary/15 ring-1 ring-inset ring-primary/25 text-primary transition hover:bg-primary/20"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              <div className="font-medium">AI Active</div>
              <div className="text-[10px] text-muted-foreground">Human-in-the-loop</div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div
            className="rounded-xl p-3"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 18%, transparent), color-mix(in oklab, var(--color-primary) 9%, transparent))",
              border: "0.5px solid color-mix(in oklab, var(--color-primary) 22%, transparent)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-medium uppercase tracking-[0.06em] text-primary">
              <Sparkles className="h-4 w-4" />
              AI Active
            </div>
            <div className="mb-1 text-[13px] font-medium leading-tight text-foreground">
              Human-in-the-loop
            </div>
            <p className="text-[11px] leading-[1.4] text-muted-foreground">
              AI prepares drafts. Operators review and send every reply.
            </p>
          </div>
        )}
      </div>

      {/* BOTTOM: Footer controls (fixed) */}
      <footer className="shrink-0 mt-2 pt-2 border-t border-sidebar-border/60 flex flex-col gap-0.5">
        {MENU_CONFIG.bottomItems.map((it) => {
          const Icon = it.icon;
          if (collapsed) {
            return (
              <Tooltip key={it.id}>
                <TooltipTrigger asChild>
                  <button
                    aria-label={it.label}
                    className="mx-auto grid h-8 w-10 place-items-center rounded-lg text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {it.label}
                </TooltipContent>
              </Tooltip>
            );
          }
          return (
            <button
              key={it.id}
              className="flex h-8 w-full items-center gap-3 rounded-lg px-3 text-[13px] text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="sidebar-label truncate">{it.label}</span>
            </button>
          );
        })}
      </footer>
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

  const row = (
    <Link
      to={item.to as "/"}
      aria-label={item.label}
      className={[
        "group relative flex items-center h-9 w-full rounded-lg transition-colors",
        active
          ? "bg-primary-soft text-primary"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
      ].join(" ")}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-[2px] bg-primary" />
      )}
      <span className="relative grid h-9 w-10 shrink-0 place-items-center">
        <Icon
          className={`h-[18px] w-[18px] transition-colors ${
            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          }`}
        />
        {item.badge ? (
          <span
            className={`sidebar-badge-dot absolute top-1.5 right-1.5 h-[6px] w-[6px] rounded-full ${
              active ? "bg-primary" : "bg-muted-foreground/70"
            }`}
          />
        ) : null}
      </span>
      <span className="sidebar-label flex-1 truncate text-[13px] font-medium leading-none">
        {item.label}
      </span>
      {item.badge ? (
        <span
          className={`sidebar-badge mr-2 flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-[9px] text-[11px] font-medium tabular-nums ${
            active
              ? "bg-primary/20 text-foreground"
              : "bg-background dark:bg-white/[0.08] text-muted-foreground"
          }`}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{row}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {item.label}
          {item.badge ? ` · ${item.badge}` : ""}
        </TooltipContent>
      </Tooltip>
    );
  }

  return row;
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
