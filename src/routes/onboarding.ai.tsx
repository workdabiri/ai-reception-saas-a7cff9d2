import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingLayout, SummaryBlock } from "@/components/onboarding-layout";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/ai")({
  head: () => ({ meta: [{ title: "AI assistance — Onboarding" }] }),
  component: AiStep,
});

const TONES = ["Professional", "Friendly", "Concise", "Warm"] as const;
type Tone = (typeof TONES)[number];

function AiStep() {
  const [tone, setTone] = useState<Tone>("Friendly");
  const [lowConf, setLowConf] = useState(true);
  const [askContext, setAskContext] = useState(true);
  const [escalate, setEscalate] = useState(true);
  const [preferProfile, setPreferProfile] = useState(true);

  return (
    <OnboardingLayout
      current="ai"
      title="AI assistance setup"
      description="AI can prepare drafts, but operators always review and send replies."
      back={{ to: "/onboarding/team" }}
      next={{ to: "/onboarding/done" }}
      summary={
        <SummaryBlock
          title="AI mode"
          items={[
            { label: "Human review", value: "Required" },
            { label: "AI auto-send", value: "Disabled" },
            { label: "Draft tone", value: tone },
            { label: "Low-confidence", value: lowConf ? "Warn" : "Off" },
            { label: "Escalation", value: escalate ? "On" : "Off" },
          ]}
        />
      }
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 px-4 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-success" />
          <div className="text-[13px] text-foreground">
            <p className="font-medium">AI Draft — Human Review Required</p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              Operator sends final reply. AI does not auto-send in MVP.
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <FixedSetting
            icon={ShieldCheck}
            label="Human review required"
            value="Enabled"
            tone="success"
          />
          <FixedSetting icon={Lock} label="AI auto-send" value="Disabled" tone="muted" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Draft tone</Label>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-[12.5px]",
                tone === t
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Confidence handling</Label>
        <ToggleRow
          checked={lowConf}
          onChange={setLowConf}
          label="Show low-confidence warning on drafts"
        />
        <ToggleRow
          checked={askContext}
          onChange={setAskContext}
          label="Ask operator to review source / context"
        />
      </div>

      <div className="space-y-2">
        <Label>Escalation</Label>
        <ToggleRow
          checked={escalate}
          onChange={setEscalate}
          label="Escalate unclear or sensitive questions to operator"
        />
      </div>

      <div className="space-y-2">
        <Label>Source preference</Label>
        <ToggleRow
          checked={preferProfile}
          onChange={setPreferProfile}
          label="Prefer business profile and FAQ when drafting"
        />
      </div>

      <div className="flex items-start gap-2 rounded-md border border-ai/30 bg-ai/5 px-3 py-2 text-[12px] text-foreground">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 text-ai" />
        AI drafts only — operators always review before sending.
      </div>
    </OnboardingLayout>
  );
}

function FixedSetting({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  tone: "success" | "muted";
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2">
      <div className="flex items-center gap-2 text-[12.5px] text-foreground">
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            tone === "success" ? "text-success" : "text-muted-foreground",
          )}
        />
        {label}
      </div>
      <span
        className={cn(
          "text-[11.5px] font-medium",
          tone === "success" ? "text-success" : "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] text-foreground">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      {label}
    </label>
  );
}
