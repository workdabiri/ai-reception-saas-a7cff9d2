import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, MockBanner } from "@/components/ui-bits";
import { Pill } from "@/components/ui/pill";
import {
  ShieldCheck,
  Lock,
  Sparkles,
  AlertTriangle,
  Ban,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Pencil,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useStateParam,
  presets as statePresets,
  RouteStatePage,
  RouteSkeleton,
} from "@/components/route-state";

export const Route = createFileRoute("/settings/ai")({
  head: () => ({
    meta: [
      { title: "AI Assistance Settings — AI Reception" },
      {
        name: "description",
        content: "Control how AI prepares drafts. Operators always review and send final replies.",
      },
    ],
  }),
  component: AISettingsPage,
});

const TONES = ["Professional", "Friendly", "Concise", "Warm"] as const;
type Tone = (typeof TONES)[number];

function AISettingsPage() {
  const stateOverride = useStateParam();
  const [tone, setTone] = useState<Tone>("Friendly");
  const [lowConfWarn, setLowConfWarn] = useState(true);
  const [sourceReview, setSourceReview] = useState(true);
  const [escalateUnsure, setEscalateUnsure] = useState(true);

  if (stateOverride === "ai-unavailable") {
    return (
      <RouteStatePage title="AI Assistance Settings">{statePresets.aiUnavailable()}</RouteStatePage>
    );
  }
  if (stateOverride === "access-denied") {
    return (
      <RouteStatePage title="AI Assistance Settings">
        {statePresets.aiAccessDenied()}
      </RouteStatePage>
    );
  }
  if (stateOverride === "loading") {
    return (
      <RouteStatePage title="AI Assistance Settings" description="Loading…">
        <RouteSkeleton variant="settings" />
      </RouteStatePage>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
      <PageHeader
        title="AI Assistance Settings"
        description="Control how AI prepares drafts. Operators always review and send final replies."
      />
      <MockBanner />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] min-w-0">
        <div className="space-y-6 min-w-0">
          {/* A. Human Review Policy */}
          <Section
            icon={ShieldCheck}
            title="Human review policy"
            description="AI prepares drafts only. It does not send replies automatically in this MVP."
          >
            <div className="grid gap-2 sm:grid-cols-3">
              <PolicyRow
                icon={ShieldCheck}
                label="Human review required"
                value="Enabled"
                tone="success"
              />
              <PolicyRow icon={Lock} label="AI auto-send" value="Disabled" tone="muted" />
              <PolicyRow
                icon={CheckCircle2}
                label="Operator sends final reply"
                value="Enabled"
                tone="success"
              />
            </div>
            <Callout
              tone="primary"
              icon={Sparkles}
              title="AI Draft — Human Review Required"
              body="AI prepares drafts only. It does not send replies automatically in this MVP."
            />
          </Section>

          {/* B. Draft Tone */}
          <Section icon={Sparkles} title="Draft tone">
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
            <p className="mt-3 text-[12px] text-muted-foreground">
              Tone affects the wording of drafts. Operators may edit before sending.
            </p>
          </Section>

          {/* C. Confidence handling */}
          <Section icon={AlertTriangle} title="Confidence handling">
            <div className="space-y-2">
              <ToggleRow
                checked={lowConfWarn}
                onChange={setLowConfWarn}
                label="Show low-confidence warning on drafts"
              />
              <ToggleRow
                checked={sourceReview}
                onChange={setSourceReview}
                label="Require source / context review before sending"
              />
              <ToggleRow
                checked={escalateUnsure}
                onChange={setEscalateUnsure}
                label="Escalate uncertain answers to operator"
              />
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground">
              If AI is uncertain, the draft is marked for careful operator review.
            </p>
          </Section>

          {/* D. Escalation Rules */}
          <Section icon={ArrowUpRight} title="Escalation rules">
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                "Escalate medical, legal, or financial claims",
                "Escalate angry or upset customer messages",
                "Escalate refund and price disputes",
                "Escalate unclear appointment changes",
                "Escalate when no matching FAQ is found",
              ].map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[12.5px]"
                >
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 text-attention" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* E. Forbidden AI Behavior */}
          <Section icon={Ban} title="Forbidden AI behavior">
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                "Do not promise availability without operator confirmation",
                "Do not give medical advice",
                "Do not confirm payment or refund",
                "Do not claim provider integrations are live",
                "Do not send messages automatically",
              ].map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-2 rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2 text-[12.5px]"
                >
                  <Ban className="mt-0.5 h-3.5 w-3.5 text-destructive" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* F. AI Draft Preview */}
          <Section icon={Sparkles} title="AI draft preview">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Pill variant="ai" size="sm">
                  AI Draft — Human Review Required
                </Pill>
                <Pill variant="warn" size="sm">
                  Confidence: Medium
                </Pill>
                <Pill variant="muted" size="sm">
                  Source: Business profile + FAQ
                </Pill>
                <Pill variant="operator" size="sm">
                  Operator sends final reply
                </Pill>
              </div>

              <div className="space-y-3">
                <div className="rounded-md border border-border bg-card px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Customer
                  </div>
                  <p className="mt-1 text-[13px] text-foreground">
                    Can I reschedule my Thursday appointment?
                  </p>
                </div>
                <div className="rounded-md border border-ai/30 bg-ai/5 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-ai">AI draft</div>
                  <p className="mt-1 text-[13px] text-foreground">
                    Thanks for reaching out. I can help prepare this for the reception team. Please
                    confirm the preferred new time and an operator will review the request.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Review draft
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[12px] font-medium hover:bg-secondary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit example
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-secondary"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject example
                </button>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Mock only — no real AI. Drafts shown for illustration.
              </p>
            </div>
          </Section>
        </div>

        {/* Right summary panel */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft space-y-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Status & safety summary
            </div>
            <SummaryRow label="AI mode" value="Draft assist only" />
            <SummaryRow label="Auto-send" value="Disabled" tone="muted" />
            <SummaryRow label="Human review" value="Required" tone="success" />
            <SummaryRow label="Low confidence" value="Escalate" />
            <SummaryRow label="Sources" value="Business profile + Knowledge base" />
            <Link
              to="/knowledge"
              className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Manage knowledge base
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-medium">{title}</h2>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function PolicyRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
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
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] text-foreground">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition",
          checked ? "bg-primary" : "bg-border-strong",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "muted";
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-right font-medium",
          tone === "success"
            ? "text-success"
            : tone === "muted"
              ? "text-muted-foreground"
              : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Callout({
  tone,
  icon: Icon,
  title,
  body,
}: {
  tone: "info" | "warning" | "primary";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  const toneCls = {
    info: "callout--info",
    warning: "callout--warning",
    primary: "callout--primary",
  } as const;
  return (
    <div className={`callout ${toneCls[tone]}`}>
      <div className="callout-title">
        <Icon className="callout-icon" />
        {title}
      </div>
      <p className="callout-body">{body}</p>
    </div>
  );
}
