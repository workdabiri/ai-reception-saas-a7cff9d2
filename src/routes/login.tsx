import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, AuthCard, MockNotice } from "@/components/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — AI Reception" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => navigate({ to: "/" }), 500);
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Sign in to your workspace"
        description="Human-first AI-assisted reception for customer operations."
        footer={
          <div className="flex items-center justify-between text-muted-foreground">
            <span>New here?</span>
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" placeholder="you@clinic.com" autoComplete="email" required />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-[12px] text-primary hover:underline">
                Forgot?
              </Link>
            </div>
            <Input id="password" type="password" autoComplete="current-password" required />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Checkbox defaultChecked /> Remember me on this device
          </label>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
          <MockNotice>Prototype only — no real authentication is connected.</MockNotice>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
