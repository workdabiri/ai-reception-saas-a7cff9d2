// AdminShell — internal Platform Admin layout for TASK-UX-011.
// Distinct from the Business Panel AppShell: own header, own nav, clear
// "internal mock admin" labeling, and a safe "Back to Business Panel" link.
// Visual tokens only — no redesign, no new colors.

import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  HeartPulse,
  ScrollText,
  Flag,
  LifeBuoy,
  ShieldAlert,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type AdminNavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/businesses", label: "Businesses", icon: Building2 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/usage", label: "Usage", icon: Activity },
  { to: "/admin/provider-health", label: "Provider Health", icon: HeartPulse },
  { to: "/admin/audit", label: "Platform Audit", icon: ScrollText },
  { to: "/admin/feature-flags", label: "Feature Flags", icon: Flag },
  { to: "/admin/support", label: "Support", icon: LifeBuoy },
];

function isPathActive(current: string, to: string, exact?: boolean) {
  if (exact) return current === to;
  return current === to || current.startsWith(to + "/");
}

function AdminBrand() {
  return (
    <Link to="/admin" className="flex items-center gap-2.5">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background shadow-soft">
        <ShieldAlert className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold tracking-tight text-foreground leading-tight">
          Platform Admin
        </div>
        <div className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground leading-tight">
          Internal · Mock
        </div>
      </div>
    </Link>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-0.5">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon;
        const active = isPathActive(pathname, item.to, item.exact);
        return (
          <Link
            key={item.to}
            to={item.to as "/"}
            onClick={onNavigate}
            className={[
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
              active
                ? "bg-secondary text-foreground font-medium ring-1 ring-inset ring-border"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            ].join(" ")}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function MockAdminNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-warning/30 bg-warning/10 px-3 ${
        compact ? "py-2" : "py-2.5"
      }`}
    >
      <div className="flex items-start gap-2">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground" />
        <div className="min-w-0">
          <p className="text-[11.5px] font-medium leading-tight text-foreground">
            Internal mock admin surface
          </p>
          {!compact && (
            <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">
              Read-only prototype. No real customer data. Admin actions are mock-only.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[248px] shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-4 py-4">
          <AdminBrand />
        </div>
        <div className="px-3 py-3">
          <MockAdminNotice />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <NavList pathname={pathname} />
        </div>
        <div className="border-t border-border px-3 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Business Panel
          </Link>
        </div>
      </aside>

      {/* Tablet rail */}
      <aside className="hidden md:flex lg:hidden w-[64px] shrink-0 flex-col items-center border-r border-border bg-surface py-3">
        <Link
          to="/admin"
          aria-label="Platform Admin"
          className="grid h-9 w-9 place-items-center rounded-lg bg-foreground text-background shadow-soft"
        >
          <ShieldAlert className="h-4 w-4" />
        </Link>
        <div className="mt-4 flex flex-col items-center gap-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(pathname, item.to, item.exact);
            return (
              <Link
                key={item.to}
                to={item.to as "/"}
                title={item.label}
                aria-label={item.label}
                className={[
                  "grid h-9 w-9 place-items-center rounded-md transition-colors",
                  active
                    ? "bg-secondary text-foreground ring-1 ring-inset ring-border"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </div>
        <Link
          to="/"
          aria-label="Back to Business Panel"
          title="Back to Business Panel"
          className="mt-auto grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-surface/95 px-3 backdrop-blur md:px-5">
          {/* Mobile nav trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
                aria-label="Open admin navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Platform Admin navigation</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <AdminBrand />
                  <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close"
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-3 py-3">
                  <MockAdminNotice />
                </div>
                <div className="flex-1 overflow-y-auto px-3 pb-3">
                  <NavList pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                </div>
                <div className="border-t border-border px-3 py-3">
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Business Panel
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="md:hidden">
            <AdminBrand />
          </div>

          <div className="hidden md:flex items-center gap-2 text-[12px] text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">Platform Admin</span>
            <span aria-hidden>·</span>
            <span>Internal mock admin surface</span>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[11.5px] font-medium text-foreground transition hover:bg-secondary"
            >
              <ArrowLeft className="h-3 w-3" />
              Business Panel
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
