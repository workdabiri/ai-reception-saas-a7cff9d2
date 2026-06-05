import { useState } from "react";
import { Check, ChevronsUpDown, Layers, Loader2 } from "lucide-react";
import { useBusinessContext } from "@/contexts/business-context";
import type { BusinessIdentity } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive 2-char initials from a business name. */
function businessInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] ?? "A").toUpperCase() + (parts[1][0] ?? "I").toUpperCase();
  }
  return (name[0] ?? "A").toUpperCase() + (name[1] ?? "I").toUpperCase();
}

const statusTone: Record<BusinessIdentity["status"], string> = {
  ACTIVE: "bg-success",
  SUSPENDED: "bg-destructive",
  ARCHIVED: "bg-muted",
};

const statusLabel: Record<BusinessIdentity["status"], string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const { businessId, businesses, switchBusiness, isLoading, isEmpty } = useBusinessContext();

  const activeBusiness = businesses.find((b) => b.id === businessId) ?? businesses[0] ?? null;

  // Loading state
  if (isLoading) {
    return (
      <div className="m-3">
        <div className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-surface px-3 py-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary animate-pulse" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-24 rounded bg-secondary animate-pulse" />
            <div className="h-2.5 w-16 rounded bg-secondary animate-pulse" />
          </div>
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  // Empty state — no businesses
  if (isEmpty || !activeBusiness) {
    return (
      <div className="m-3">
        <div className="flex w-full items-center gap-3 rounded-xl border border-dashed border-sidebar-border bg-surface px-3 py-3 text-left">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-muted-foreground text-sm font-medium">
            —
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-muted-foreground">No workspace</div>
            <div className="text-[11px] text-muted-foreground/70">
              You are not a member of any business yet.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative m-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-surface px-3 py-3 text-left transition hover:bg-sidebar-accent"
      >
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-medium text-sm">
          {businessInitials(activeBusiness.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {activeBusiness.name}
            </span>
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusTone[activeBusiness.status] ?? "bg-muted"}`}
            />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{statusLabel[activeBusiness.status] ?? activeBusiness.status}</span>
          </div>
        </div>
        {businesses.length > 1 && <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && businesses.length > 1 && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-pop">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-[11px] font-medium text-muted-foreground">
              <Layers className="h-3 w-3" />
              Data is scoped to the active workspace
            </div>
            <ul className="max-h-80 overflow-y-auto py-1">
              {businesses.map((b) => {
                const isActive = b.id === activeBusiness.id;
                return (
                  <li key={b.id}>
                    <button
                      onClick={() => {
                        switchBusiness(b.id);
                        setOpen(false);
                      }}
                      className="flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-surface-muted"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground text-xs font-medium">
                        {businessInitials(b.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{b.name}</span>
                          {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[10px] font-medium text-muted-foreground">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusTone[b.status] ?? "bg-muted"}`}
                            />
                            {statusLabel[b.status] ?? b.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
