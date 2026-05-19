import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Minus,
  Lock,
  Eye,
  MessageSquare,
  UserCog,
  Settings as SettingsIcon,
  Sparkles,
  BookOpen,
  Radio,
  ListChecks,
  Download,
  Send,
  UserPlus,
  ArrowLeftRight,
  Info,
} from "lucide-react";
import { PageHeader, MockBanner } from "@/components/ui-bits";
import { Pill } from "@/components/ui/pill";

export const Route = createFileRoute("/role-preview")({
  head: () => ({
    meta: [
      { title: "Role preview — AI Reception" },
      {
        name: "description",
        content: "Preview how Owner, Admin, Operator, and Viewer experience the same workspace.",
      },
    ],
  }),
  component: RolePreviewPage,
});

// ---------------- Roles & data ----------------

type Role = "Owner" | "Admin" | "Operator" | "Viewer";
const ROLES: Role[] = ["Owner", "Admin", "Operator", "Viewer"];

type Cap =
  | "view_dashboard"
  | "view_inbox"
  | "reply"
  | "assign"
  | "close"
  | "internal_note"
  | "view_customers"
  | "edit_customers"
  | "invite_members"
  | "change_roles"
  | "configure_channels"
  | "configure_ai"
  | "manage_knowledge"
  | "view_audit"
  | "export"
  | "manage_settings";

type Allow = "yes" | "no" | "partial";

const MATRIX: { id: Cap; label: string; roles: Record<Role, Allow> }[] = [
  {
    id: "view_dashboard",
    label: "View dashboard",
    roles: { Owner: "yes", Admin: "yes", Operator: "yes", Viewer: "yes" },
  },
  {
    id: "view_inbox",
    label: "View inbox",
    roles: { Owner: "yes", Admin: "yes", Operator: "yes", Viewer: "yes" },
  },
  {
    id: "reply",
    label: "Reply to conversations",
    roles: { Owner: "yes", Admin: "yes", Operator: "yes", Viewer: "no" },
  },
  {
    id: "assign",
    label: "Assign conversations",
    roles: { Owner: "yes", Admin: "yes", Operator: "partial", Viewer: "no" },
  },
  {
    id: "close",
    label: "Close conversations",
    roles: { Owner: "yes", Admin: "yes", Operator: "partial", Viewer: "no" },
  },
  {
    id: "internal_note",
    label: "Add internal notes",
    roles: { Owner: "yes", Admin: "yes", Operator: "yes", Viewer: "no" },
  },
  {
    id: "view_customers",
    label: "View customers",
    roles: { Owner: "yes", Admin: "yes", Operator: "yes", Viewer: "yes" },
  },
  {
    id: "edit_customers",
    label: "Edit customers",
    roles: { Owner: "yes", Admin: "yes", Operator: "yes", Viewer: "no" },
  },
  {
    id: "invite_members",
    label: "Invite members",
    roles: { Owner: "yes", Admin: "yes", Operator: "no", Viewer: "no" },
  },
  {
    id: "change_roles",
    label: "Change member roles",
    roles: { Owner: "yes", Admin: "partial", Operator: "no", Viewer: "no" },
  },
  {
    id: "configure_channels",
    label: "Configure channels",
    roles: { Owner: "yes", Admin: "yes", Operator: "no", Viewer: "no" },
  },
  {
    id: "configure_ai",
    label: "Configure AI settings",
    roles: { Owner: "yes", Admin: "yes", Operator: "no", Viewer: "no" },
  },
  {
    id: "manage_knowledge",
    label: "Manage knowledge base",
    roles: { Owner: "yes", Admin: "yes", Operator: "no", Viewer: "no" },
  },
  {
    id: "view_audit",
    label: "View audit log",
    roles: { Owner: "yes", Admin: "yes", Operator: "partial", Viewer: "no" },
  },
  {
    id: "export",
    label: "Export data",
    roles: { Owner: "yes", Admin: "yes", Operator: "no", Viewer: "no" },
  },
  {
    id: "manage_settings",
    label: "Manage workspace settings",
    roles: { Owner: "yes", Admin: "partial", Operator: "no", Viewer: "no" },
  },
];

const ROLE_PROFILES: Record<
  Role,
  {
    initials: string;
    name: string;
    description: string;
    level: string;
    status: string;
  }
