import { createFileRoute, Link } from "@tanstack/react-router";
import { OnboardingLayout, SummaryBlock } from "@/components/onboarding-layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard, Inbox, Settings2 } from "lucide-react";

export const Route = createFileRoute("/onboarding/done")({
  head: () => ({ meta: [{ title: "Setup complete — Onboarding" }] }),
  component: DoneStep,
});

function DoneStep() {
  return (
    <OnboardingLayout
      current="done"
      title="Workspace is ready"
      description="Your workspace is ready for the AI-assisted reception workflow."
      hideActions
      summary={
        <SummaryBlock
          title="Setup summary"
          items={[
            { label: "Workspace", value: "Tehran Dental Clinic" },
            { label: "Role", value: "Owner" },
            { label: "First channel", value: "Web Chat — Mock Active" },
            { label: "Team invite", value: "1 pending operator" },
            { label: "AI mode", value: "Human review required" },
          ]}
        />
      }
    >
      <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 px-4 py-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
        <div className="text-[13px] text-foreground">
          <p className="font-medium">All set</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            You can now enter the product and start reviewing AI drafts.
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button asChild>
          <Link to="/">
            <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/inbox">
            <Inbox className="h-4 w-4" /> Open Inbox
          </Link>
        </Button>
      </div>

      <Button asChild variant="ghost" className="w-full">
        <Link to="/channels">
          <Settings2 className="h-4 w-4" /> Review channels
        </Link>
      </Button>
    </OnboardingLayout>
  );
}
