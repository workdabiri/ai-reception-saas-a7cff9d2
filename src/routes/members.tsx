import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Avatar, PageHeader } from "@/components/ui-bits";
import { members, currentWorkspace, type WorkspaceRole } from "@/lib/mock-data";
import {
  Plus,
  MoreHorizontal,
  Shield,
  ShieldAlert,
  Lock,
  Check,
  Minus,
  X,
  Mail,
  UserMinus,
  UserCog,
  ShieldOff,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useStateParam,
  presets as statePresets,
  RouteStatePage,
  RouteSkeleton,
} from "@/components/route-state";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members & access — AI Reception" },
      { name: "description", content: "Roles, permissions and workspace access." },
    ],
  }),
  component: MembersPage,
});

type MemberStatus = "Active" | "Invited" | "Removed" | "Suspended";

type Row = {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  status: MemberStatus;
  initials: string;
  lastActive: string;
  workspace: string;
};

const baseRows: Row[] = members.map((m, i) => ({
  ...m,
  status: m.status as MemberStatus,
  lastActive: ["2 min ago", "27 min ago", "1 hr ago", "Yesterday", "Invite pending"][i] ?? "—",
  workspace: currentWorkspace.name,
}));

// Add a couple of extra states for visual completeness
baseRows.push({
  id: "u6",
  name: "Renée Okafor",
  email: "renee@tehrandental.co",
  role: "Operator",
  status: "Suspended",
  initials: "RO",
  lastActive: "5 days ago",
  workspace: currentWorkspace.name,
});
baseRows.push({
  id: "u7",
  name: "Tomás Vidal",
  email: "tomas@tehrandental.co",
  role: "Viewer",
  status: "Removed",
  initials: "TV",
  lastActive: "2 weeks ago",
  workspace: currentWorkspace.name,
});

// Role pills: neutral surface + colored dot. Text always readable.
const roleTone: Record<WorkspaceRole, string> = {
  Owner: "member-role member-role--owner",
  Admin: "member-role member-role--admin",
  Operator: "member-role member-role--operator",
  Viewer: "member-role member-role--viewer",
};

// Status pills: soft background + text-tuned color.
const statusTone: Record<MemberStatus, string> = {
  Active: "member-status member-status--active",
  Invited: "member-status member-status--invited",
  Removed: "member-status member-status--removed",
  Suspended: "member-status member-status--suspended",
};

const roles: WorkspaceRole[] = ["Owner", "Admin", "Operator", "Viewer"];

type Perm = "full" | "read" | "none";
type PermissionRow = {
  area: string;
  perms: Record<WorkspaceRole, Perm>;
};

const matrix: PermissionRow[] = [
  { area: "Business settings", perms: { Owner: "full", Admin: "full", Operator: "none", Viewer: "none" } },
  { area: "Members", perms: { Owner: "full", Admin: "full", Operator: "none", Viewer: "none" } },
  { area: "Customers", perms: { Owner: "full", Admin: "full", Operator: "full", Viewer: "read" } },
  { area: "Conversations", perms: { Owner: "full", Admin: "full", Operator: "full", Viewer: "read" } },
  { area: "Messages", perms: { Owner: "full", Admin: "full", Operator: "full", Viewer: "read" } },
  { area: "AI drafts", perms: { Owner: "full", Admin: "full", Operator: "full", Viewer: "none" } },
  { area: "Audit log", perms: { Owner: "full", Admin: "read", Operator: "none", Viewer: "none" } },
];

function PermCell({ p }: { p: Perm }) {
  if (p === "full")
    return (
      // eslint-disable-next-line local/no-pill-contrast-violation -- icon-only tile; text-success colors the Check icon
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-success/15 text-success">
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  if (p === "read")
    return (
      <span className="inline-flex h-6 items-center gap-1 rounded-md bg-muted px-2 text-[10px] font-medium text-muted-foreground">
        <Minus className="h-3 w-3" /> read
      </span>
    );
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground/60">
      <X className="h-3.5 w-3.5" />
    </span>
  );
}

