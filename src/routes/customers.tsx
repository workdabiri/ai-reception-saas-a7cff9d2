import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Avatar, PageHeader } from "@/components/ui-bits";
import { useBusinessId } from "@/contexts/business-context";
import { useCustomers } from "@/hooks/use-customers";
import type { Customer, CustomerStatus } from "@/lib/api-types";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import {
  Search,
  Shield,
  Users,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { CustomersOperatorFirstEmpty, FilterNoMatchState } from "@/components/empty-states";
import {
  useStateParam,
  presets as statePresets,
  RouteStatePage,
  RouteSkeleton,
  StateBanner,
} from "@/components/route-state";

// ---------------------------------------------------------------------------
// Route definition
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — AI Reception" },
      {
        name: "description",
        content: "Reception customer directory with contact and status context.",
      },
    ],
  }),
  component: CustomersPage,
});

// ---------------------------------------------------------------------------
// Status filter config (API CustomerStatus enum)
// ---------------------------------------------------------------------------

type StatusFilterValue = "all" | CustomerStatus;

const STATUS_FILTERS: { id: StatusFilterValue; label: string }[] = [
  { id: "all", label: "All statuses" },
  { id: "ACTIVE", label: "Active" },
  { id: "ARCHIVED", label: "Archived" },
];

const STATUS_TONE: Record<CustomerStatus, string> = {
  ACTIVE: "bg-success/10 text-foreground border-success/30",
  ARCHIVED: "bg-surface-muted text-muted-foreground border-border",
};

