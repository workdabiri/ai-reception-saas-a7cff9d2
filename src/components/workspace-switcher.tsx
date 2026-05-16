import { useState } from "react";
import { Check, ChevronsUpDown, Shield, Layers } from "lucide-react";
import { workspaces, type Workspace, type WorkspaceRole } from "@/lib/mock-data";

const roleTone: Record<WorkspaceRole, string> = {
  Owner: "bg-primary-soft text-primary border-primary/20",
  Admin: "bg-info/10 text-info border-info/20",
  Operator: "bg-success/10 text-success border-success/20",
  Viewer: "bg-muted text-muted-foreground border-border",
};

const statusTone: Record<Workspace["status"], string> = {
  Active: "bg-success",
  Trial: "bg-warning",
  Demo: "bg-info",
};

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Workspace>(workspaces[0]);

  return (
    <div className="relative m-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-surface px-3 py-3 text-left transition hover:bg-sidebar-accent"
      >
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-medium text-sm">
          {active.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {active.name}
            </span>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusTone[active.status]}`} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>{active.role}</span>
            <span className="opacity-50">·</span>
            <span className="truncate">{active.status}</span>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-pop">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-[11px] font-medium text-muted-foreground">
              <Layers className="h-3 w-3" />
              Data is scoped to the active workspace
            </div>
            <ul className="max-h-80 overflow-y-auto py-1">
              {workspaces.map((w) => {
                const isActive = w.id === active.id;
                return (
                  <li key={w.id}>
                    <button
                      onClick={() => {
                        setActive(w);
                        setOpen(false);
                      }}
                      className="flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-surface-muted"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">
                        {w.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{w.name}</span>
                          {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <div className="mt-1 truncate text-[11px] text-muted-foreground">
                          {w.industry} · {w.members} members
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-medium ${roleTone[w.role]}`}
                          >
                            {w.role}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[10px] font-medium text-muted-foreground">
                            <span className={`h-1.5 w-1.5 rounded-full ${statusTone[w.status]}`} />
                            {w.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-border bg-surface-muted px-3 py-2 text-[11px] text-muted-foreground">
              Switching workspaces is mock-only in this prototype.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { roleTone };
