import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pill } from "@/components/ui/pill";
import { AdminPageHeader, AdminMockNotice, SectionCard } from "@/components/admin-bits";
import { adminFeatureFlags, type AdminFeatureFlag } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/feature-flags")({
  head: () => ({
    meta: [
      { title: "Feature Flags — Platform Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminFeatureFlagsPage,
});

function MockToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={[
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full ring-1 ring-inset transition",
        enabled ? "bg-success/30 ring-success/40" : "bg-secondary ring-border",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 rounded-full bg-background shadow-soft transition",
          enabled ? "translate-x-[18px]" : "translate-x-[2px]",
        ].join(" ")}
      />
    </button>
  );
}

function FlagRow({ flag }: { flag: AdminFeatureFlag }) {
  const [enabled, setEnabled] = useState(flag.enabled);
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-surface p-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-foreground">{flag.label}</span>
          <Pill variant="neutral" size="sm">
            {flag.scope}
          </Pill>
        </div>
        <p className="mt-1 text-[11.5px] text-muted-foreground">{flag.description}</p>
        <p className="mt-1 text-[10.5px] text-muted-foreground">
          Owner: {flag.owner} · last changed {flag.lastChanged} · affects {flag.affectedWorkspaces}{" "}
          workspaces
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
          {enabled ? "On" : "Off"}
        </span>
        <MockToggle enabled={enabled} onToggle={() => setEnabled((v) => !v)} />
      </div>
    </li>
  );
}

function AdminFeatureFlagsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 lg:px-8">
      <AdminPageHeader
        title="Feature Flags"
        description="Mock toggle — no production behavior changes."
      />
      <AdminMockNotice />

      <SectionCard title="Flags" description="Local UI state only. No backend or real rollout.">
        <ul className="space-y-2.5">
          {adminFeatureFlags.map((f) => (
            <FlagRow key={f.id} flag={f} />
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
