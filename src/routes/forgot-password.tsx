import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, AuthCard, MockNotice } from "@/components/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MailCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — AI Reception" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthLayout>
      <AuthCard
        title="Reset your password"
        description="Enter your work email and we'll send a reset link."
        footer={
          <Link to="/login" className="inline-flex items-center gap-1 text-primary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        }
      >
        {sent ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-muted px-4 py-3">
              <MailCheck className="mt-0.5 h-4 w-4 text-primary" />
              <p className="text-[13px] text-foreground">
                If this email exists, a reset link would be sent. Check your inbox in a few minutes.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
              Send to a different email
            </Button>
            <MockNotice>Prototype only — no email is actually sent.</MockNotice>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" placeholder="you@clinic.com" required />
            </div>
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
            <MockNotice>Prototype only — no real password reset is connected.</MockNotice>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
