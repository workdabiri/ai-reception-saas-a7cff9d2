import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { WebChatWidget, Launcher, type WidgetState } from "@/components/web-chat-widget";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/widget-preview")({
  head: () => ({
    meta: [
      { title: "Widget Preview — AI Reception" },
      {
        name: "description",
        content: "Internal preview of the embeddable customer web chat widget.",
      },
    ],
  }),
  component: WidgetPreviewPage,
});

const STATES: { key: WidgetState | "launcher-closed"; label: string; note: string }[] = [
  {
    key: "launcher-closed",
    label: "Launcher closed",
    note: "Default floating launcher resting state.",
  },
  { key: "welcome", label: "Welcome", note: "First view — invites the customer to start." },
  { key: "form", label: "New conversation", note: "Customer details + first message." },
  { key: "validation", label: "Validation", note: "Required fields missing." },
  { key: "submitted", label: "Submitted", note: "Message added to business inbox." },
  { key: "active", label: "Active thread", note: "Customer + operator messages." },
  { key: "offline", label: "Offline", note: "Business is offline — customer leaves a message." },
  {
    key: "ai-unavailable",
    label: "AI unavailable",
    note: "Drafts unavailable; operator still replies manually.",
  },
  {
    key: "provider-unavailable",
    label: "Channel unavailable",
    note: "Provider channel not available right now.",
  },
  { key: "closed", label: "Closed", note: "Conversation closed; customer can start a new one." },
];

function WidgetPreviewPage() {
  const [selected, setSelected] = useState<(typeof STATES)[number]["key"]>("welcome");
  const current = STATES.find((s) => s.key === selected)!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              AI Reception
            </Link>
            <span className="text-xs text-muted-foreground">/ Widget preview</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/chat/$businessId"
              params={{ businessId: "tehran-dental-clinic" }}
              className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              Open customer page →
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Web Chat widget preview</h1>
          <p className="text-sm text-muted-foreground">
            Static mock preview of every customer-facing state. No backend, no realtime, no AI
            auto-reply.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr_280px]">
          {/* State selector */}
          <aside className="rounded-xl border border-border bg-card p-2">
            <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              States
            </div>
            <nav className="flex flex-col gap-0.5">
              {STATES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSelected(s.key)}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-left text-sm transition",
                    selected === s.key
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Preview canvas */}
          <div className="relative min-h-[640px] overflow-hidden rounded-xl border border-border bg-[color:var(--bg-app)] p-4 sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:24px_24px]"
            />
            <div className="relative flex min-h-[600px] items-center justify-center">
              {selected === "launcher-closed" ? (
                <div className="absolute bottom-4 right-4">
                  <Launcher businessName="Tehran Dental Clinic" />
                </div>
              ) : (
                <WebChatWidget
                  businessName="Tehran Dental Clinic"
                  state={selected as WidgetState}
                  variant="inline"
                />
              )}
            </div>
          </div>

          {/* Notes */}
          <aside className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Current state
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">{current.label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{current.note}</p>
            </div>
            <div className="border-t border-border pt-3">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Implementation notes
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>Static mock preview.</li>
                <li>No backend connected.</li>
                <li>No realtime.</li>
                <li>No AI auto-reply.</li>
                <li>Operator review required.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
