import { useState, type ReactNode } from "react";
import { MessageCircle, X, Send, Check, CloudOff, Sparkles, Ban, Lock, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

export type WidgetState =
  | "welcome"
  | "form"
  | "submitted"
  | "active"
  | "offline"
  | "ai-unavailable"
  | "provider-unavailable"
  | "closed"
  | "validation";

export type WebChatWidgetProps = {
  businessName?: string;
  businessInitial?: string;
  state?: WidgetState;
  /** Force widget open. When omitted, internal launcher state is used. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Render as floating launcher (fixed bottom-right) vs inline panel. */
  variant?: "floating" | "inline";
  className?: string;
};

const DEFAULT_BUSINESS = "Tehran Dental Clinic";

export function WebChatWidget({
  businessName = DEFAULT_BUSINESS,
  businessInitial,
  state = "welcome",
  open: openProp,
  onOpenChange,
  variant = "inline",
  className,
}: WebChatWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(variant === "inline");
  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };

  const initial = businessInitial ?? (businessName.trim().charAt(0).toUpperCase() || "B");
  const isOffline = state === "offline";
  const isProviderDown = state === "provider-unavailable";

  if (variant === "floating") {
    return (
      <div className={cn("pointer-events-none fixed inset-0 z-40", className)}>
        {open ? (
          <div className="pointer-events-auto absolute bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[380px]">
            <ChatWindow
              businessName={businessName}
              initial={initial}
              state={state}
              onClose={() => setOpen(false)}
              floating
            />
          </div>
        ) : (
          <div className="pointer-events-auto absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
            <Launcher
              businessName={businessName}
              disabled={isProviderDown}
              offline={isOffline}
              onClick={() => setOpen(true)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex w-full justify-center", className)}>
      <div className="w-full max-w-[420px]">
        <ChatWindow
          businessName={businessName}
          initial={initial}
          state={state}
          onClose={() => setOpen(false)}
        />
      </div>
    </div>
  );
}

/* ---------------- Launcher ---------------- */

export function Launcher({
  businessName,
  onClick,
  disabled,
  offline,
  showLabel = true,
}: {
  businessName?: string;
  onClick?: () => void;
  disabled?: boolean;
  offline?: boolean;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={disabled ? "Chat unavailable" : `Open chat with ${businessName ?? "business"}`}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-card transition hover:bg-primary/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled && "cursor-not-allowed bg-muted text-muted-foreground shadow-soft hover:bg-muted",
      )}
    >
      <span className="relative grid h-6 w-6 place-items-center rounded-full bg-primary-foreground/15">
        <MessageCircle className="h-3.5 w-3.5" />
        {!disabled && (
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-primary",
              offline ? "bg-muted-foreground" : "bg-success",
            )}
          />
        )}
      </span>
      {showLabel && <span className="pr-1">{disabled ? "Chat unavailable" : "Chat with us"}</span>}
    </button>
  );
}

/* ---------------- Chat window ---------------- */

function ChatWindow({
  businessName,
  initial,
  state,
  onClose,
  floating,
}: {
  businessName: string;
  initial: string;
  state: WidgetState;
  onClose: () => void;
  floating?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-card",
        floating ? "h-[min(560px,calc(100vh-2rem))]" : "h-[600px] max-h-[80vh]",
      )}
    >
      <Header
        businessName={businessName}
        initial={initial}
        state={state}
        onClose={onClose}
        floating={floating}
      />
      <div className="flex-1 overflow-y-auto bg-background/40 px-4 py-4">
        <Body state={state} businessName={businessName} initial={initial} />
      </div>
      <Footer />
    </div>
  );
}

