import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ShieldCheck, Inbox as InboxIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthLayout({
  children,
  showPreview = true,
}: {
  children: ReactNode;
  showPreview?: boolean;
}) {
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

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-12 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
        <section className="mx-auto w-full max-w-[440px] lg:mx-0">{children}</section>

        {showPreview && (
          <aside className="hidden lg:block">
            <ProductPreviewPanel />
          </aside>
        )}
      </main>

      <footer className="px-5 pb-8 text-center text-[12px] text-muted-foreground sm:px-8">
        Prototype · Mock data · No real authentication
      </footer>
    </div>
  );
}

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-soft sm:p-8">
      <h1 className="text-[22px] font-medium leading-tight tracking-tight">{title}</h1>
      {description && (
        <p className="mt-2 text-[13.5px] leading-[1.55] text-muted-foreground">{description}</p>
      )}
      <div className="mt-6 space-y-4">{children}</div>
      {footer && <div className="mt-6 border-t border-border pt-5 text-[13px]">{footer}</div>}
    </div>
  );
}

export function MockNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-border bg-surface-muted px-3 py-2 text-[11.5px] leading-snug text-muted-foreground">
      {children}
    </p>
  );
}

function ProductPreviewPanel() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <span className="inline-flex h-5 items-center gap-1 rounded-full border border-border px-2 text-[10.5px] font-medium uppercase tracking-wide">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" />
          Mock data
        </span>
        <span className="text-foreground">Tehran Dental Clinic</span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <InboxIcon className="h-3.5 w-3.5" />
            <span>Inbox · 4 waiting</span>
          </div>
          <p className="mt-1.5 text-[13.5px] font-medium text-foreground">
            "Hi, do you have availability tomorrow morning for a cleaning?"
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">Sara M. · Web Chat · 2 min ago</p>
        </div>

        <div className="rounded-lg border border-ai/30 bg-ai/5 px-4 py-3">
          <div className="flex items-center gap-2 text-[12px] font-medium text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-ai" />
            AI draft · ready for review
          </div>
          <p className="mt-1.5 text-[13px] leading-snug text-foreground">
            "Hi Sara — we have 9:30 AM open tomorrow. Want me to book it?"
          </p>
          <div className="mt-3 flex gap-2">
            <span className="inline-flex h-7 items-center rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground">
              Send
            </span>
            <span className="inline-flex h-7 items-center rounded-md border border-border bg-surface px-3 text-[12px] font-medium text-foreground">
              Edit
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-md bg-surface-muted px-3 py-2.5 text-[12px] leading-snug text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
        <span>
          <span className="text-foreground">Human-first.</span> Operators review every AI draft
          before sending — no auto-replies.
        </span>
      </div>
    </div>
  );
}
