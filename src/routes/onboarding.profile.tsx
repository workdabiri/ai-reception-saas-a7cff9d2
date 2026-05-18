import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingLayout, SummaryBlock } from "@/components/onboarding-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/onboarding/profile")({
  head: () => ({ meta: [{ title: "Business profile — Onboarding" }] }),
  component: ProfileStep,
});

const DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

function ProfileStep() {
  const [displayName, setDisplayName] = useState("Tehran Dental Clinic");
  const [desc, setDesc] = useState(
    "Family dental practice — cleanings, fillings, cosmetic consults.",
  );
  const [locale, setLocale] = useState("Persian / English");
  const [tz, setTz] = useState("Asia/Tehran");
  const [open, setOpen] = useState("09:00");
  const [close, setClose] = useState("18:00");
  const [active, setActive] = useState<string[]>(["Sat", "Sun", "Mon", "Tue", "Wed"]);

  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <OnboardingLayout
      current="profile"
      title="Business profile"
      description="These details help operators and future AI drafts understand your business context."
      back={{ to: "/onboarding/workspace" }}
      next={{ to: "/onboarding/channel" }}
      summary={
        <SummaryBlock
          title="Profile preview"
          items={[
            { label: "Display name", value: displayName || "—" },
            { label: "Locale", value: locale },
            { label: "Timezone", value: tz },
            { label: "Hours", value: `${open}–${close}` },
            { label: "Days", value: active.length ? active.join(", ") : "—" },
          ]}
        />
      }
    >
      <div className="space-y-1.5">
        <Label htmlFor="p-name">Business display name</Label>
        <Input id="p-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="p-desc">Short business description</Label>
        <Textarea id="p-desc" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="p-locale">Locale</Label>
          <select
            id="p-locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className={selectClass}
          >
            <option>Persian / English</option>
            <option>English</option>
            <option>Persian</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-tz">Timezone</Label>
          <select
            id="p-tz"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className={selectClass}
          >
            <option>Asia/Tehran</option>
            <option>UTC</option>
            <option>Europe/London</option>
            <option>America/Los_Angeles</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Working hours</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="text-[12px] text-muted-foreground">Open</span>
            <Input type="time" value={open} onChange={(e) => setOpen(e.target.value)} />
          </div>
          <div className="space-y-1">
            <span className="text-[12px] text-muted-foreground">Close</span>
            <Input type="time" value={close} onChange={(e) => setClose(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {DAYS.map((d) => {
            const isOn = active.includes(d);
            return (
              <label
                key={d}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12.5px] ${
                  isOn
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-surface text-muted-foreground"
                }`}
              >
                <Checkbox
                  checked={isOn}
                  onCheckedChange={(c) =>
                    setActive((prev) => (c ? [...prev, d] : prev.filter((x) => x !== d)))
                  }
                />
                {d}
              </label>
            );
          })}
        </div>
      </div>
    </OnboardingLayout>
  );
}
