import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingLayout, SummaryBlock } from "@/components/onboarding-layout";
import { MessageSquare, Mail, Instagram, Phone, Send, MessageCircle, PhoneCall, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/channel")({
  head: () => ({ meta: [{ title: "Choose first channel — Onboarding" }] }),
  component: ChannelStep,
});

type ChannelKey = "web" | "email" | "instagram" | "whatsapp" | "telegram" | "sms" | "voice";
type Status = "mock-active" | "planned" | "future";

const CHANNELS: {
  key: ChannelKey;
  name: string;
  icon: typeof MessageSquare;
  status: Status;
  desc: string;
  recommended?: boolean;
}[] = [
  { key: "web", name: "Web Chat", icon: MessageSquare, status: "mock-active", desc: "Add a website chat widget for customer inquiries.", recommended: true },
  { key: "email", name: "Email", icon: Mail, status: "mock-active", desc: "Triage customer messages from a shared email inbox." },
  { key: "instagram", name: "Instagram DM", icon: Instagram, status: "planned", desc: "Direct messages from Instagram." },
  { key: "whatsapp", name: "WhatsApp", icon: MessageCircle, status: "planned", desc: "WhatsApp Business messages." },
  { key: "telegram", name: "Telegram", icon: Send, status: "planned", desc: "Telegram bot inbox." },
  { key: "sms", name: "SMS", icon: Phone, status: "planned", desc: "Inbound and outbound SMS." },
  { key: "voice", name: "Voice", icon: PhoneCall, status: "future", desc: "AI-assisted voice reception." },
];

function statusLabel(s: Status) {
  return s === "mock-active" ? "Mock Active" : s === "planned" ? "Planned" : "Future";
}

function ChannelStep() {
  const [selected, setSelected] = useState<ChannelKey>("web");
  const sel = CHANNELS.find((c) => c.key === selected)!;

  return (
    <OnboardingLayout
      current="channel"
      title="Choose your first channel"
      description="Start with a mock-active channel for the prototype. Planned integrations remain disabled."
      back={{ to: "/onboarding/profile" }}
      next={{ to: "/onboarding/team" }}
      summary={
        <SummaryBlock
          title="Selected channel"
          items={[
            { label: "Channel", value: sel.name },
            { label: "Status", value: statusLabel(sel.status) },
            { label: "Integration", value: "None (mock)" },
          ]}
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {CHANNELS.map((c) => {
          const disabled = c.status !== "mock-active";
          const isSel = selected === c.key;
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              type="button"
              disabled={disabled}
              onClick={() => setSelected(c.key)}
              className={cn(
                "relative text-left rounded-lg border p-4 transition",
                isSel
                  ? "border-primary bg-primary/5 shadow-soft"
                  : "border-border bg-card hover:border-primary/40",
                disabled && "opacity-60 cursor-not-allowed hover:border-border",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-surface-muted">
                    <Icon className="h-4 w-4 text-foreground" />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-medium text-foreground">{c.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          c.status === "mock-active"
                            ? "bg-success"
                            : c.status === "planned"
                              ? "bg-muted-foreground"
                              : "bg-muted-foreground/60",
                        )}
                      />
                      {statusLabel(c.status)}
                      {c.recommended && (
                        <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-ai/30 bg-ai/10 px-1.5 py-px text-[10px] font-medium text-foreground">
                          <Sparkles className="h-2.5 w-2.5 text-ai" /> Recommended
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {isSel && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="mt-3 text-[12.5px] leading-snug text-muted-foreground">{c.desc}</p>
            </button>
          );
        })}
      </div>
    </OnboardingLayout>
  );
}