const STATUS_LABEL: Record<CustomerStatus, string> = {
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

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

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

function CustomersPage() {
  const stateOverride = useStateParam();
  const businessId = useBusinessId();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");

  // Pagination
  const [cursor, setCursor] = useState<string | undefined>();
  const [pages, setPages] = useState<Customer[]>([]);
  const lastKnownNextCursor = useRef<string | null>(null);

  const filters = useMemo(
    () => ({
      search: query.trim() || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      limit: 25,
      cursor,
    }),
    [query, statusFilter, cursor],
  );

  const { data, isLoading, isError, error, isFetching, refetch } = useCustomers(
    businessId,
    filters,
  );

  // Accumulate pages when data arrives — dedup guard prevents duplicate rows
  const dataItems = data?.data;
  useEffect(() => {
    if (!dataItems) return;

    if (!cursor) {
      // First page or filter reset — replace
      setPages(dataItems);
    } else {
      // Subsequent page — append with dedup guard
      setPages((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const nextItems = dataItems.filter((item) => !seen.has(item.id));
        return [...prev, ...nextItems];
      });
    }
  }, [dataItems, cursor]);

  // Track nextCursor so Load More button persists during fetch
  useEffect(() => {
    if (data?.nextCursor !== undefined) {
      lastKnownNextCursor.current = data.nextCursor;
    }
  }, [data?.nextCursor]);

  const handleStatusChange = useCallback((v: StatusFilterValue) => {
    setStatusFilter(v);
    setCursor(undefined);
    setPages([]);
    lastKnownNextCursor.current = null;
  }, []);

  const handleSearchChange = useCallback((q: string) => {
    setQuery(q);
    setCursor(undefined);
    setPages([]);
    lastKnownNextCursor.current = null;
  }, []);

  const handleLoadMore = useCallback(() => {
    const next = data?.nextCursor ?? lastKnownNextCursor.current;
    if (next) setCursor(next);
  }, [data?.nextCursor]);

  const handleReset = useCallback(() => {
    setQuery("");
    setStatusFilter("all");
    setCursor(undefined);
    setPages([]);
    lastKnownNextCursor.current = null;
  }, []);

  const isInitialLoading = isLoading && pages.length === 0;

  // ── State override support ──────────────────────────────────────────────
  if (stateOverride === "empty") {
    return (
      <RouteStatePage title="Customers" description="Reception directory.">
        {statePresets.customersEmpty()}
      </RouteStatePage>
    );
  }
  if (stateOverride === "access-denied") {
    return (
      <RouteStatePage title="Customers">{statePresets.customersAccessDenied()}</RouteStatePage>
    );
  }
  if (stateOverride === "loading") {
    return (
      <RouteStatePage title="Customers" description="Loading customers…">
        <RouteSkeleton variant="table" />
      </RouteStatePage>
    );
  }

  // ── No businessId ───────────────────────────────────────────────────────
  if (!businessId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8 space-y-6">
        <PageHeader
          title="Customers"
          description="Reception directory — who's reaching out and their contact details."
        />
        <StateBanner
          icon={AlertTriangle}
          tone="warning"
          title="No business configured"
          description="Set VITE_DEV_BUSINESS_ID in your .env file to connect to the backend API."
        />
      </div>
    );
  }

  // ── Loading state (initial) ─────────────────────────────────────────────
  if (isInitialLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8 space-y-6">
        <PageHeader
          title="Customers"
          description="Reception directory — who's reaching out and their contact details."
        />
        <LoadingSkeleton variant="table-rows" count={6} />
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (isError) {
    const apiErr = error as { isUnauthenticated?: boolean; isForbidden?: boolean } | undefined;

    if (apiErr?.isUnauthenticated) {
      return (
        <RouteStatePage title="Customers">{statePresets.profileSessionExpired()}</RouteStatePage>
      );
    }
    if (apiErr?.isForbidden) {
      return (
        <RouteStatePage title="Customers">{statePresets.customersAccessDenied()}</RouteStatePage>
      );
    }

    return (
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8 space-y-6">
        <PageHeader
          title="Customers"
          description="Reception directory — who's reaching out and their contact details."
        />
        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="mx-auto flex w-full max-w-[360px] flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h3 className="mb-1.5 text-[16px] font-medium leading-tight text-foreground">
              Could not load customers
            </h3>
            <p className="mb-5 text-[13px] leading-[1.5] text-muted-foreground">
              Something went wrong while fetching the customer list. Please try again.
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
  const customers = pages.length > 0 ? pages : (data?.data ?? []);
  const showLoadMore =
    data?.nextCursor ?? (isFetching && cursor ? lastKnownNextCursor.current : null);
  const isEmpty = customers.length === 0;
  const hasActiveFilter = query.trim() !== "" || statusFilter !== "all";
  const isFilterEmpty = isEmpty && hasActiveFilter;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <PageHeader
          title="Customers"
          description="Reception directory — who's reaching out and their contact details."
        />

        {/* Summary card */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard label="Customers" value={customers.length} accent="var(--color-primary)" />
          <SummaryCard
            label="Active"
            value={customers.filter((c) => c.status === "ACTIVE").length}
            accent="var(--color-success)"
          />
          <SummaryCard
            label="Archived"
            value={customers.filter((c) => c.status === "ARCHIVED").length}
            accent="var(--color-muted-foreground)"
          />
        </div>

        <div className="workspace-scoped-callout mt-4 flex items-start gap-2 px-4 py-3">
          <Shield className="mt-[2px] h-4 w-4 shrink-0 text-warning" />
          <div>
            <div className="workspace-scoped-callout-title">Workspace-scoped data</div>
            <div className="workspace-scoped-callout-body">
              Visible only to permitted members of this workspace. Server verifies membership on
              every tenant-scoped request.
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-border bg-card shadow-card overflow-hidden">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name…"
                  className="h-9 w-full rounded-lg border border-input bg-surface pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <FilterSelect
                value={statusFilter}
                onChange={(v) => handleStatusChange(v as StatusFilterValue)}
                options={STATUS_FILTERS.map((f) => ({ value: f.id, label: f.label }))}
              />
            </div>
            <div className="text-xs text-muted-foreground">{customers.length} customers</div>
          </div>

          {isEmpty ? (
            isFilterEmpty ? (
              <FilterNoMatchState label="customers" onReset={handleReset} />
            ) : (
              <CustomersOperatorFirstEmpty />
            )
          ) : (
            <>
              {/* Desktop / tablet table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-muted text-left">
                    <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium">Notes</th>
                      <th className="px-4 py-3 font-medium text-right">Created</th>
                      <th className="w-8 px-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customers.map((c) => (
                      <CustomerRow key={c.id} customer={c} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <ul className="md:hidden divide-y divide-border">
                {customers.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/customers/$customerId"
                      params={{ customerId: c.id }}
                      className="flex items-start gap-3 px-4 py-4 hover:bg-surface-muted/60"
                    >
                      <Avatar initials={initials(c.displayName)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">{c.displayName}</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {formatRelativeTime(c.createdAt)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusChip status={c.status} />
                          {c.notes && (
                            <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                              {c.notes}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Load more pagination */}
        {showLoadMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleLoadMore}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {isFetching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Users className="h-3.5 w-3.5" />
              )}
              Load more customers
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Customer table row (desktop)
// ---------------------------------------------------------------------------

function CustomerRow({ customer: c }: { customer: Customer }) {
  return (
    <tr className="group hover:bg-surface-muted/60">
      <td className="px-4 py-3">
        <Link
          to="/customers/$customerId"
          params={{ customerId: c.id }}
          className="flex items-center gap-3"
        >
          <Avatar initials={initials(c.displayName)} />
          <div className="min-w-0">
            <div className="font-medium group-hover:underline">{c.displayName}</div>
            {c.locale && <div className="truncate text-xs text-muted-foreground">{c.locale}</div>}
          </div>
        </Link>
      </td>
      <td className="px-3 py-3">
        <StatusChip status={c.status} />
      </td>
      <td className="px-3 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
        {c.notes ?? <span className="italic">—</span>}
      </td>
      <td className="px-4 py-3 text-right text-xs text-muted-foreground">
        {formatRelativeTime(c.createdAt)}
      </td>
      <td className="px-2 text-muted-foreground">
        <Link
          to="/customers/$customerId"
          params={{ customerId: c.id }}
          className="grid h-7 w-7 place-items-center rounded-md hover:bg-secondary"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function StatusChip({ status }: { status: CustomerStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium ${STATUS_TONE[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABEL[status]}
    </span>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      style={{ ["--kpi-accent" as never]: accent }}
      className="kpi-accent relative overflow-hidden rounded-xl bg-surface px-6 py-5 shadow-card dark:shadow-none"
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
        {label}
      </div>
      <div
        className="mt-3 text-[32px] font-medium leading-none tabular-nums tracking-tight text-foreground"
        style={{ fontFeatureSettings: '"tnum" 1' }}
      >
        {value}
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-input bg-surface px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring/40"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
