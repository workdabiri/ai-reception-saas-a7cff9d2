import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, ExternalLink } from "lucide-react";
import {
  AdminPageHeader,
  AdminMockNotice,
  SectionCard,
  SupportPriorityPill,
  SupportStatusPill,
  DisabledMockButton,
} from "@/components/admin-bits";
import { adminSupportItems } from "@/lib/admin-mock-data";
import { useStateParam, RouteSkeleton } from "@/components/route-state";
import { EmptyState } from "@/components/empty-states";

export const Route = createFileRoute("/admin/support")({
  head: () => ({
    meta: [{ title: "Support — Platform Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminSupportPage,
});

const FILTERS = ["All", "Open", "Waiting", "Resolved", "High priority"] as const;
type Filter = (typeof FILTERS)[number];

function AdminSupportPage() {
  const stateOverride = useStateParam();
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedId, setSelectedId] = useState<string>(adminSupportItems[0]?.id ?? "");

  const items = useMemo(() => {
    let r = adminSupportItems;
    if (filter === "Open") r = r.filter((s) => s.status === "open");
    else if (filter === "Waiting") r = r.filter((s) => s.status === "waiting");
    else if (filter === "Resolved") r = r.filter((s) => s.status === "resolved");
    else if (filter === "High priority")
      r = r.filter((s) => s.priority === "high" || s.priority === "urgent");
    return r;
  }, [filter]);

  const selected = adminSupportItems.find((s) => s.id === selectedId) ?? items[0];

  if (stateOverride === "loading") {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
        <AdminPageHeader title="Support" />
        <AdminMockNotice />
        <RouteSkeleton variant="list" />
      </div>
    );
  }
  if (stateOverride === "empty") {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
        <AdminPageHeader title="Support" />
        <AdminMockNotice />
        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <EmptyState
            icon={LifeBuoy}
            title="No support items"
            description="The mock support queue is empty."
            badge="Empty state"
            tone="neutral"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <AdminPageHeader
        title="Support"
        description="Internal mock support queue. No real support system or email."
      />
      <AdminMockNotice />

      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              "h-8 rounded-full px-3 text-[11.5px] font-medium ring-1 ring-inset transition",
              filter === f
                ? "bg-foreground text-background ring-foreground"
                : "bg-surface text-foreground ring-border hover:bg-secondary",
            ].join(" ")}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SectionCard title={`${items.length} items`}>
            <ul className="space-y-2">
              {items.map((s) => {
                const isSel = selected?.id === s.id;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      className={[
                        "w-full rounded-lg border p-3 text-left transition",
                        isSel
                          ? "border-primary/40 bg-primary-soft"
                          : "border-border bg-surface hover:bg-secondary",
                      ].join(" ")}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[12.5px] font-medium text-foreground truncate">
                          {s.business}
                        </span>
                        <SupportPriorityPill priority={s.priority} />
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{s.category}</div>
                      <div className="mt-1 flex items-center gap-2 text-[10.5px] text-muted-foreground">
                        <SupportStatusPill status={s.status} />
                        <span>· {s.createdAt}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <SectionCard
              title={selected.business}
              description={`${selected.category} · ${selected.requester}`}
              action={
                <div className="flex items-center gap-1.5">
                  <SupportPriorityPill priority={selected.priority} />
                  <SupportStatusPill status={selected.status} />
                </div>
              }
            >
              <p className="text-[12.5px] text-foreground">{selected.summary}</p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11.5px] text-muted-foreground">
                <span>
                  Owner: <span className="text-foreground">{selected.owner}</span>
                </span>
                <span>Created: {selected.createdAt}</span>
                <Link
                  to="/admin/businesses/$businessId"
                  params={{ businessId: selected.businessId }}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Open workspace <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="mt-5">
                <h3 className="text-[12px] font-medium text-foreground">Timeline</h3>
                <ul className="mt-2 space-y-2">
                  {selected.timeline.map((t, i) => (
                    <li
                      key={i}
                      className="rounded-md border border-border bg-surface px-3 py-2 text-[11.5px]"
                    >
                      <div className="font-medium text-foreground">
                        {t.actor}{" "}
                        <span className="text-muted-foreground font-normal">· {t.at}</span>
                      </div>
                      <div className="text-muted-foreground">{t.note}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <label className="text-[12px] font-medium text-foreground">Internal note</label>
                <textarea
                  disabled
                  placeholder="Mock internal note — input disabled in prototype."
                  className="mt-1.5 h-24 w-full cursor-not-allowed resize-none rounded-md border border-border bg-surface px-3 py-2 text-[12px] text-muted-foreground"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <DisabledMockButton>Add note</DisabledMockButton>
                  <DisabledMockButton hint="Mock only">Send reply</DisabledMockButton>
                </div>
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