> = {
  Owner: {
    initials: "AH",
    name: "Amelia Hart",
    description: "Full workspace access. Can manage members, settings, channels, and AI.",
    level: "Full access",
    status: "Active",
  },
  Admin: {
    initials: "DK",
    name: "Daniel Kowalski",
    description:
      "Manages most workspace operations. Cannot transfer ownership or remove the last owner.",
    level: "Elevated access",
    status: "Active",
  },
  Operator: {
    initials: "PR",
    name: "Priya Raman",
    description: "Focused on customer conversations and AI draft review. Cannot manage workspace.",
    level: "Workflow access",
    status: "Active",
  },
  Viewer: {
    initials: "JM",
    name: "Jordan Miles",
    description: "Read-only access. Can inspect activity but cannot modify data.",
    level: "Read-only",
    status: "Active",
  },
};

// ---------------- Helpers ----------------

function AllowMark({ a }: { a: Allow }) {
  if (a === "yes")
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-foreground">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-success/15 ring-1 ring-inset ring-success/30">
          <Check className="h-2.5 w-2.5 text-success" />
        </span>
        <span className="sr-only">Allowed</span>
      </span>
    );
  if (a === "no")
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-destructive/10 ring-1 ring-inset ring-destructive/25">
          <X className="h-2.5 w-2.5 text-destructive" />
        </span>
        <span className="sr-only">Not allowed</span>
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
      <span className="grid h-4 w-4 place-items-center rounded-full bg-warning/15 ring-1 ring-inset ring-warning/30">
        <Minus className="h-2.5 w-2.5 text-warning" />
      </span>
      <span className="sr-only">Partial</span>
    </span>
  );
}

function AllowLabel({ a }: { a: Allow }) {
  return (
    <span className="inline-flex items-center gap-2">
      <AllowMark a={a} />
      <span className="text-[12px] text-foreground">
        {a === "yes" ? "Allowed" : a === "no" ? "Blocked" : "Partial"}
      </span>
    </span>
  );
}

