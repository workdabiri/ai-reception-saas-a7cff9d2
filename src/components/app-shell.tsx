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
  { to: "/channels", label: "Channels", icon: Radio, badge: 18 },
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

export function AppShell({ children }: { children?: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <WorkspaceSwitcher />

        <nav className="px-2 py-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to as "/"}
                className={[
                  "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-4 w-4",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  ].join(" ")}
                />
                <span className="flex-1">{item.label}</span>
                {"badge" in item && item.badge ? (
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto m-3 rounded-xl border border-sidebar-border bg-gradient-to-br from-primary-soft to-surface p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI draft assistance
          </div>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
            AI suggests replies. An operator reviews and sends every message.
          </p>
          <span className="mt-2 inline-flex items-center rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border">
            Human review required
          </span>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search conversations, customers…"
              className="h-9 w-full rounded-lg border border-input bg-surface pl-8 pr-16 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden lg:inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              Mock data
            </span>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft hover:opacity-95">
              <Plus className="h-3.5 w-3.5" />
              New conversation
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background text-xs font-semibold">
              AH
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
