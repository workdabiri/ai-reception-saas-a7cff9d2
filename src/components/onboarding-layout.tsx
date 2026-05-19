import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Check } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ONBOARDING_STEPS = [
  { id: "workspace", label: "Workspace", path: "/onboarding/workspace" as const },
  { id: "profile", label: "Profile", path: "/onboarding/profile" as const },
  { id: "channel", label: "Channel", path: "/onboarding/channel" as const },
  { id: "team", label: "Team", path: "/onboarding/team" as const },
  { id: "ai", label: "AI", path: "/onboarding/ai" as const },
  { id: "done", label: "Done", path: "/onboarding/done" as const },
];

export type StepId = (typeof ONBOARDING_STEPS)[number]["id"];

export function OnboardingLayout({
  current,
  title,
  description,
  children,
  summary,
  back,
  next,
  skip,
  hideActions,
}: {
  current: StepId;
  title: string;
  description?: string;
  children: ReactNode;
  summary?: ReactNode;
  back?: { to: string; label?: string };
  next?: { to?: string; label?: string; onClick?: () => void; disabled?: boolean };
  skip?: { to: string; label?: string };
  hideActions?: boolean;
}) {
  const currentIdx = ONBOARDING_STEPS.findIndex((s) => s.id === current);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/login" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">AI Reception</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8">
        <Stepper currentIdx={currentIdx} />

        <div
          className={cn(
            "mt-6 grid gap-6",
            summary ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-10" : "",
          )}
        >
          <section className="mx-auto w-full max-w-[560px] lg:mx-0">
            <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-soft sm:p-8">
              <p className="text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">
                Step {currentIdx + 1} of {ONBOARDING_STEPS.length}
              </p>
              <h1 className="mt-1 text-[22px] font-medium leading-tight tracking-tight">{title}</h1>
              {description && (
                <p className="mt-2 text-[13.5px] leading-[1.55] text-muted-foreground">
                  {description}
                </p>
              )}
              <div className="mt-6 space-y-5">{children}</div>

              {!hideActions && (
                <div className="mt-7 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {back && (
                      <Button asChild variant="ghost" size="sm">
                        <Link to={back.to}>{back.label ?? "Back"}</Link>
                      </Button>
                    )}
                    {skip && (
                      <Button asChild variant="ghost" size="sm">
                        <Link to={skip.to}>{skip.label ?? "Skip for now"}</Link>
                      </Button>
                    )}
                  </div>
                  {next &&
                    (next.to ? (
                      <Button asChild disabled={next.disabled} className="sm:min-w-[160px]">
                        <Link to={next.to}>{next.label ?? "Continue"}</Link>
                      </Button>
                    ) : (
                      <Button
                        onClick={next.onClick}
                        disabled={next.disabled}
                        className="sm:min-w-[160px]"
                      >
                        {next.label ?? "Continue"}
                      </Button>
                    ))}
                </div>
              )}

              <p className="mt-5 rounded-md border border-border bg-surface-muted px-3 py-2 text-[11.5px] leading-snug text-muted-foreground">
                Prototype only — no real workspace, integrations, emails, or AI calls are made.
              </p>
            </div>
          </section>

          {summary && (
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                {summary}
              </div>
            </aside>
          )}
        </div>
      </main>

      <footer className="px-5 pb-8 text-center text-[12px] text-muted-foreground sm:px-8">
        Prototype · Mock data · First-run onboarding
      </footer>
    </div>
  );
}

function Stepper({ currentIdx }: { currentIdx: number }) {
  return (
    <ol className="flex w-full items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
      {ONBOARDING_STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                isDone && "border-success bg-success/15 text-foreground",
                !isCurrent && !isDone && "border-border bg-surface text-muted-foreground",
              )}
            >
              {isDone ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden truncate text-[12px] sm:inline",
                isCurrent ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
            {i < ONBOARDING_STEPS.length - 1 && (
              <span className={cn("h-px flex-1 bg-border", isDone && "bg-success/40")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function SummaryBlock({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <div>
      <p className="text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <dl className="mt-3 space-y-2.5 text-[13px]">
        {items.map((it) => (
          <div key={it.label} className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground">{it.label}</dt>
            <dd className="text-right font-medium text-foreground">{it.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