function Header({
  businessName,
  initial,
  state,
  onClose,
  floating,
}: {
  businessName: string;
  initial: string;
  state: WidgetState;
  onClose: () => void;
  floating?: boolean;
}) {
  const statusLabel =
    state === "offline"
      ? "Offline · Leave a message"
      : state === "provider-unavailable"
        ? "Channel unavailable"
        : state === "closed"
          ? "Conversation closed"
          : "Web Chat · Mock Active";

  return (
    <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/12 text-sm font-medium text-foreground ring-1 ring-primary/30">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{businessName}</div>
        <div className="truncate text-[11px] text-muted-foreground">{statusLabel}</div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={floating ? "Minimize chat" : "Close chat"}
        className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        {floating ? <Minus className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ---------------- Body per state ---------------- */

function Body({
  state,
  businessName,
  initial,
}: {
  state: WidgetState;
  businessName: string;
  initial: string;
}) {
  switch (state) {
    case "welcome":
      return <WelcomeBody businessName={businessName} />;
    case "form":
    case "validation":
      return <FormBody validation={state === "validation"} />;
    case "submitted":
      return <SubmittedBody />;
    case "active":
      return <ActiveThreadBody initial={initial} />;
    case "offline":
      return <OfflineBody />;
    case "ai-unavailable":
      return <AiUnavailableBody />;
    case "provider-unavailable":
      return <ProviderUnavailableBody />;
    case "closed":
      return <ClosedBody />;
    default:
      return null;
  }
}

function NoteCard({
  icon,
  tone = "neutral",
  title,
  children,
}: {
  icon: ReactNode;
  tone?: "neutral" | "info" | "warning" | "muted";
  title: string;
  children?: ReactNode;
}) {
  const toneCls = {
    neutral: "bg-surface border-border",
    info: "bg-info/8 border-info/25",
    warning: "bg-warning/10 border-warning/25",
    muted: "bg-secondary border-border",
  }[tone];
  return (
    <div className={cn("rounded-xl border p-4", toneCls)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">{icon}</div>
        <div className="min-w-0 space-y-1.5">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {children && (
            <div className="text-xs leading-relaxed text-muted-foreground">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function HumanFirstNotes({ withAi = true }: { withAi?: boolean }) {
  return (
    <div className="space-y-2 rounded-lg bg-secondary/60 p-3 text-[11px] text-muted-foreground">
      <p>Operators review every reply.</p>
      {withAi && <p>AI may prepare drafts, but the business sends final replies.</p>}
    </div>
  );
}

function WelcomeBody({ businessName }: { businessName: string }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Pill variant="success">Mock Active</Pill>
        <h2 className="text-lg font-medium tracking-tight text-foreground">
          Hi, how can we help you today?
        </h2>
        <p className="text-sm text-muted-foreground">
          Send {businessName} a message and a member of the reception team will review it shortly.
        </p>
      </div>
      <FormBody />
    </div>
  );
}

function FormBody({ validation }: { validation?: boolean }) {
  return (
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="cust-name">Name</Label>
        <Input id="cust-name" placeholder="Sara Mohammadi" defaultValue="" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cust-contact">Email or phone</Label>
        <Input
          id="cust-contact"
          placeholder="sara@example.com"
          defaultValue=""
          aria-invalid={validation || undefined}
        />
        {validation && (
          <p className="text-[11px] text-destructive">
            Please add an email or phone so the business can reply.
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cust-message">Message</Label>
        <Textarea
          id="cust-message"
          rows={4}
          placeholder="Hi, I'd like to reschedule my Thursday appointment."
          aria-invalid={validation || undefined}
        />
        {validation && (
          <p className="text-[11px] text-destructive">
            Please write a short message before sending.
          </p>
        )}
      </div>
      <Button type="submit" className="w-full">
        <Send className="h-4 w-4" /> Send message
      </Button>
      <p className="text-[11px] text-muted-foreground">
        Prototype only — no message is actually sent.
      </p>
      <HumanFirstNotes />
    </form>
  );
}

function SubmittedBody() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-success/25 bg-success/8 p-5 text-center">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-success/15 text-success">
          <Check className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-medium text-foreground">Message received</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Your message was added to the business inbox. An operator will review it.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="flex-1">Send another message</Button>
        <Button variant="outline" className="flex-1">
          Close conversation
        </Button>
      </div>
      <HumanFirstNotes />
    </div>
  );
}

function ActiveThreadBody({ initial }: { initial: string }) {
  return (
    <div className="space-y-3">
      {/* customer */}
      <Bubble side="right">Hi, I'd like to reschedule my Thursday appointment.</Bubble>
      <SystemEvent>Message added to Tehran Dental Clinic inbox</SystemEvent>
      <Bubble side="left" initial={initial} author="Reception team">
        Thanks — our receptionist will review this shortly.
      </Bubble>
      <HumanFirstNotes />
    </div>
  );
}

function Bubble({
  side,
  children,
  initial,
  author,
}: {
  side: "left" | "right";
  children: ReactNode;
  initial?: string;
  author?: string;
}) {
  const isLeft = side === "left";
  return (
    <div className={cn("flex items-end gap-2", isLeft ? "justify-start" : "justify-end")}>
      {isLeft && (
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/12 text-[11px] font-medium text-primary">
          {initial}
        </div>
      )}
      <div className={cn("max-w-[80%] space-y-1", !isLeft && "items-end")}>
        {isLeft && author && (
          <div className="px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            {author}
          </div>
        )}
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm shadow-soft",
            isLeft
              ? "rounded-bl-sm bg-surface text-foreground"
              : "rounded-br-sm bg-primary text-primary-foreground",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SystemEvent({ children }: { children: ReactNode }) {
  return (
    <div className="my-1 flex items-center gap-2 text-[11px] text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      <span>{children}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function OfflineBody() {
  return (
    <div className="space-y-4">
      <NoteCard
        tone="warning"
        icon={<CloudOff className="h-4 w-4" />}
        title="The business is currently offline"
      >
        Leave a message and the reception team will respond when they're back.
      </NoteCard>
      <FormBody />
    </div>
  );
}

function AiUnavailableBody() {
  return (
    <div className="space-y-4">
      <NoteCard
        tone="info"
        icon={<Sparkles className="h-4 w-4" />}
        title="AI assistance is unavailable"
      >
        The operator can still review your message and reply manually.
      </NoteCard>
      <FormBody />
    </div>
  );
}

function ProviderUnavailableBody() {
  return (
    <div className="space-y-4">
      <NoteCard
        tone="muted"
        icon={<Ban className="h-4 w-4" />}
        title="This channel is not available right now"
      >
        Please try again later or reach the business through another channel.
      </NoteCard>
    </div>
  );
}

function ClosedBody() {
  return (
    <div className="space-y-4">
      <NoteCard
        tone="neutral"
        icon={<Lock className="h-4 w-4" />}
        title="This conversation is closed"
      >
        You can start a new conversation any time.
      </NoteCard>
      <Button className="w-full">Start a new conversation</Button>
    </div>
  );
}

function Footer() {
  return (
    <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-2 text-[10px] text-muted-foreground">
      <span>Powered by AI Reception</span>
      <span>Prototype only</span>
    </div>
  );
}
