import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingLayout, SummaryBlock } from "@/components/onboarding-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Crown } from "lucide-react";

export const Route = createFileRoute("/onboarding/workspace")({
  head: () => ({ meta: [{ title: "Create workspace — Onboarding" }] }),
  component: WorkspaceStep,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function WorkspaceStep() {
  const navigate = useNavigate();
  const [name, setName] = useState("Tehran Dental Clinic");
  const [slug, setSlug] = useState("tehran-dental-clinic");
  const [type, setType] = useState("Clinic");
  const [slugTouched, setSlugTouched] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugify(name) || "your-workspace";
  const canContinue = name.trim().length > 0 && effectiveSlug.length > 0;

  return (
    <OnboardingLayout
      current="workspace"
      title="Create your workspace"
      description="Set up the business workspace where your team will manage customer conversations."
      back={{ to: "/signup", label: "Back to signup" }}
      next={{
        onClick: () => navigate({ to: "/onboarding/profile" }),
        disabled: !canContinue,
      }}
      summary={
        <SummaryBlock
          title="Workspace preview"
          items={[
            { label: "Name", value: name || "—" },
            { label: "Slug", value: <code className="text-[12px]">{effectiveSlug}</code> },
            { label: "Type", value: type },
            { label: "Your role", value: "Owner" },
          ]}
        />
      }
    >
      <div className="space-y-1.5">
        <Label htmlFor="ws-name">Workspace name</Label>
        <Input
          id="ws-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="Tehran Dental Clinic"
          required
        />
        {name.trim().length === 0 && (
          <p className="text-[12px] text-destructive">Workspace name is required.</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ws-slug">Workspace slug</Label>
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] text-muted-foreground">aireception.app/</span>
          <Input
            id="ws-slug"
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="tehran-dental-clinic"
          />
        </div>
        <p className="flex items-center gap-1.5 text-[12px] text-success">
          <CheckCircle2 className="h-3.5 w-3.5" /> Mock check: slug is available
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ws-type">Business type</Label>
        <select
          id="ws-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {["Clinic", "Restaurant", "Salon", "Repair service", "Agency", "Other"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-[12.5px] text-foreground">
        <Crown className="h-4 w-4 text-warning" />
        You will be the workspace <span className="font-medium">Owner</span>.
      </div>
    </OnboardingLayout>
  );
}
