import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, MockBanner } from "@/components/ui-bits";
import { Pill } from "@/components/ui/pill";
import {
  BookOpen,
  ListChecks,
  Briefcase,
  Clock,
  Sparkles,
  AlertTriangle,
  Plus,
  Pencil,
  Archive,
  CheckCircle2,
  X,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Base — AI Reception" },
      {
        name: "description",
        content:
          "Organize business information that helps operators and future AI drafts prepare accurate replies.",
      },
    ],
  }),
  component: KnowledgePage,
});

const STATS = [
  { label: "FAQ items", value: "8", icon: ListChecks },
  { label: "Business policies", value: "4", icon: ShieldCheck },
  { label: "Services", value: "6", icon: Briefcase },
  { label: "Opening hours", value: "Complete", icon: Clock },
  { label: "Draft source readiness", value: "Partial", icon: Sparkles },
];

const FAQS = [
  {
    q: "What are your working hours?",
    cat: "Hours",
    status: "Active",
    updated: "2d ago",
  },
  {
    q: "How can I reschedule an appointment?",
    cat: "Appointments",
    status: "Active",
    updated: "5d ago",
  },
  {
    q: "Do you accept emergency appointments?",
    cat: "Appointments",
    status: "Active",
    updated: "1w ago",
  },
  {
    q: "What should customers bring to the first visit?",
    cat: "Onboarding",
    status: "Active",
    updated: "1w ago",
  },
  {
    q: "How do customers cancel?",
    cat: "Appointments",
    status: "Draft",
    updated: "3d ago",
  },
  {
    q: "Where is the clinic located?",
    cat: "General",
    status: "Active",
    updated: "2w ago",
  },
];

const RULES = [
  "Always ask operator before confirming appointment changes",
  "Never provide medical diagnosis",
  "Ask for preferred time slots before rescheduling",
  "Mention that final confirmation comes from the reception team",
  "Escalate billing questions to admin",
];

const SERVICES = [
  { name: "Dental consultation", desc: "Initial assessment and treatment plan.", status: "Active", note: "Bookable" },
  { name: "Cleaning", desc: "Routine hygiene cleaning.", status: "Active", note: "30–45 min" },
  { name: "Whitening", desc: "In-clinic whitening treatment.", status: "Active", note: "Requires consultation" },
  { name: "Orthodontic consultation", desc: "Braces and aligner evaluation.", status: "Active", note: "Specialist visit" },
  { name: "Emergency dental visit", desc: "Urgent care for pain or injury.", status: "Active", note: "Same-day where possible" },
  { name: "Follow-up appointment", desc: "Post-treatment checkup.", status: "Draft", note: "Notes incomplete" },
];

const HOURS = [
  { day: "Saturday – Wednesday", time: "09:00 – 18:00" },
  { day: "Thursday", time: "09:00 – 14:00" },
  { day: "Friday", time: "Closed" },
];

const READINESS = [
  { label: "Business profile configured", done: true },
  { label: "Working hours configured", done: true },
  { label: "FAQ partially complete", done: false },
  { label: "Services partially complete", done: false },
  { label: "Escalation rules configured", done: true },
  { label: "Tone configured", done: true },
];

