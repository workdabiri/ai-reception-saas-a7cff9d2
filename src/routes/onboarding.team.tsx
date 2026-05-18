import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingLayout, SummaryBlock } from "@/components/onboarding-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, Info } from "lucide-react";

export const Route = createFileRoute("/onboarding/team")({
  head: () => ({ meta: [{ title: "Invite your team — Onboarding" }] }),
  component: TeamStep,
});

type Invite = { email: string; role: "Admin" | "Operator" | "Viewer" };

function TeamStep() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Invite["role"]>("Operator");
  const [invites, setInvites] = useState<Invite[]>([
    { email: "priya@example.com", role: "Operator" },
  ]);

  function addInvite() {
    if (!email.trim()) return;
    setInvites((prev) => [...prev, { email: email.trim(), role }]);
    setEmail("");
  }

  return (
    <OnboardingLayout
      current="team"
      title="Invite your team"
      description="Bring operators into the workspace so they can manage conversations."
      back={{ to: "/onboarding/channel" }}
      next={{ to: "/onboarding/ai" }}
      skip={{ to: "/onboarding/ai", label: "Skip for now" }}
      summary={
        <SummaryBlock
          title="Pending invites"
          items={
            invites.length
              ? invites.map((i) => ({ label: i.role, value: i.email }))
              : [{ label: "—", value: "No invites yet" }]
          }
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="t-email">Invite email</Label>
          <Input
            id="t-email"
            type="email"
            placeholder="teammate@clinic.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="t-role">Role</Label>
          <select
            id="t-role"
            value={role}
            onChange={(e) => setRole(e.target.value as Invite["role"])}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option>Admin</option>
            <option>Operator</option>
            <option>Viewer</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button type="button" variant="outline" onClick={addInvite} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <p className="text-[12px] text-muted-foreground">
        Operators can handle conversations and review AI drafts.
      </p>

      <div className="rounded-lg border border-border bg-surface">
        {invites.length === 0 ? (
          <p className="px-4 py-6 text-center text-[12.5px] text-muted-foreground">
            No invites added yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {invites.map((i, idx) => (
              <li
                key={`${i.email}-${idx}`}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-foreground">{i.email}</p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {i.role} ·{" "}
                    <span className="text-warning">Pending</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInvites((p) => p.filter((_, n) => n !== idx))}
                  className="rounded-md p-1 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  aria-label="Remove invite"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-[12px] text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5" />
        Owners can manage members and roles later from <span className="font-medium text-foreground">Members</span>.
      </div>
    </OnboardingLayout>
  );
}
