import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  ChevronsUpDown,
  HelpCircle,
  LogOut,
  Plus,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  UserCircle2,
  Bell,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme-toggle";
import { mockUser } from "@/lib/notifications";
import { workspaces, type WorkspaceRole } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const roleTone: Record<WorkspaceRole, string> = {
  Owner: "bg-primary-soft text-foreground ring-1 ring-inset ring-primary/25",
  Admin: "bg-info/10 text-foreground ring-1 ring-inset ring-info/25",
  Operator: "bg-success/10 text-foreground ring-1 ring-inset ring-success/25",
  Viewer: "bg-secondary text-muted-foreground ring-1 ring-inset ring-border",
};

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [activeWsId, setActiveWsId] = useState(workspaces[0].id);
  const activeWs = workspaces.find((w) => w.id === activeWsId) ?? workspaces[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Open profile menu"
          className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-background text-[11px] font-medium ring-2 ring-background shadow-soft transition hover:opacity-90"
        >
          {mockUser.initials}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-1rem)] sm:w-[320px] p-0 overflow-hidden"
      >
        {/* Identity */}
        <div className="flex items-start gap-3 border-b border-border/60 px-4 py-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-background text-[12px] font-medium shadow-soft">
            {mockUser.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium leading-tight text-foreground">
              {mockUser.name}
            </div>
            <div className="truncate text-[11.5px] text-muted-foreground">
              {mockUser.email}
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[10.5px]">
              <Shield className="h-2.5 w-2.5 text-muted-foreground" />
              <span
                className={cn(
                  "rounded px-1 py-px text-[10px] font-medium",
                  roleTone[mockUser.role],
                )}
              >
                {mockUser.role}
              </span>
              <span className="opacity-50">·</span>
              <span className="truncate text-muted-foreground">
                {activeWs.name}
              </span>
            </div>
          </div>
        </div>

        {/* Workspace section */}
        <div className="border-b border-border/60 px-2 py-2">
          <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground/70">
            Workspaces
          </div>
          <div className="space-y-px">
            {workspaces.map((w) => {
              const active = w.id === activeWsId;
              return (
                <button
                  key={w.id}
                  onClick={() => setActiveWsId(w.id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-secondary"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gradient-to-br from-primary to-[oklch(0.42_0.18_268)] text-primary-foreground text-[10px] font-medium">
                    {w.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-foreground leading-tight">
                      {w.name}
                    </span>
                    <span className="block truncate text-[10.5px] text-muted-foreground">
                      {w.role} · {w.status}
                    </span>
                  </span>
                  {active && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-1 flex items-center gap-1 px-1 pt-1">
            <MenuMicroAction icon={Building2} label="Manage workspace" />
            <MenuMicroAction icon={Plus} label="Create workspace" />
          </div>
        </div>

        {/* Account actions */}
        <div className="border-b border-border/60 px-2 py-2">
          <MenuItem
            icon={UserCircle2}
            label="Account settings"
            to="/profile"
            onClick={() => setOpen(false)}
          />
          <MenuItem
            icon={Bell}
            label="Notification preferences"
            to="/profile"
            onClick={() => setOpen(false)}
          />
          <MenuItem
            icon={SettingsIcon}
            label="Workspace settings"
            to="/settings"
            onClick={() => setOpen(false)}
          />
          <MenuItem
            icon={Sparkles}
            label="AI settings"
            to="/settings/ai"
            onClick={() => setOpen(false)}
          />
          <MenuItem
            icon={HelpCircle}
            label="Help"
            to="/settings"
            onClick={() => setOpen(false)}
          />
          <div className="mt-1 flex items-center justify-between gap-2 rounded-md px-2 py-1.5">
            <span className="text-[12.5px] text-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Sign out */}
        <div className="px-2 py-2">
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] font-medium text-destructive transition hover:bg-destructive/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Link>
          <p className="px-2 pt-1 text-[10px] leading-snug text-muted-foreground">
            Prototype only — no real session is ended.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MenuItem({
  icon: Icon,
  label,
  to,
  onClick,
}: {
  icon: typeof ChevronsUpDown;
  label: string;
  to: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-foreground transition hover:bg-secondary"
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="flex-1 truncate">{label}</span>
    </Link>
  );
}

function MenuMicroAction({
  icon: Icon,
  label,
}: {
  icon: typeof ChevronsUpDown;
  label: string;
}) {
  return (
    <button className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border/60 bg-surface px-2 py-1 text-[10.5px] font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground">
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}
