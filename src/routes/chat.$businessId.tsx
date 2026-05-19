import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { WebChatWidget, type WidgetState } from "@/components/web-chat-widget";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";

export const Route = createFileRoute("/chat/$businessId")({
  head: () => ({
    meta: [
      { title: "Chat — AI Reception" },
      {
        name: "description",
        content: "Customer-facing web chat surface. Prototype only — operators review every reply.",
      },
    ],
  }),
  component: ChatPage,
});

const BUSINESSES: Record<string, string> = {
  "tehran-dental-clinic": "Tehran Dental Clinic",
};

function ChatPage() {
  const { businessId } = Route.useParams();
  const businessName =
    BUSINESSES[businessId] ??
    businessId
      .split("-")
      .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

  const [state, setState] = useState<WidgetState>("welcome");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 lg:px-8">
          <Link
            to="/"
            className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            AI Reception
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          <section className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Pill variant="success">Mock Active</Pill>
                <span className="text-xs text-muted-foreground">
                  Web Chat · Online for mock demo
                </span>
              </div>
              <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">{businessName}</h1>
              <p className="text-sm text-muted-foreground">
                Send a message and the reception team will review it shortly. Operators review every
                reply — AI may help prepare drafts.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">Prototype only</div>
              <p className="mt-1">
                No message is actually sent. This page demonstrates where customer messages
                originate in the AI Reception workspace.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Preview state
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["welcome", "Welcome"],
                    ["form", "Form"],
                    ["validation", "Validation"],
                    ["submitted", "Submitted"],
                    ["active", "Active thread"],
                    ["offline", "Offline"],
                    ["ai-unavailable", "AI unavailable"],
                    ["provider-unavailable", "Channel unavailable"],
                    ["closed", "Closed"],
                  ] as [WidgetState, string][]
                ).map(([k, label]) => (
                  <Button
                    key={k}
                    size="sm"
                    variant={state === k ? "default" : "outline"}
                    onClick={() => setState(k)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <section className="lg:sticky lg:top-8">
            <WebChatWidget businessName={businessName} state={state} variant="inline" />
          </section>
        </div>
      </main>
    </div>
  );
}
