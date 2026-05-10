import { useEffect, useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { Bell, Plus, Search } from "lucide-react";
import { AppMobileNavigation, AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const SIDEBAR_STORAGE_KEY = "app.sidebar.collapsed";

export function AppShell({ children }: { children?: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "1") return true;
    if (stored === "0") return false;
    return window.matchMedia("(max-width: 1279px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(SIDEBAR_STORAGE_KEY) !== null) return;

    const media = window.matchMedia("(max-width: 1279px)");
    const syncCollapsed = () => setCollapsed(media.matches);
    syncCollapsed();
    media.addEventListener("change", syncCollapsed);
    return () => media.removeEventListener("change", syncCollapsed);
  }, []);

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      }
      return next;
    });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen w-full bg-app text-foreground">
        <AppSidebar collapsed={collapsed} onToggle={toggleSidebar} />

        <div
          data-sidebar-collapsed={collapsed}
          className="flex min-w-0 flex-1 flex-col transition-[width] duration-300 ease-in-out"
        >
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/75 px-4 backdrop-blur-md lg:px-6">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search conversations, customers…"
                className="h-9 w-full rounded-lg border border-input bg-surface pl-8 pr-16 text-[13px] transition placeholder:text-muted-foreground/80 focus:border-ring/40 focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <kbd className="absolute right-2 top-1/2 hidden h-5 -translate-y-1/2 items-center rounded border border-border bg-surface-muted px-1.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
                ⌘K
              </kbd>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning-foreground lg:inline-flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warning" />
                </span>
                Mock data
              </span>
              <button className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-soft transition hover:opacity-95 active:translate-y-px sm:inline-flex">
                <Plus className="h-3.5 w-3.5" />
                New conversation
              </button>
              <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:bg-secondary hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-2 ring-surface" />
              </button>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-[11px] font-semibold text-background shadow-soft ring-2 ring-background">
                AH
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 pb-20 md:pb-0">{children ?? <Outlet />}</main>
        </div>

        <AppMobileNavigation />
      </div>
    </TooltipProvider>
  );
}