function Section({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-[14px] font-medium text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

// ---------------- Role selector ----------------

function RoleSelector({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  return (
    <div className="inline-flex w-full flex-wrap gap-1 rounded-lg border border-border bg-surface p-1 sm:w-auto">
      {ROLES.map((r) => {
        const active = r === role;
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={[
              "flex-1 sm:flex-none rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              active
                ? "bg-foreground text-background shadow-soft"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            ].join(" ")}
            aria-pressed={active}
          >
            {r}
          </button>
        );
      })}
    </div>
  );
}

// ---------------- Permission summary cards ----------------

const SUMMARY: {
  id: string;
  label: string;
  icon: typeof MessageSquare;
  caps: Cap[];
}[] = [
  {
    id: "conversations",
    label: "Conversations",
    icon: MessageSquare,
    caps: ["reply", "assign", "close", "internal_note"],
  },
  {
    id: "customers",
    label: "Customers",
    icon: UserCog,
    caps: ["view_customers", "edit_customers"],
  },
  { id: "members", label: "Members", icon: UserPlus, caps: ["invite_members", "change_roles"] },
  {
    id: "settings",
    label: "Settings",
    icon: SettingsIcon,
    caps: ["manage_settings", "configure_ai"],
  },
  { id: "ai", label: "AI drafts", icon: Sparkles, caps: ["configure_ai", "reply"] },
  { id: "audit", label: "Audit log", icon: ListChecks, caps: ["view_audit", "export"] },
  { id: "channels", label: "Channels", icon: Radio, caps: ["configure_channels"] },
];

function summarize(role: Role, caps: Cap[]): Allow {
  const vals = caps.map((c) => MATRIX.find((m) => m.id === c)!.roles[role]);
  if (vals.every((v) => v === "yes")) return "yes";
  if (vals.every((v) => v === "no")) return "no";
  return "partial";
}

function PermissionSummaryCard({ role, item }: { role: Role; item: (typeof SUMMARY)[number] }) {
  const Icon = item.icon;
  const overall = summarize(role, item.caps);
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-secondary text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="text-[13px] font-medium text-foreground">{item.label}</span>
        </div>
        <AllowMark a={overall} />
      </div>
      <ul className="mt-3 space-y-1.5">
        {item.caps.map((c) => {
          const cap = MATRIX.find((m) => m.id === c)!;
          return (
            <li key={c} className="flex items-center justify-between gap-3">
              <span className="truncate text-[12px] text-muted-foreground">{cap.label}</span>
              <AllowMark a={cap.roles[role]} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------- Permission matrix ----------------

function PermissionMatrix({ role }: { role: Role }) {
  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/60">
              <th className="py-2.5 pr-3 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                Capability
              </th>
              {ROLES.map((r) => (
                <th
                  key={r}
                  className={[
                    "px-3 py-2.5 text-center text-[11px] font-medium uppercase tracking-[0.06em]",
                    r === role ? "text-foreground" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((row) => (
              <tr key={row.id} className="border-b border-border/40 last:border-b-0">
                <td className="py-2.5 pr-3 text-[13px] text-foreground">{row.label}</td>
                {ROLES.map((r) => (
                  <td
                    key={r}
                    className={[
                      "px-3 py-2.5 text-center",
                      r === role ? "bg-secondary/40" : "",
                    ].join(" ")}
                  >
                    <div className="inline-flex">
                      <AllowMark a={row.roles[r]} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: role cards (current role only — switch via selector) */}
      <div className="md:hidden">
        <div className="mb-3 flex items-center gap-2 text-[12px] text-muted-foreground">
          <Info className="h-3.5 w-3.5" /> Showing capabilities for{" "}
          <span className="font-medium text-foreground">{role}</span>
        </div>
        <ul className="divide-y divide-border/40 rounded-lg border border-border bg-surface">
          {MATRIX.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="text-[13px] text-foreground">{row.label}</span>
              <AllowLabel a={row.roles[role]} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ---------------- Role-specific preview ----------------

type DemoAction = {
  label: string;
  icon: typeof Send;
  cap: Cap;
  primary?: boolean;
};

const INBOX_ACTIONS: DemoAction[] = [
  { label: "Reply to customer", icon: Send, cap: "reply", primary: true },
  { label: "Add internal note", icon: MessageSquare, cap: "internal_note" },
  { label: "Review AI draft", icon: Sparkles, cap: "reply" },
  { label: "Assign conversation", icon: UserCog, cap: "assign" },
  { label: "Close conversation", icon: Check, cap: "close" },
];

const ADMIN_ACTIONS: DemoAction[] = [
  { label: "Invite member", icon: UserPlus, cap: "invite_members" },
  { label: "Change member role", icon: UserCog, cap: "change_roles" },
  { label: "Configure channels", icon: Radio, cap: "configure_channels" },
  { label: "Manage knowledge", icon: BookOpen, cap: "manage_knowledge" },
  { label: "Export audit log", icon: Download, cap: "export" },
];

function DisabledActionDemo({ action, role }: { action: DemoAction; role: Role }) {
  const allowed = MATRIX.find((m) => m.id === action.cap)!.roles[role];
  const disabled = allowed !== "yes";
  const Icon = action.icon;

  const base = action.primary
    ? "bg-primary text-primary-foreground hover:opacity-95"
    : "border border-border bg-surface text-foreground hover:bg-secondary";
  const disabledCls = action.primary
    ? "bg-primary/40 text-primary-foreground/70 cursor-not-allowed"
    : "border-border bg-surface text-muted-foreground cursor-not-allowed opacity-70";

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-[13px] text-foreground">{action.label}</span>
      </div>
      <div className="flex items-center gap-2">
        {allowed === "partial" && (
          <Pill variant="warn" size="sm">
            Policy
          </Pill>
        )}
        <button
          type="button"
          disabled={disabled}
          aria-disabled={disabled}
          title={disabled ? `Requires ${requiredRole(action.cap)}` : undefined}
          className={[
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition",
            disabled ? disabledCls : base,
          ].join(" ")}
        >
          {disabled && <Lock className="h-3 w-3" />}
          {disabled ? "Disabled" : "Run"}
        </button>
      </div>
    </div>
  );
}

function requiredRole(cap: Cap): Role {
  // First role (in priority order) that fully allows the cap.
  for (const r of ROLES) {
    if (MATRIX.find((m) => m.id === cap)!.roles[r] === "yes") return r;
  }
  return "Owner";
}

function RolePreviewArea({ role }: { role: Role }) {
  const isViewer = role === "Viewer";
  const isOperator = role === "Operator";
  const isAdmin = role === "Admin";

  return (
    <div className="space-y-4">
      {isViewer && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/25 bg-warning/10 px-4 py-3">
          <Eye className="mt-0.5 h-4 w-4 text-warning" />
          <div className="text-[13px] text-foreground">
            <p className="font-medium">Viewer mode: actions are disabled.</p>
            <p className="mt-0.5 text-muted-foreground">
              Viewers can inspect workspace activity but cannot modify data.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-[13px] font-medium text-foreground">Inbox actions</h3>
            </div>
            <Pill variant={isViewer ? "muted" : isOperator ? "operator" : "info"} size="sm">
              {role}
            </Pill>
          </div>
          <div className="space-y-2">
            {INBOX_ACTIONS.map((a) => (
              <DisabledActionDemo key={a.label} action={a} role={role} />
            ))}
          </div>
          {isOperator && (
            <p className="mt-3 text-[12px] text-muted-foreground">
              Operators focus on customer conversations and AI draft review. Assign and close depend
              on workspace policy.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-[13px] font-medium text-foreground">Workspace actions</h3>
            </div>
            <Pill variant={isViewer ? "muted" : isAdmin ? "info" : "primary"} size="sm">
              {role}
            </Pill>
          </div>
          <div className="space-y-2">
            {ADMIN_ACTIONS.map((a) => (
              <DisabledActionDemo key={a.label} action={a} role={role} />
            ))}
          </div>
          {isAdmin && (
            <p className="mt-3 text-[12px] text-muted-foreground">
              Admins cannot remove the last owner or transfer ownership.
            </p>
          )}
        </div>
      </div>

      {/* Read-only form + locked setting */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-[13px] font-medium text-foreground">Read-only form field</h3>
          <label className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Workspace name
          </label>
          <input
            value="Tehran Dental Clinic"
            readOnly={isViewer || isOperator}
            disabled={isViewer || isOperator}
            onChange={() => {}}
            className={[
              "mt-1 block w-full rounded-md border border-border bg-card px-3 py-2 text-[13px] text-foreground",
              isViewer || isOperator ? "cursor-not-allowed opacity-70" : "",
            ].join(" ")}
          />
          <p className="mt-2 text-[11.5px] text-muted-foreground">
            {isViewer || isOperator
              ? "This role cannot edit workspace settings."
              : "Editable for this role."}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-[13px] font-medium text-foreground">Locked setting row</h3>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5">
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-foreground">Transfer ownership</div>
              <p className="text-[11.5px] text-muted-foreground">
                Only the current Owner can transfer ownership.
              </p>
            </div>
            <button
              disabled
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground opacity-70 cursor-not-allowed"
            >
              <Lock className="h-3 w-3" /> Locked
            </button>
          </div>
          <div className="mt-3 rounded-lg border border-border/60 bg-card px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-foreground">Audit details</div>
                <p className="text-[11.5px] text-muted-foreground">
                  Full IP/device metadata is restricted.
                </p>
              </div>
              <Pill
                variant={
                  MATRIX.find((m) => m.id === "view_audit")!.roles[role] === "yes"
                    ? "success"
                    : "muted"
                }
                size="sm"
              >
                {MATRIX.find((m) => m.id === "view_audit")!.roles[role] === "yes"
                  ? "Visible"
                  : MATRIX.find((m) => m.id === "view_audit")!.roles[role] === "partial"
                    ? "Limited"
                    : "Restricted"}
              </Pill>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Denied action examples ----------------

type DeniedExample = {
  id: string;
  attempted: string;
  required: Role;
  current: Role;
  reason: string;
  next: string;
};

const DENIED_EXAMPLES: DeniedExample[] = [
  {
    id: "viewer-reply",
    attempted: "Reply to customer",
    required: "Operator",
    current: "Viewer",
    reason: "Viewer is read-only and cannot send replies.",
    next: "Ask an Operator or Admin to send the reply.",
  },
  {
    id: "viewer-export",
    attempted: "Export customer data",
    required: "Admin",
    current: "Viewer",
    reason: "Export is restricted to Owner and Admin.",
    next: "Request the export from a workspace Admin.",
  },
  {
    id: "operator-settings",
    attempted: "Open workspace settings",
    required: "Admin",
    current: "Operator",
    reason: "Operators cannot manage workspace settings.",
    next: "Ask an Admin or Owner to change the setting.",
  },
  {
    id: "operator-invite",
    attempted: "Invite a new member",
    required: "Admin",
    current: "Operator",
    reason: "Operators cannot invite members.",
    next: "Request an invite from an Admin or Owner.",
  },
  {
    id: "admin-transfer",
    attempted: "Transfer workspace ownership",
    required: "Owner",
    current: "Admin",
    reason: "Only the current Owner can transfer ownership.",
    next: "Ask the workspace Owner to initiate the transfer.",
  },
];

function DeniedActionExample({ ex }: { ex: DeniedExample }) {
  return (
    <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3">
      <div className="flex items-start gap-2">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-foreground">{ex.attempted}</span>
            <Pill variant="destructive" size="sm">
              Permission denied
            </Pill>
          </div>
          <dl className="mt-2 grid gap-1 text-[12px] sm:grid-cols-2">
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Required:</dt>
              <dd className="text-foreground font-medium">{ex.required}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Current:</dt>
              <dd className="text-foreground font-medium">{ex.current}</dd>
            </div>
          </dl>
          <p className="mt-1.5 text-[12px] text-muted-foreground">{ex.reason}</p>
          <p className="mt-1 text-[12px] text-foreground">
            <span className="text-muted-foreground">Next step: </span>
            {ex.next}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------- Page ----------------

function RolePreviewPage() {
  const [role, setRole] = useState<Role>("Owner");
  const profile = ROLE_PROFILES[role];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
      <PageHeader
        eyebrow="Internal demo"
        title="Role-Based Access Preview"
        description="Preview how Owner, Admin, Operator, and Viewer experience the same workspace."
        action={<RoleSelector role={role} onChange={setRole} />}
      />

      <MockBanner />

      <div className="flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
        <p className="text-[12.5px] text-foreground">
          <span className="font-medium">Client-side role previews are for UX only.</span>{" "}
          <span className="text-muted-foreground">
            Server-side authorization must enforce all permissions. Every tenant-scoped request is
            verified server-side.
          </span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Identity */}
        <Section title="Current mock user" description="Switch roles to preview the workspace.">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-foreground to-foreground/80 text-background text-[12px] font-medium shadow-soft">
              {profile.initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-medium text-foreground">{profile.name}</div>
              <div className="truncate text-[12px] text-muted-foreground">Tehran Dental Clinic</div>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-[12.5px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Role</dt>
              <dd>
                <Pill
                  variant={role === "Viewer" ? "muted" : role === "Operator" ? "operator" : "info"}
                  size="sm"
                >
                  <Shield className="h-3 w-3" />
                  <span className="ml-1">{role}</span>
                </Pill>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Pill variant="success" size="sm">
                  {profile.status}
                </Pill>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Permission level</dt>
              <dd className="text-foreground font-medium">{profile.level}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[12px] text-muted-foreground">{profile.description}</p>
        </Section>

        {/* Summary cards */}
        <Section
          title="Permission summary"
          description={`What ${role} can do across the workspace.`}
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {SUMMARY.map((s) => (
              <PermissionSummaryCard key={s.id} role={role} item={s} />
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Permission matrix"
        description="Full capability list. Highlighted column = current preview role."
      >
        <PermissionMatrix role={role} />
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 pt-3 text-[11.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <AllowMark a="yes" /> Allowed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <AllowMark a="partial" /> Depends on policy
          </span>
          <span className="inline-flex items-center gap-1.5">
            <AllowMark a="no" /> Blocked
          </span>
        </div>
      </Section>

      <Section
        title={`Role-specific preview — ${role}`}
        description="How the workspace behaves for the selected role. All actions are mock-only."
      >
        <RolePreviewArea role={role} />
      </Section>

      <Section
        title="Access denied examples"
        description="How blocked actions surface to the user."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {DENIED_EXAMPLES.map((ex) => (
            <DeniedActionExample key={ex.id} ex={ex} />
          ))}
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
        <p className="text-[12px] text-muted-foreground">
          Want to see how this connects to members and settings?
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/members"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary"
          >
            <UserPlus className="h-3.5 w-3.5" /> Members
          </Link>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary"
          >
            <SettingsIcon className="h-3.5 w-3.5" /> Settings
          </Link>
          <Link
            to="/access-denied"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" /> View access denied screen
          </Link>
        </div>
      </div>
    </div>
  );
}
