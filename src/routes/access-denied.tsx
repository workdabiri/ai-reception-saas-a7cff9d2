import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout, AuthCard } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeftRight, Mail, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/access-denied")({
  head: () => ({ meta: [{ title: "Access denied — AI Reception" }] }),
  component: AccessDeniedPage,
});

const REASONS = [
  "Your role doesn't include this action",
  "You were removed from the workspace",
  "Workspace access was revoked",
  "Cross-workspace access is blocked",
];

function AccessDeniedPage() {
  return (
    <AuthLayout showPreview={false}>
      <AuthCard
        title="Access denied"
        description="You do not have permission to access this workspace or action."
      >
        <div className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 text-destructive" />
          <div className="text-[13px] text-foreground">
            <p className="font-medium">Possible reasons</p>
            <ul className="mt-1.5 space-y-1 text-muted-foreground">
              {REASONS.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild>
            <Link to="/">
              <LayoutDashboard className="h-4 w-4" /> Return to Dashboard
            </Link>
          </Button>
          <Button variant="outline">
            <ArrowLeftRight className="h-4 w-4" /> Switch workspace
          </Button>
        </div>
        <Button variant="ghost" className="w-full">
          <Mail className="h-4 w-4" /> Contact workspace owner
        </Button>
      </AuthCard>
    </AuthLayout>
  );
}
