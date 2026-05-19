import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronsUpDown,
  Check,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Building2,
  Plus,
  ArrowLeftRight,
  Shield,
  ShieldAlert,
  Palette,
  Users,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { workspaces } from "@/lib/mock-data";
import { currentUser } from "@/lib/notifications";

const roleTone: Record<string, string> = {
  Owner: "bg-primary-soft text-foreground ring-primary/25",
  Admin: "bg-info/10 text-foreground ring-info/25",
  Operator: "bg-success/10 text-foreground ring-success/25",
  Viewer: "bg-secondary text-muted-foreground ring-border",
};

function MenuRow({
  icon: Icon,
  label,
  to,
  onClick,
  destructive,
  trailing,
}: {
  icon: typeof Settings;
  label: string;
  to?: string;
  onClick?: () => void;
  destructive?: boolean;
  trailing?: React.ReactNode;
}) {
  const className = [
    "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-[13px] transition-colors",
    destructive
      ? "text-destructive hover:bg-destructive/10"
      : "text-foreground hover:bg-secondary",
  ].join(" ");

  const content = (
    <>
      <Icon
        className={`h-4 w-4 shrink-0 ${
          destructive ? "text-destructive" : "text-muted-foreground"
        }`}
      />
      <span className="flex-1 text-left truncate">{label}</span>
      {trailing}
    </>
  );

  if (to) {
    return (
      <Link to={to as "/"} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function ProfileBody({ onClose }: { onClose: () => void }) {
  const [activeWs, setActiveWs] = useState(workspaces[0].id);

  return (
    <div className="flex flex-col max-h-[80vh] sm:max-h-[640px] overflow-y-auto">
      {/* Identity */}
      <div className="px-4 pt-4 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-background text-[12px] font-medium shadow-soft">
            {currentUser.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-medium text-foreground">
              {currentUser.name}
            </div>
            <div className="truncate text-[12px] text-muted-foreground">
              {currentUser.email}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px]">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium ring-1 ring-inset ${roleTone[currentUser.role]}`}
          >
            <Shield className="h-3 w-3" />
            {currentUser.role}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-foreground ring-1 ring-inset ring-border">
            <Building2 className="h-3 w-3" />
            <span className="truncate max-w-[160px]">{currentUser.workspace}</span>
          </span>
        </div>
      </div>

      {/* Workspaces */}
      <div className="px-2 py-2 border-b border-border/60">
        <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Workspaces
        </div>
        <ul className="space-y-px">
          {workspaces.map((w) => {
            const isActive = w.id === activeWs;
            return (
              <li key={w.id}>
                <button
                  onClick={() => setActiveWs(w.id)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-secondary"
                >
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-secondary text-[10px] font-medium text-foreground">
                    {w.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-medium text-foreground">
                      {w.name}
                    </div>
                    <div className="truncate text-[10.5px] text-muted-foreground">
                      {w.role} · {w.status}
                    </div>
                  </div>
                  {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-1 grid grid-cols-2 gap-1 px-1">
          <button className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-secondary">
            <ArrowLeftRight className="h-3 w-3" />
            Manage
          </button>
          <button className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-secondary">
            <Plus className="h-3 w-3" />
            New
          </button>
        </div>
        <p className="mt-1.5 px-2 text-[10.5px] text-muted-foreground">
          Switching workspaces is mock-only in this prototype.
        </p>
      </div>

      {/* Account */}
      <div className="px-2 py-2 border-b border-border/60">
        <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Account
        </div>
        <MenuRow icon={Settings} label="Account settings" to="/profile" onClick={onClose} />
        <MenuRow icon={Bell} label="Notification preferences" to="/profile" onClick={onClose} />
        <MenuRow icon={Palette} label="Theme" to="/profile" onClick={onClose} />
        <MenuRow
          icon={Users}
          label="Role preview"
          to="/role-preview"
          onClick={onClose}
          trailing={
            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wider text-muted-foreground ring-1 ring-inset ring-border">
              Demo
            </span>
          }
        />
        <MenuRow icon={HelpCircle} label="Help" to="/settings" onClick={onClose} />
      </div>

      {/* Internal / demo */}
      <div className="px-2 py-2 border-b border-border/60">
        <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Internal · Demo
        </div>
        <MenuRow
          icon={ShieldAlert}
          label="Platform Admin (Demo)"
          to="/admin"
          onClick={onClose}
          trailing={
            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wider text-muted-foreground ring-1 ring-inset ring-border">
              Mock
            </span>
          }
        />
      </div>

      {/* Session */}
      <div className="px-2 py-2">
        <MenuRow
          icon={LogOut}
          label="Sign out"
          to="/login"
          onClick={onClose}
          destructive
        />
        <p className="mt-1 px-2 text-[10.5px] text-muted-foreground">
          Prototype only — no real session is ended.
        </p>
      </div>
    </div>
  );
}

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const Trigger = (
    <button
      aria-label="Open profile menu"
      className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 border border-transparent transition hover:border-border hover:bg-secondary"
    >
      <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-background text-[11px] font-medium ring-2 ring-background shadow-soft">
        {currentUser.initials}
      </div>
      <ChevronsUpDown className="hidden lg:inline h-3 w-3 text-muted-foreground" />
    </button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{Trigger}</SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-sm p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Profile menu</SheetTitle>
          </SheetHeader>
          <ProfileBody onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{Trigger}</PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[300px] p-0 overflow-hidden">
        <ProfileBody onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
