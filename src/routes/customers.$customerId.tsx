import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Avatar, PageHeader } from "@/components/ui-bits";
import { useBusinessId } from "@/contexts/business-context";
import { useCustomer } from "@/hooks/use-customers";
import type { ContactMethod, ContactMethodType } from "@/lib/api-types";
import {
  Mail,
  Phone,
  Shield,
  StickyNote,
  ArrowLeft,
  MessageSquare,
  Clock,
  Lock,
  Globe,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { presets as statePresets, RouteStatePage, StateBanner } from "@/components/route-state";

// ---------------------------------------------------------------------------
// Route definition
//
// We use a component-level hook (useCustomer) rather than a TanStack Router
// loader because loaders cannot call React hooks. The loader pattern used in
// the mock version (synchronous find) does not apply to async API calls.
// The notFoundComponent handles the 404 case separately.
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/customers/$customerId")({
  head: () => ({
    meta: [
      { title: "Customer — Customers — AI Reception" },
      { name: "description", content: "Reception profile for this customer." },
    ],
  }),
  notFoundComponent: () => (
    <>
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-xl font-medium tracking-tight">Customer not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This profile doesn&apos;t exist in the current workspace.
        </p>
        <Link
          to="/customers"
          className="mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-secondary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
        </Link>
      </div>
    </>
  ),
  component: CustomerProfilePage,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive initials from displayName (up to 2 chars). */
function initials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return displayName.slice(0, 2).toUpperCase();
}

/** Format an ISO timestamp as a relative string. */
function formatRelativeTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

/** Icon for a contact method type. */
function ContactMethodIcon({ type }: { type: ContactMethodType }) {
  if (type === "EMAIL") return <Mail className="h-3.5 w-3.5 text-muted-foreground" />;
  if (type === "PHONE" || type === "WHATSAPP")
    return <Phone className="h-3.5 w-3.5 text-muted-foreground" />;
  return <Globe className="h-3.5 w-3.5 text-muted-foreground" />;
}

