import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, AuthCard, MockNotice } from "@/components/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — AI Reception" }] }),
  component: SignupPage,
});

function SignupPage() {
  const [done, setDone] = useState(false);

  return (
    <AuthLayout>
      <AuthCard
        title={done ? "Account ready" : "Create your account"}
        description={
          done
            ? "Your account is set up. Next, create the workspace your team will share."
            : "Get your team into a human-first reception workspace in minutes."
        }
        footer={
          !done && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Already have an account?</span>
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          )
        }
      >
        {done ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
              <div className="text-[13px] text-foreground">
                <p className="font-medium">Next: create your workspace</p>
                <p className="mt-0.5 text-muted-foreground">
                  Workspace onboarding is the next step in the product flow (planned route).
                </p>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link to="/onboarding/workspace">
                Continue to workspace setup <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <MockNotice>Prototype only — onboarding is mocked.</MockNotice>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" placeholder="Amelia Hart" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" placeholder="you@clinic.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="business">
                Business name <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input id="business" placeholder="Tehran Dental Clinic" />
            </div>
            <label className="flex items-start gap-2 text-[13px] text-muted-foreground">
              <Checkbox required className="mt-0.5" />
              <span>
                I agree to the <a className="text-primary hover:underline">Terms</a> and{" "}
                <a className="text-primary hover:underline">Privacy Policy</a>.
              </span>
            </label>
            <Button type="submit" className="w-full">
              Create account
            </Button>
            <MockNotice>Prototype only — account creation is mocked.</MockNotice>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
