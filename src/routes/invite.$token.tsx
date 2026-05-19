import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, AuthCard, MockNotice } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, UserCircle2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type InviteState = "valid" | "expired" | "already_member" | "invalid";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({ meta: [{ title: "Workspace invitation — AI Reception" }] }),
  component: InvitePage,
});

const STATES: { id: InviteState; label: string }[] = [
  { id: "valid", label: "Valid" },
  { id: "expired", label: "Expired" },
  { id: "already_member", label: "Already member" },
  { id: "invalid", label: "Invalid" },
];

function InvitePage() {
  const { token } = Route.useParams();
  const [state, setState] = useState<InviteState>("valid");

  return (
    <AuthLayout>
      <AuthCard
        title="You've been invited"
        description="Join a workspace and start reviewing AI drafts with your team."
        footer={
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Already have an account?</span>
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        }
      >
        <div className="rounded-lg border border-border bg-surface-muted p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary-soft text-primary">
              <Building2 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium text-foreground">
                Tehran Dental Clinic
              </p>
              <p className="text-[12px] text-muted-foreground">
                Invited by Amelia Hart · Role: Operator
              </p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Token: <span className="font-mono">{token}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-md border border-border bg-surface p-1 text-[11.5px] sm:grid-cols-4">
          {STATES.map((s) => (
            <button
              key={s.id}
              onClick={() => setState(s.id)}
              className={cn(
                "rounded px-2 py-1.5 font-medium transition",
                state === s.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {state === "valid" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Your email</Label>
              <Input id="email" type="email" placeholder="you@clinic.com" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Accept invitation</Button>
              <Button variant="outline" className="flex-1">
                Decline
              </Button>
            </div>
          </div>
        )}

        {state === "expired" && (
          <StateBlock
            icon={<AlertTriangle className="h-4 w-4 text-warning" />}
            title="This invitation has expired"
            body="Ask Amelia Hart to send you a new invitation link."
          />
        )}

        {state === "already_member" && (
          <StateBlock
            icon={<CheckCircle2 className="h-4 w-4 text-success" />}
            title="You're already a member"
            body="Sign in to access Tehran Dental Clinic."
            action={
              <Button asChild className="w-full">
                <Link to="/login">Sign in</Link>
              </Button>
            }
          />
        )}

        {state === "invalid" && (
          <StateBlock
            icon={<XCircle className="h-4 w-4 text-destructive" />}
            title="Invalid invitation"
            body="This invite link is no longer valid. It may have been revoked."
          />
        )}

        <MockNotice>Prototype only — invitation states are mocked.</MockNotice>
      </AuthCard>
    </AuthLayout>
  );
}

function StateBlock({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <span className="mt-0.5">{icon}</span>
        <div className="text-[13px] text-foreground">
          <p className="font-medium">{title}</p>
          <p className="mt-0.5 text-muted-foreground">{body}</p>
        </div>
      </div>
      {action ?? (
        <Button asChild variant="outline" className="w-full">
          <Link to="/login">
            <UserCircle2 className="h-4 w-4" /> Back to sign in
          </Link>
        </Button>
      )}
    </div>
  );
}