/** Human-readable label for a contact method type. */
function contactMethodLabel(type: ContactMethodType): string {
  const map: Record<ContactMethodType, string> = {
    EMAIL: "Email",
    PHONE: "Phone",
    WHATSAPP: "WhatsApp",
    INSTAGRAM: "Instagram",
    TELEGRAM: "Telegram",
    WEBSITE_CHAT: "Web Chat",
    CUSTOM: "Contact",
  };
  return map[type] ?? type;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

function CustomerProfilePage() {
  const { customerId } = useParams({ from: "/customers/$customerId" });
  const businessId = useBusinessId();

  const {
    data: customer,
    isLoading,
    isError,
    error,
    refetch,
  } = useCustomer(businessId, customerId);

  // ── No businessId ───────────────────────────────────────────────────────
  if (!businessId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 space-y-6">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Customers
        </Link>
        <PageHeader title="Customer" />
        <StateBanner
          icon={AlertTriangle}
          tone="warning"
          title="No business configured"
          description="Set VITE_DEV_BUSINESS_ID in your .env file to connect to the backend API."
        />
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 space-y-6">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Customers
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading customer…
        </div>
        <LoadingSkeleton variant="card" />
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (isError || !customer) {
    const apiErr = error as
      | { isUnauthenticated?: boolean; isForbidden?: boolean; isNotFound?: boolean }
      | undefined;

    if (apiErr?.isUnauthenticated) {
      return (
        <RouteStatePage title="Customer">{statePresets.profileSessionExpired()}</RouteStatePage>
      );
    }
    if (apiErr?.isForbidden) {
      return (
        <RouteStatePage title="Customer">{statePresets.customersAccessDenied()}</RouteStatePage>
      );
    }
    if (apiErr?.isNotFound) {
      return (
        <>
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <h1 className="text-xl font-medium tracking-tight">Customer not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This profile doesn&apos;t exist in the current workspace.
            </p>
            <Link
              to="/customers"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-secondary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
            </Link>
          </div>
        </>
      );
    }

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 space-y-6">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Customers
        </Link>
        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="mx-auto flex w-full max-w-[360px] flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h3 className="mb-1.5 text-[16px] font-medium leading-tight text-foreground">
              Could not load customer
            </h3>
            <p className="mb-5 text-[13px] leading-[1.5] text-muted-foreground">
              Something went wrong while fetching this customer profile. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 h-9 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground shadow-soft transition hover:opacity-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Data loaded ─────────────────────────────────────────────────────────
  const contactMethods = customer.contactMethods ?? [];
  const emailMethods = contactMethods.filter((m) => m.type === "EMAIL");
  const phoneMethods = contactMethods.filter((m) => m.type === "PHONE" || m.type === "WHATSAPP");
  const otherMethods = contactMethods.filter(
    (m) => m.type !== "EMAIL" && m.type !== "PHONE" && m.type !== "WHATSAPP",
  );

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Customers
        </Link>

        <div className="mt-3">
          <PageHeader
            title={customer.displayName}
            description={`Created ${formatRelativeTime(customer.createdAt)} · ${customer.status === "ACTIVE" ? "Active" : "Archived"}`}
            action={
              <div className="flex items-center gap-2">
                <Link
                  to="/inbox"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-95"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Open in inbox
                </Link>
              </div>
            }
          />
        </div>

        {/* Visibility notice */}
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[12px] text-foreground">
          <Shield className="mt-1 h-4 w-4 shrink-0" />
          <div>
            <span className="font-medium">Visible only inside this workspace.</span> Customer data
            and notes are workspace-scoped to permitted members. Server verifies membership on every
            request.
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar: identity + contact methods + notes */}
          <aside className="space-y-6">
            <Card>
              <div className="flex items-center gap-3">
                <Avatar initials={initials(customer.displayName)} tone="primary" />
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-medium">{customer.displayName}</h2>
                  <p className="text-xs text-muted-foreground">
                    {customer.status === "ACTIVE" ? "Active customer" : "Archived"}
                  </p>
                </div>
              </div>

              {/* Contact methods */}
              <div className="mt-4 space-y-2 text-xs">
                {contactMethods.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No contact methods on file.
                  </p>
                ) : (
                  <>
                    {emailMethods.map((m) => (
                      <ContactRow key={m.id} method={m} />
                    ))}
                    {phoneMethods.map((m) => (
                      <ContactRow key={m.id} method={m} />
                    ))}
                    {otherMethods.map((m) => (
                      <ContactRow key={m.id} method={m} />
                    ))}
                  </>
                )}
              </div>

              {/* Locale */}
              {customer.locale && (
                <div className="mt-4 border-t border-border pt-4">
                  <SectionTitle>Locale</SectionTitle>
                  <p className="mt-1 text-xs text-muted-foreground">{customer.locale}</p>
                </div>
              )}
            </Card>

            {/* Notes card */}
            <Card>
              <div className="flex items-center justify-between">
                <SectionTitle>Notes</SectionTitle>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                <Lock className="h-3 w-3" />
                Private to this workspace · never shared with the customer
              </div>
              <div className="mt-3">
                {customer.notes ? (
                  <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-foreground">
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-medium">
                      <StickyNote className="h-3 w-3" />
                      Internal note
                    </div>
                    <p className="leading-snug">{customer.notes}</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-surface-muted/40 px-3 py-4 text-center text-xs text-muted-foreground">
                    No notes yet.
                  </div>
                )}
              </div>
            </Card>
          </aside>

          {/* Main: metadata */}
          <div className="space-y-6">
            {/* Customer metadata */}
            <Card>
              <SectionTitle>Customer details</SectionTitle>
              <dl className="mt-3 divide-y divide-border text-sm">
                <MetaRow label="ID" value={customer.id} mono />
                <MetaRow label="Display name" value={customer.displayName} />
                <MetaRow
                  label="Status"
                  value={customer.status === "ACTIVE" ? "Active" : "Archived"}
                />
                <MetaRow label="Locale" value={customer.locale ?? "—"} />
                <MetaRow label="Created" value={new Date(customer.createdAt).toLocaleString()} />
                <MetaRow label="Updated" value={new Date(customer.updatedAt).toLocaleString()} />
              </dl>
            </Card>

            {/* Contact methods detail */}
            <Card>
              <div className="flex items-center justify-between">
                <SectionTitle>Contact methods</SectionTitle>
                <span className="text-[11px] text-muted-foreground">
                  {contactMethods.length} total
                </span>
              </div>
              {contactMethods.length === 0 ? (
                <EmptyInline text="No contact methods on file." />
              ) : (
                <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
                  {contactMethods.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 px-3 py-3">
                      <ContactMethodIcon type={m.type} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{m.value}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {contactMethodLabel(m.type)}
                          {m.label && ` · ${m.label}`}
                          {m.isPrimary && (
                            <span className="ml-2 rounded-sm bg-primary/10 px-1 text-[10px] font-medium text-foreground">
                              Primary
                            </span>
                          )}
                          {m.verified && (
                            <span className="ml-2 rounded-sm bg-success/10 px-1 text-[10px] font-medium text-foreground">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Linked conversations placeholder */}
            <Card>
              <div className="flex items-center justify-between">
                <SectionTitle>Linked conversations</SectionTitle>
              </div>
              <div className="mt-3 grid place-items-center rounded-lg border border-dashed border-border bg-surface-muted/40 px-6 py-8 text-center">
                <Clock className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-xs font-medium">Conversation history coming soon</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Customer-scoped conversation listing is planned for S0 inbox wiring.
                </p>
                <Link
                  to="/inbox"
                  className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-secondary"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Go to inbox
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ContactRow({ method }: { method: ContactMethod }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <ContactMethodIcon type={method.type} />
      <span className="truncate">{method.value}</span>
      <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
        {contactMethodLabel(method.type)}
      </span>
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-4 py-2">
      <dt className="w-28 shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd
        className={`min-w-0 truncate text-xs ${mono ? "font-mono text-[11px] text-muted-foreground" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-5 shadow-card">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}

function EmptyInline({ text }: { text: string }) {
  return (
    <div className="mt-3 rounded-lg border border-dashed border-border bg-surface-muted/40 px-4 py-6 text-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}
