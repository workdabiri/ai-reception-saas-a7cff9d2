import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronsUpDown,
  FileCheck2,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Settings,
  Shield,
  Sparkles,
  User,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { workspaces, type WorkspaceRole } from "@/lib/mock-data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AppRoute =
  | "/"
  | "/inbox"
  | "/channels"
  | "/customers"
  | "/members"
  | "/settings"
  | "/audit"
  | "/states";

type NavItem = {
  to: AppRoute;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
};

type NavSection = {
  id: string;
  title: string;
  items: NavItem[];
};

const APP_NAV_SECTIONS: NavSection[] = [
  {
    id: "workspace",
    title: "Workspace",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/inbox", label: "Inbox", icon: Inbox, badge: 4 },
      { to: "/channels", label: "Channels", icon: Radio, badge: 8 },
      { to: "/customers", label: "Customers", icon: Users },
    ],
  },
  {
    id: "management",
    title: "Management",
    items: [
      { to: "/members", label: "Members", icon: UserCog },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    id: "trust",
    title: "Trust & System",
    items: [
      { to: "/audit", label: "Audit log", icon: FileCheck2, badge: 2 },
      { to: "/states", label: "States", icon: AlertCircle },
    ],
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  { to: "/settings", label: "Help", icon: HelpCircle },
  { to: "/settings", label: "Profile", icon: User },
];

const MOBILE_PRIMARY: NavItem[] = [
  { to: "/inbox", label: "Inbox", icon: Inbox, badge: 4 },
  { to: "/channels", label: "Channels", icon: Radio },
  { to: "/customers", label: "People", icon: Users },
  { to: "/", label: "Home", icon: LayoutDashboard, exact: true },
];

const MOBILE_MORE: NavItem[] = [
  { to: "/members", label: "Members", icon: UserCog },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/audit", label: "Audit log", icon: FileCheck2, badge: 2 },
  { to: "/states", label: "States", icon: AlertCircle },
  ...BOTTOM_ITEMS,
];

const roleTone: Record<WorkspaceRole, string> = {
  Owner: "bg-primary-soft text-primary",
  Admin: "bg-info/10 text-info",
  Operator: "bg-success/10 text-success",
  Viewer: "bg-muted text-muted-foreground",
};

function useActiveRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
}

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const isActive = useActiveRoute();
  const ws = workspaces[0];

  return (
    <aside
      data-sidebar-collapsed={collapsed}
      className="hidden shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground backdrop-blur transition-[width] duration-300 ease-in-out md:flex md:flex-col"
      style={{ width: collapsed ? 64 : 240 }}
    >
      <div className={`flex items-center gap-2.5 px-3 pb-3 pt-4 ${collapsed ? "justify-center" : ""}`}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Workspace"
                className="relative grid h-10 w-10 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft"
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
            <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              {ws.initials}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-surface" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold leading-tight">{ws.name}</div>
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

      <div className="flex-1 overflow-y-auto py-2">
        {APP_NAV_SECTIONS.map((section, index) => (
          <div key={section.id} className={index > 0 ? "mt-3" : ""}>
            {collapsed ? (
              index > 0 ? <div className="mx-3 my-2 h-px bg-sidebar-border/60" /> : null
            ) : (
              <div className="px-4 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
                {section.title}
              </div>
            )}
            <nav className={`space-y-0.5 px-2 ${collapsed ? "flex flex-col items-center" : ""}`}>
              {section.items.map((item) => (
                <SidebarNavItem
                  key={`${section.id}-${item.to}`}
                  item={item}
                  collapsed={collapsed}
                  active={isActive(item.to, item.exact)}
                />
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className={`mt-auto border-t border-sidebar-border ${collapsed ? "flex flex-col items-center gap-1.5 py-3" : "space-y-2 p-3"}`}>
        {!collapsed && (
          <div className="overflow-hidden rounded-xl border border-sidebar-border bg-gradient-to-br from-primary-soft via-surface to-surface p-3 shadow-soft">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Human-in-the-loop AI
            </div>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
              AI prepares drafts. Operators review and send every reply.
            </p>
          </div>
        )}

        <div className={collapsed ? "flex flex-col items-center gap-1.5" : "flex items-center gap-1 rounded-lg border border-sidebar-border bg-surface p-1"}>
          {BOTTOM_ITEMS.map((item) => (
            <SidebarBottomItem key={item.label} item={item} collapsed={collapsed} />
          ))}
          <SidebarCollapseButton collapsed={collapsed} onToggle={onToggle} />
        </div>
      </div>
    </aside>
  );
}

export function AppMobileNavigation() {
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = useActiveRoute();

  return (
    <>
      <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-1 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-pop backdrop-blur md:hidden">
        {MOBILE_PRIMARY.map((item) => (
          <MobileNavItem key={item.label} item={item} active={isActive(item.to, item.exact)} />
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium text-muted-foreground transition hover:bg-secondary"
        >
          <MoreHorizontal className="h-[18px] w-[18px]" />
          More
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/40 animate-fade-in" onClick={() => setMoreOpen(false)} />
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
              {MOBILE_MORE.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className="relative flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 text-[11px] font-medium text-foreground transition hover:bg-secondary"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                  {item.badge ? <Badge value={item.badge} className="right-2 top-2" /> : null}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SidebarNavItem({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;
  const content = (
    <Link
      to={item.to}
      aria-label={collapsed ? item.label : undefined}
      className={[
        "group relative flex h-10 items-center rounded-xl text-[13px] font-medium transition-colors duration-200",
        collapsed ? "w-10 justify-center" : "w-full gap-2.5 px-2.5",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/85 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
      ].join(" ")}
    >
      {active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-primary" />}
      <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
      {!collapsed && <span className="min-w-0 flex-1 truncate whitespace-nowrap">{item.label}</span>}
      {item.badge ? (
        collapsed ? (
          <Badge value={item.badge} className="-right-1 -top-1 ring-sidebar" />
        ) : (
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {item.badge}
          </span>
        )
      ) : null}
    </Link>
  );

  if (!collapsed) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {item.label}{item.badge ? ` · ${item.badge}` : ""}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarBottomItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;
  const content = (
    <Link
      to={item.to}
      aria-label={collapsed ? item.label : undefined}
      className={collapsed
        ? "grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
        : "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      }
    >
      <Icon className={collapsed ? "h-[16px] w-[16px]" : "h-3.5 w-3.5"} />
      {!collapsed && item.label}
    </Link>
  );

  if (!collapsed) return content;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function SidebarCollapseButton({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const button = (
    <button
      onClick={onToggle}
      aria-label={label}
      className={collapsed
        ? "grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
        : "grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      }
    >
      <Icon className={collapsed ? "h-[16px] w-[16px]" : "h-3.5 w-3.5"} />
    </button>
  );

  if (!collapsed) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

function MobileNavItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition ${
        active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-secondary"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
      {item.label}
      {item.badge ? <Badge value={item.badge} className="right-2 top-1 ring-surface" /> : null}
    </Link>
  );
}

function Badge({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`absolute grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ${className}`}>
      {value}
    </span>
  );
}