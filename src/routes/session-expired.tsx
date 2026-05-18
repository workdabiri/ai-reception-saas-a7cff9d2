import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout, AuthCard } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/session-expired")({
  head: () => ({ meta: [{ title: "Session expired — AI Reception" }] }),
  component: SessionExpiredPage,
});

function SessionExpiredPage() {
  return (
    <AuthLayout showPreview={false}>
      <AuthCard
        title="Session expired"
        description="Your session has expired. Please sign in again to continue."
      >
        <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-muted px-4 py-3">
          <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <p className="text-[13px] text-foreground">
            For your security, we sign you out after a period of inactivity. Your work is safe.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link to="/login">
            <LogIn className="h-4 w-4" /> Sign in again
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link to="/login">
            <ArrowLeft className="h-4 w-4" /> Return to login
          </Link>
        </Button>
      </AuthCard>
    </AuthLayout>
  );
}