function KnowledgePage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
      <PageHeader
        title="Knowledge Base"
        description="Organize business information that helps operators and future AI drafts prepare accurate replies."
        action={
          <Link
            to="/settings/ai"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] font-medium hover:bg-secondary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Assistance Settings
          </Link>
        }
      />
      <MockBanner />

      {/* A. Overview */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
              <div className="mt-2 text-lg font-medium text-foreground">{s.value}</div>
            </div>
          );
        })}
      </section>

      {/* Missing knowledge warning */}
      <div className="callout callout--warning flex items-start gap-3">
        <AlertTriangle className="callout-icon mt-0.5 shrink-0" />
        <div className="callout-body">
          <span className="callout-title" style={{ marginBottom: 0, display: "inline" }}>
            Some knowledge is incomplete.
          </span>{" "}
          Some questions may require operator review because the knowledge base is incomplete.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] min-w-0">
        <div className="space-y-6 min-w-0">
          {/* B. FAQ Library */}
          <Section
            icon={ListChecks}
            title="FAQ library"
            description="Questions and answers operators and AI drafts can reference."
            action={
              <button
                type="button"
                onClick={() => setAddOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Add FAQ
              </button>
            }
          >
            {addOpen && <AddFaqPanel onClose={() => setAddOpen(false)} />}

            <div className="overflow-hidden rounded-lg border border-border">
              <div className="hidden sm:grid grid-cols-[1fr_120px_90px_90px_120px] gap-3 border-b border-border bg-surface-muted px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <div>Question</div>
                <div>Category</div>
                <div>Status</div>
                <div>Source</div>
                <div className="text-right">Updated</div>
              </div>
              <ul className="divide-y divide-border">
                {FAQS.map((f) => (
                  <li
                    key={f.q}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_120px_90px_90px_120px] gap-2 sm:gap-3 px-3 py-3 text-[12.5px]"
                  >
                    <div className="font-medium text-foreground">{f.q}</div>
                    <div className="text-muted-foreground">
                      <span className="sm:hidden text-[10px] uppercase tracking-wider mr-1">
                        Category:
                      </span>
                      {f.cat}
                    </div>
                    <div>
                      <Pill
                        variant={f.status === "Active" ? "success" : "muted"}
                        size="sm"
                      >
                        {f.status}
                      </Pill>
                    </div>
                    <div className="text-muted-foreground">Manual</div>
                    <div className="text-muted-foreground sm:text-right">
                      <span className="sm:hidden text-[10px] uppercase tracking-wider mr-1">
                        Updated:
                      </span>
                      {f.updated}
                      <div className="mt-1 inline-flex gap-1 sm:flex sm:justify-end">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Archive className="h-3 w-3" />
                          Archive
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* C. Business Rules */}
          <Section
            icon={ShieldCheck}
            title="Business rules"
            description="Rules AI drafts and operators must follow when preparing replies."
          >
            <ul className="grid gap-2">
              {RULES.map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[12.5px]"
                >
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* D. Services */}
          <Section icon={Briefcase} title="Services">
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <div
                  key={s.name}
                  className="rounded-lg border border-border bg-surface p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[13px] font-medium">{s.name}</div>
                    <Pill
                      variant={s.status === "Active" ? "success" : "muted"}
                      size="sm"
                    >
                      {s.status}
                    </Pill>
                  </div>
                  <p className="mt-1 text-[12px] text-muted-foreground">{s.desc}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{s.note}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* E. Opening Hours */}
          <Section icon={Clock} title="Opening hours">
            <div className="overflow-hidden rounded-lg border border-border">
              <ul className="divide-y divide-border">
                {HOURS.map((h) => (
                  <li
                    key={h.day}
                    className="flex items-center justify-between px-3 py-2 text-[12.5px]"
                  >
                    <span className="text-foreground">{h.day}</span>
                    <span
                      className={cn(
                        "font-medium",
                        h.time === "Closed" ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {h.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-2 text-[11.5px] text-muted-foreground">
              Timezone: Asia/Tehran
            </p>
          </Section>
        </div>

        {/* F. Source Readiness side panel */}
        <aside className="lg:sticky lg:top-6 lg:self-start space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Source readiness
            </div>
            <ul className="space-y-2">
              {READINESS.map((r) => (
                <li
                  key={r.label}
                  className="flex items-start gap-2 text-[12.5px] text-foreground"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-4 w-4 place-items-center rounded-full",
                      r.done
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {r.done ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span className={r.done ? "" : "text-muted-foreground"}>{r.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              How AI uses knowledge
            </div>
            <p className="text-[12.5px] text-muted-foreground">
              AI drafts reference your business profile and knowledge base. Operators
              always review and send the final reply.
            </p>
            <Link
              to="/settings/ai"
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
            >
              Configure AI assistance
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
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-medium">{title}</h2>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function AddFaqPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[13px] font-medium">Add FAQ</div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid gap-3">
        <div className="grid gap-1">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Question
          </label>
          <input
            className="h-9 rounded-md border border-input bg-surface px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/40"
            placeholder="e.g. Do you accept walk-ins?"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Answer
          </label>
          <textarea
            rows={3}
            className="resize-none rounded-md border border-input bg-surface px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/40"
            placeholder="Draft a helpful answer operators can rely on."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Category
            </label>
            <select className="h-9 rounded-md border border-input bg-surface px-3 text-[13px]">
              <option>Appointments</option>
              <option>Hours</option>
              <option>Onboarding</option>
              <option>General</option>
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </label>
            <select className="h-9 rounded-md border border-input bg-surface px-3 text-[13px]">
              <option>Active</option>
              <option>Draft</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Save FAQ
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Mock only — changes are not persisted in this prototype.
        </p>
      </div>
    </div>
  );
}
