import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Avatar, ChannelChip, StatusChip } from "@/components/ui-bits";
import { conversations, customers, channelLabel, members } from "@/lib/mock-data";
import { Filter, Sparkles, Send, MoreHorizontal, Tag, Clock, UserCircle2 } from "lucide-react";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — AI Reception" },
      { name: "description", content: "Operator inbox with AI drafts and human review." },
    ],
  }),
  component: InboxPage,
});

const filters = ["All", "Unassigned", "Mine", "Open", "Pending", "Closed"];

function InboxPage() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [filter, setFilter] = useState("All");
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId)!;
  const customer = customers.find((c) => c.id === active.customerId)!;
  const aiDraft = active.messages.find((m) => m.author === "ai-draft");

  return (
    <AppShell>
      <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[340px_1fr] xl:grid-cols-[340px_1fr_320px]">
        {/* Conversation list */}
        <div className="border-r border-border bg-surface flex flex-col min-h-0">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Inbox</h2>
              <button className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground">
                <Filter className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                    filter === f
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {conversations.map((c) => {
              const cust = customers.find((x) => x.id === c.customerId)!;
              const selected = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveId(c.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border transition ${
                      selected ? "bg-primary-soft/40" : "hover:bg-surface-muted"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar initials={cust.initials} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">
                            {cust.name}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {c.updated}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs font-medium">
                          {c.subject}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {c.preview}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <StatusChip status={c.status} />
                          <ChannelChip channel={c.channel} label={channelLabel[c.channel]} />
                          {c.unread && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Conversation detail */}
        <div className="flex min-h-0 flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar initials={customer.initials} tone="primary" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-semibold">{active.subject}</h2>
                  <StatusChip status={active.status} />
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {customer.name} · {customer.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary">
                Snooze
              </button>
              <button className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary">
                Assign
              </button>
              <button className="rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background hover:opacity-90">
                Close
              </button>
              <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {active.messages
              .filter((m) => m.author !== "ai-draft")
              .map((m) => {
                const mine = m.author === "operator";
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar
                      initials={mine ? "PR" : customer.initials}
                      tone={mine ? "primary" : "neutral"}
                    />
                    <div className={`max-w-xl ${mine ? "items-end" : ""} flex flex-col`}>
                      <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground">{m.authorName}</span>
                        <span>·</span>
                        <span>{m.time}</span>
                      </div>
                      <div
                        className={`rounded-2xl border px-4 py-2.5 text-sm leading-relaxed shadow-soft ${
                          mine
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border"
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Composer */}
          <div className="border-t border-border bg-surface px-6 py-4">
            {aiDraft && (
              <div className="mb-3 rounded-xl border border-primary/30 bg-primary-soft/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI draft · human review required
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Operator sends final reply
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground/90">{aiDraft.body}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => setDraft(aiDraft.body)}
                    className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-95"
                  >
                    Use draft
                  </button>
                  <button className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium hover:bg-secondary">
                    Regenerate (mock)
                  </button>
                  <button className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary">
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring/40">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="Write a reply… (operator sends final message)"
                className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-center justify-between border-t border-border px-3 py-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  Reply via {channelLabel[active.channel]}
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary">
                    Save as note
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-95">
                    <Send className="h-3.5 w-3.5" />
                    Send reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer panel */}
        <aside className="hidden xl:flex flex-col border-l border-border bg-surface min-h-0 overflow-y-auto">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar initials={customer.initials} tone="primary" />
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">{customer.name}</h3>
                <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {customer.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 border-b border-border space-y-3 text-sm">
            <Row label="Phone" value={customer.phone} />
            <Row label="Conversations" value={String(customer.conversations)} />
            <Row label="Last seen" value={customer.lastSeen} />
            <Row label="Channel" value={channelLabel[active.channel]} />
          </div>

          <div className="p-5 border-b border-border">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assignment
            </h4>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <UserCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {active.assignee
                  ? members.find((m) => m.id === active.assignee)?.name ?? "Unassigned"
                  : "Unassigned"}
              </span>
            </div>
          </div>

          <div className="p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Activity
            </h4>
            <ul className="mt-3 space-y-3 text-xs">
              {[
                "Conversation opened",
                "Assigned to Priya R.",
                "AI draft generated",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">{t}</div>
                    <div className="text-muted-foreground">Today · 10:42</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium truncate">{value}</span>
    </div>
  );
}