function MembersPage() {
  const stateOverride = useStateParam();
  const [rows] = useState<Row[]>(
    stateOverride === "pending"
      ? [
          {
            id: "inv1",
            name: "Priya Patel",
            email: "priya@example.com",
            role: "Operator",
            status: "Invited",
            initials: "PP",
            lastActive: "Invite pending",
            workspace: currentWorkspace.name,
          },
          {
            id: "inv2",
            name: "Marcus Lee",
            email: "marcus@example.com",
            role: "Viewer",
            status: "Invited",
            initials: "ML",
            lastActive: "Invite pending",
            workspace: currentWorkspace.name,
          },
        ]
      : baseRows
  );
  const [invite, setInvite] = useState(false);
  const [changeRole, setChangeRole] = useState<Row | null>(null);
  const [removeRow, setRemoveRow] = useState<Row | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  if (stateOverride === "empty") {
    return (
      <RouteStatePage title="Members & access" description="Manage who can see and act in this workspace.">
        {statePresets.membersEmpty()}
      </RouteStatePage>
    );
  }
  if (stateOverride === "access-denied") {
    return (
      <RouteStatePage title="Members & access">{statePresets.membersAccessDenied()}</RouteStatePage>
    );
  }
  if (stateOverride === "loading") {
    return (
      <RouteStatePage title="Members & access" description="Loading members…">
        <RouteSkeleton variant="table" />
      </RouteStatePage>
    );
  }


  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <PageHeader
          title="Members & access"
          description="Manage who can see and act inside this workspace. Roles are illustrated in the prototype; enforcement is a planned capability."
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAccessDenied(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
              >
                <ShieldOff className="h-3.5 w-3.5" /> Preview access denied
              </button>
              <button
                onClick={() => setInvite(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-95"
              >
                <Plus className="h-3.5 w-3.5" /> Invite member
              </button>
            </div>
          }
        />

        {/* Safety strip */}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="callout callout--primary">
            <div className="callout-title">
              <Shield className="callout-icon" />
              Server verifies membership
            </div>
            <p className="callout-body">
              Every tenant-scoped request is checked server-side. Client-side checks are UX only.
            </p>
          </div>
          <div className="callout callout--warning">
            <div className="callout-title">
              <Lock className="callout-icon" />
              The last Owner cannot be removed
            </div>
            <p className="callout-body">
              Removed members lose access immediately on next request.
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-[12px]">
          <span className="text-muted-foreground">
            Preview role permissions across Owner, Admin, Operator, and Viewer.
          </span>
          <Link
            to="/role-preview"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 font-medium text-foreground hover:bg-secondary"
          >
            <Shield className="h-3.5 w-3.5" /> Role preview
          </Link>
        </div>


        {/* Members — desktop table */}
        <div className="mt-6 hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.7fr_0.8fr_0.6fr] items-center gap-3 border-b border-border bg-surface px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <div>Member</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Last active</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="divide-y divide-border">
            {rows.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-[1.6fr_1fr_0.8fr_0.7fr_0.8fr_0.6fr] items-center gap-3 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar initials={m.initials} />
                  <div className="min-w-0">
                    <div className="truncate font-medium">{m.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{m.workspace}</div>
                  </div>
                </div>
                <div className="truncate text-muted-foreground">{m.email}</div>
                <div>
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-medium ${roleTone[m.role]}`}
                  >
                    {m.role}
                  </span>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-[11px] font-medium ${statusTone[m.status]}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {m.status}
                  </span>
                </div>
                <div className="text-[12px] text-muted-foreground">{m.lastActive}</div>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setChangeRole(m)}>
                        <UserCog className="mr-2 h-4 w-4" /> Change role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" /> Resend invite
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setRemoveRow(m)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" /> Remove from workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members — mobile cards */}
        <ul className="mt-6 space-y-3 md:hidden">
          {rows.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <Avatar initials={m.initials} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{m.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{m.email}</div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setChangeRole(m)}>
                          <UserCog className="mr-2 h-4 w-4" /> Change role
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" /> Resend invite
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setRemoveRow(m)}
                        >
                          <UserMinus className="mr-2 h-4 w-4" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-medium ${roleTone[m.role]}`}
                    >
                      {m.role}
                    </span>
                    <span
                      className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-[11px] font-medium ${statusTone[m.status]}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                      {m.status}
                    </span>
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      {m.lastActive}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Permission matrix */}
        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-medium">Permission matrix</h2>
              <p className="text-[12px] text-muted-foreground">
                What each role can do inside a workspace. Visualization only — server is the source of truth.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-border bg-surface-muted px-2 py-1 text-[11px] text-muted-foreground">
              <Info className="h-3 w-3" /> Planned capability
            </span>
          </div>
          {/* Desktop/tablet matrix */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Area</th>
                  {roles.map((r) => (
                    <th key={r} className="px-4 py-3 text-center font-medium">
                      <span className={`inline-flex rounded-md border px-2 py-1 text-[11px] ${roleTone[r]}`}>
                        {r}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {matrix.map((row) => (
                  <tr key={row.area}>
                    <td className="px-4 py-3 font-medium">{row.area}</td>
                    {roles.map((r) => (
                      <td key={r} className="px-4 py-3 text-center">
                        <PermCell p={row.perms[r]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile permission role cards */}
          <div className="md:hidden divide-y divide-border">
            {roles.map((r) => {
              const allowed = matrix.filter((row) => row.perms[r] === "full").map((row) => row.area);
              const readOnly = matrix.filter((row) => row.perms[r] === "read").map((row) => row.area);
              const restricted = matrix.filter((row) => row.perms[r] === "none").map((row) => row.area);
              return (
                <div key={r} className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-medium ${roleTone[r]}`}>
                      {r}
                    </span>
                  </div>
                  <dl className="mt-3 space-y-3 text-[12px]">
                    {allowed.length > 0 && (
                      <div>
                        <dt className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          <Check className="h-3 w-3 text-success" /> Full access
                        </dt>
                        <dd className="text-foreground">{allowed.join(" · ")}</dd>
                      </div>
                    )}
                    {readOnly.length > 0 && (
                      <div>
                        <dt className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          <Minus className="h-3 w-3" /> Read only
                        </dt>
                        <dd className="text-foreground">{readOnly.join(" · ")}</dd>
                      </div>
                    )}
                    {restricted.length > 0 && (
                      <div>
                        <dt className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          <X className="h-3 w-3 text-muted-foreground" /> Restricted
                        </dt>
                        <dd className="text-muted-foreground">{restricted.join(" · ")}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              );
            })}
          </div>

          <div className="grid gap-3 border-t border-border bg-surface px-4 py-4 sm:grid-cols-2">
            {[
              ["Owner", "Full workspace access, members and settings. Billing planned."],
              ["Admin", "Manage settings and members; full access to operations."],
              ["Operator", "Reply to conversations and manage customers."],
              ["Viewer", "Read-only access to inbox and customer context."],
            ].map(([role, desc]) => (
              <div key={role} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-medium ${roleTone[role as WorkspaceRole]}`}>
                    {role}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety notes */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">Safety &amp; access rules</h3>
          </div>
          <ul className="mt-3 grid gap-2 text-[12px] text-muted-foreground sm:grid-cols-2">
            <li className="flex gap-2"><Check className="mt-1 h-3.5 w-3.5 text-success" /> Last Owner cannot be removed or demoted.</li>
            <li className="flex gap-2"><Check className="mt-1 h-3.5 w-3.5 text-success" /> Removed members lose access immediately.</li>
            <li className="flex gap-2"><Check className="mt-1 h-3.5 w-3.5 text-success" /> Server verifies membership on every tenant-scoped request.</li>
            <li className="flex gap-2"><Check className="mt-1 h-3.5 w-3.5 text-success" /> Client-side checks are UX only — never trusted for authorization.</li>
            <li className="flex gap-2"><Check className="mt-1 h-3.5 w-3.5 text-success" /> Suspended members keep records but cannot access the workspace. Auth planned.</li>
            <li className="flex gap-2"><Check className="mt-1 h-3.5 w-3.5 text-success" /> Role changes are written to the audit log.</li>
          </ul>
        </div>
      </div>

      {/* Invite modal */}
      <Dialog open={invite} onOpenChange={setInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
            <DialogDescription>
              Mock invite — no email is sent in this prototype.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="teammate@company.com" />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select defaultValue="Operator">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Invitee will only see data inside <span className="font-medium text-foreground">{currentWorkspace.name}</span>.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvite(false)}>Cancel</Button>
            <Button onClick={() => setInvite(false)}>Send invite (mock)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change role modal */}
      <Dialog open={!!changeRole} onOpenChange={(o) => !o && setChangeRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              {changeRole && (
                <>Update access for <span className="font-medium text-foreground">{changeRole.name}</span>.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            {roles.map((r) => (
              <label
                key={r}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 hover:bg-secondary"
              >
                <input
                  type="radio"
                  name="role"
                  defaultChecked={changeRole?.role === r}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-medium ${roleTone[r]}`}>
                      {r}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {r === "Owner" && "Full workspace access. Billing planned."}
                    {r === "Admin" && "Manage settings and members."}
                    {r === "Operator" && "Handle conversations and customers."}
                    {r === "Viewer" && "Read-only across the workspace."}
                  </p>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRole(null)}>Cancel</Button>
            <Button onClick={() => setChangeRole(null)}>Save role (mock)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <Dialog open={!!removeRow} onOpenChange={(o) => !o && setRemoveRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              {removeRow && (
                <>
                  <span className="font-medium text-foreground">{removeRow.name}</span> will lose access to{" "}
                  <span className="font-medium text-foreground">{currentWorkspace.name}</span> immediately.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-[12px] text-foreground">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-1 h-4 w-4" />
              <div>
                Their assigned conversations will become unassigned. Audit history is preserved.
                The last Owner cannot be removed.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveRow(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setRemoveRow(null)}>
              Remove member (mock)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Access denied preview */}
      <Dialog open={accessDenied} onOpenChange={setAccessDenied}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldOff className="h-4 w-4 text-destructive" /> Access denied
            </DialogTitle>
            <DialogDescription>
              You don't have permission to view this resource in{" "}
              <span className="font-medium text-foreground">{currentWorkspace.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-surface p-3 text-[12px] text-muted-foreground">
            Server-side membership and role checks blocked this request. Ask an Owner or Admin to grant the right role.
          </div>
          <DialogFooter>
            <Button onClick={() => setAccessDenied(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
