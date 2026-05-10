import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Avatar, ChannelChip, StatusChip } from "@/components/ui-bits";
import { AIDraftPanel } from "@/components/ai-draft-panel";
import {
  conversations,
  customers,
  channelLabel,
  channels as channelInfos,
  members,
  type Channel,
  type InboxStatus,
  type Priority,
  type Message,
} from "@/lib/mock-data";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Send,
  MoreHorizontal,
  Tag,
  StickyNote,
  UserPlus,
  CheckCircle2,
  Filter,
  Flag,
  Shield,
  ArrowRight,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  PanelRight,
  X,
} from "lucide-react";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — AI Reception" },
      { name: "description", content: "Operator inbox with AI drafts and human review." },
    ],
  }),
  component: InboxPage,
});

type FilterId = "all" | "unread" | "unassigned" | "mine" | InboxStatus;
const statusFilters: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "mine", label: "Assigned to me" },
  { id: "unassigned", label: "Unassigned" },
  { id: "needs-followup", label: "Needs follow-up" },
  { id: "waiting", label: "Waiting" },
  { id: "closed", label: "Closed" },
];

const inboxStatusLabel: Record<InboxStatus, string> = {
  new: "New",
  open: "Open",
  waiting: "Waiting",
  "needs-followup": "Needs follow-up",
  closed: "Closed",
};

const inboxStatusTone: Record<InboxStatus, string> = {
  new: "bg-info/10 text-info border-info/20",
  open: "bg-success/10 text-success border-success/20",
  waiting: "bg-warning/15 text-warning-foreground border-warning/30",
  "needs-followup": "bg-primary-soft text-primary border-primary/30",
  closed: "bg-muted text-muted-foreground border-border",
};

const priorityTone: Record<Priority, { dot: string; label: string; text: string }> = {
  low: { dot: "bg-muted-foreground/40", label: "Low", text: "text-muted-foreground" },
  normal: { dot: "bg-info", label: "Normal", text: "text-info" },
  high: { dot: "bg-warning", label: "High", text: "text-warning-foreground" },
  urgent: { dot: "bg-destructive", label: "Urgent", text: "text-destructive" },
};

function InboxStatusChip({ status }: { status: InboxStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${inboxStatusTone[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {inboxStatusLabel[status]}
    </span>
  );
}

function PriorityFlag({ priority }: { priority: Priority }) {
  const t = priorityTone[priority];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${t.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {t.label}
    </span>
  );
}

const ME_ID = "u3"; // Priya Raman — current operator (mock)

function InboxPage() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [filter, setFilter] = useState<FilterId>("all");
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [noteMode, setNoteMode] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [contextOpen, setContextOpen] = useState(false);

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const cust = customers.find((x) => x.id === c.customerId)!;
      let ok = true;
      if (filter === "unread") ok = c.unread;
      else if (filter === "mine") ok = c.assignee === ME_ID;
      else if (filter === "unassigned") ok = !c.assignee;
      else if (filter !== "all") ok = c.inboxStatus === filter;
      if (channelFilter !== "all" && c.channel !== channelFilter) ok = false;
      const q = query.trim().toLowerCase();
      if (q) {
        ok =
          ok &&
          (cust.name.toLowerCase().includes(q) ||
            c.subject.toLowerCase().includes(q) ||
            c.preview.toLowerCase().includes(q));
      }
      return ok;
    });
  }, [filter, channelFilter, query]);

  const active = conversations.find((c) => c.id === activeId)!;
  const customer = customers.find((c) => c.id === active.customerId)!;
  const aiDraft = active.messages.find((m) => m.author === "ai-draft");
  const assignee = active.assignee ? members.find((m) => m.id === active.assignee) : undefined;
  const linked = conversations.filter(
    (c) => c.customerId === active.customerId && c.id !== active.id,
  );

  const activeChannels: Channel[] = Array.from(new Set(conversations.map((c) => c.channel)));

  return (
    <AppShell>
      <div className="grid h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[340px_1fr] xl:grid-cols-[340px_1fr_340px]">
        {/* Column 1: Conversation list */}
        <div
          className={`${
            mobileView === "list" ? "flex" : "hidden"
          } md:flex min-h-0 flex-col border-r border-border bg-surface`}
        >
          <div className="space-y-2.5 border-b border-border p-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Inbox</h2>
                <p className="text-[11px] text-muted-foreground">
                  {filtered.length} of {conversations.length} conversations
                </p>
              </div>
              <button className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, subject…"
                className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
              {statusFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition ${
                    filter === f.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
              <button
                onClick={() => setChannelFilter("all")}
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                  channelFilter === "all"
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                All channels
              </button>
              {activeChannels.map((ch) => {
                const sel = channelFilter === ch;
                return (
                  <button
                    key={ch}
                    onClick={() => setChannelFilter(ch)}
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                      sel
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {channelLabel[ch]}
                  </button>
                );
              })}
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {filtered.map((c) => {
              const cust = customers.find((x) => x.id === c.customerId)!;
              const a = c.assignee ? members.find((m) => m.id === c.assignee) : undefined;
              const selected = c.id === activeId;
              const pTone = priorityTone[c.priority];
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveId(c.id)}
                    className={`relative w-full border-b border-border px-4 py-3 text-left transition ${
                      selected ? "bg-primary-soft/40" : "hover:bg-surface-muted"
                    }`}
                  >
                    {selected && (
                      <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar initials={cust.initials} />
                        <span
                          className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface ${pTone.dot}`}
                          title={`Priority: ${pTone.label}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">{cust.name}</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {c.updated}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs font-medium">{c.subject}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {c.preview}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <InboxStatusChip status={c.inboxStatus} />
                          <ChannelChip channel={c.channel} label={channelLabel[c.channel]} />
                          {c.unread && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="truncate">
                            {a ? `Assigned · ${a.name}` : "Unassigned"}
                          </span>
                          <PriorityFlag priority={c.priority} />
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-4 py-10 text-center text-xs text-muted-foreground">
                No conversations match.
              </li>
            )}
          </ul>
          <div className="border-t border-border bg-surface-muted px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            Mock data · channels are placeholders
          </div>
        </div>

        {/* Column 2: Conversation thread */}
        <div className="flex min-h-0 flex-col bg-background">
          {/* Thread header */}
          <div className="border-b border-border bg-surface px-6 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar initials={customer.initials} tone="primary" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-semibold">{active.subject}</h2>
                    <InboxStatusChip status={active.inboxStatus} />
                    <PriorityFlag priority={active.priority} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {customer.name} · {customer.email} · via {channelLabel[active.channel]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ActionBtn icon={UserPlus} label="Assign" />
                <ActionBtn icon={Tag} label="Classify" />
                <ActionBtn icon={Flag} label="Priority" />
                <button className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background hover:opacity-90">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Close
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
            {active.classification && (
              <div className="mt-2.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-md border border-border bg-surface-muted px-1.5 py-0.5 font-medium">
                  {active.classification}
                </span>
                <span>·</span>
                <span>
                  {assignee ? `Assigned to ${assignee.name}` : "Unassigned"}
                </span>
              </div>
            )}
          </div>

          {/* Thread body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {active.messages
                .filter((m) => m.author !== "ai-draft")
                .map((m) => (
                  <ThreadItem key={m.id} message={m} customerInitials={customer.initials} />
                ))}
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-border bg-surface px-6 py-4">
            {aiDraft && !noteMode && (
              <div className="mb-3">
                <AIDraftPanel
                  draft={aiDraft.body}
                  confidence={active.priority === "urgent" ? "Low" : active.priority === "high" ? "High" : "Medium"}
                  onAccept={(t) => setDraft(t)}
                  onEdit={(t) => setDraft(t)}
                  onReject={() => setDraft("")}
                />
              </div>
            )}

            <div className="flex items-center gap-1 pb-2 text-[11px]">
              <button
                onClick={() => setNoteMode(false)}
                className={`rounded-md px-2 py-1 font-medium transition ${
                  !noteMode
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                Reply to customer
              </button>
              <button
                onClick={() => setNoteMode(true)}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition ${
                  noteMode
                    ? "bg-warning/30 text-warning-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <StickyNote className="h-3 w-3" />
                Internal note
              </button>
            </div>

            <div
              className={`rounded-xl border focus-within:ring-2 focus-within:ring-ring/40 ${
                noteMode
                  ? "border-warning/40 bg-warning/10"
                  : "border-border bg-card"
              }`}
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder={
                  noteMode
                    ? "Add an internal note · only your team will see this"
                    : "Write a reply… operator sends the final message"
                }
                className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {noteMode ? (
                    <>
                      <Shield className="h-3.5 w-3.5" />
                      Visible to your workspace only
                    </>
                  ) : (
                    <>
                      <Tag className="h-3.5 w-3.5" />
                      Reply via {channelLabel[active.channel]}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary">
                    Save draft
                  </button>
                  {noteMode ? (
                    <button className="inline-flex items-center gap-1.5 rounded-md bg-warning px-3 py-1.5 text-xs font-semibold text-warning-foreground hover:opacity-95">
                      <StickyNote className="h-3.5 w-3.5" />
                      Add note
                    </button>
                  ) : (
                    <button
                      title="Mock — no message will be sent in this prototype"
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-95"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send reply
                      <span className="ml-1 rounded bg-primary-foreground/15 px-1 text-[10px] font-medium uppercase tracking-wider">
                        mock
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Customer context */}
        <aside className="hidden min-h-0 flex-col overflow-y-auto border-l border-border bg-surface xl:flex">
          {/* Profile */}
          <div className="border-b border-border p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar initials={customer.initials} tone="primary" />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">{customer.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    Customer · {customer.conversations} conversations
                  </p>
                </div>
              </div>
              <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-1.5">
              <ContactRow icon={Mail} value={customer.email} />
              <ContactRow icon={Phone} value={`${customer.phone} · placeholder`} />
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
              <button className="rounded-md border border-dashed border-border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary">
                + Tag
              </button>
            </div>
          </div>

          {/* Visibility warning */}
          <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-[11px] text-warning-foreground">
            <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div>
              <div className="font-semibold">Workspace-scoped</div>
              Customer data is visible only to members of this workspace. Mock data — no
              real PII shown.
            </div>
          </div>

          {/* Next actions */}
          <div className="p-5">
            <SectionTitle>Next action suggestions</SectionTitle>
            <ul className="mt-3 space-y-2">
              <NextAction
                label="Confirm Wed 10:30am slot"
                hint="Based on customer's morning preference"
              />
              <NextAction
                label="Send first-visit forms"
                hint="Eleanor hasn't returned them"
              />
              <NextAction label="Mark as resolved" hint="If reply is acknowledged" />
            </ul>
          </div>

          {/* Linked conversations */}
          <div className="border-t border-border p-5">
            <SectionTitle>Linked conversations</SectionTitle>
            <ul className="mt-3 space-y-2">
              {linked.length === 0 && (
                <li className="text-[11px] text-muted-foreground">
                  No other conversations from this customer.
                </li>
              )}
              {linked.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveId(c.id)}
                    className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left hover:bg-surface-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold">{c.subject}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {c.updated} · {channelLabel[c.channel]}
                      </div>
                    </div>
                    <InboxStatusChip status={c.inboxStatus} />
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Internal notes summary */}
          <div className="border-t border-border p-5">
            <SectionTitle>Internal notes</SectionTitle>
            <ul className="mt-3 space-y-2">
              {active.messages
                .filter((m) => m.author === "internal-note")
                .map((n) => (
                  <li
                    key={n.id}
                    className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning-foreground"
                  >
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="font-semibold">{n.authorName}</span>
                      <span className="opacity-70">{n.time}</span>
                    </div>
                    <p className="leading-snug">{n.body}</p>
                  </li>
                ))}
              {active.messages.filter((m) => m.author === "internal-note").length === 0 && (
                <li className="text-[11px] text-muted-foreground">
                  No internal notes yet.
                </li>
              )}
            </ul>
          </div>

          {/* Audit summary */}
          <div className="border-t border-border p-5">
            <SectionTitle>Audit summary</SectionTitle>
            <ul className="mt-3 space-y-3 text-[11px]">
              {active.messages
                .filter((m) =>
                  m.author === "system-assignment" ||
                  m.author === "system-status" ||
                  m.author === "system-classification" ||
                  m.author === "operator",
                )
                .map((m) => (
                  <li key={m.id} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">
                        {systemLabel(m)}
                      </div>
                      <div className="text-muted-foreground">{m.time}</div>
                    </div>
                  </li>
                ))}
            </ul>
            <button className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
              View full audit log
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function systemLabel(m: Message) {
  switch (m.author) {
    case "system-assignment":
      return m.body;
    case "system-status":
      return m.body;
    case "system-classification":
      return m.body;
    case "operator":
      return `${m.authorName} sent a reply`;
    default:
      return m.body;
  }
}

function ActionBtn({
  icon: Icon,
  label,
}: {
  icon: typeof Filter;
  label: string;
}) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium hover:bg-secondary">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function ContactRow({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span className="truncate">{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h4>
  );
}

function NextAction({ label, hint }: { label: string; hint: string }) {
  return (
    <li>
      <button className="flex w-full items-start justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left hover:bg-surface-muted">
        <div className="min-w-0">
          <div className="text-xs font-semibold">{label}</div>
          <div className="text-[11px] text-muted-foreground">{hint}</div>
        </div>
        <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </li>
  );
}

function ThreadItem({
  message,
  customerInitials,
}: {
  message: Message;
  customerInitials: string;
}) {
  // System events
  if (
    message.author === "system-assignment" ||
    message.author === "system-status" ||
    message.author === "system-classification"
  ) {
    const tone =
      message.author === "system-assignment"
        ? "border-info/30 text-info"
        : message.author === "system-status"
          ? "border-warning/30 text-warning-foreground"
          : "border-primary/30 text-primary";
    return (
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-[11px] font-medium ${tone}`}
        >
          {message.body} · <span className="opacity-70">{message.time}</span>
        </div>
        <div className="h-px flex-1 bg-border" />
      </div>
    );
  }

  // Internal note
  if (message.author === "internal-note") {
    return (
      <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 shadow-soft">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-warning-foreground">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <StickyNote className="h-3 w-3" />
            Internal note · {message.authorName}
          </span>
          <span className="opacity-70">{message.time}</span>
        </div>
        <p className="text-sm text-foreground/90">{message.body}</p>
        <div className="mt-2 text-[10px] uppercase tracking-wider text-warning-foreground/70">
          Not visible to customer
        </div>
      </div>
    );
  }

  // Customer / operator bubbles
  const mine = message.author === "operator";
  return (
    <div className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
      <Avatar
        initials={mine ? "OP" : customerInitials}
        tone={mine ? "primary" : "neutral"}
      />
      <div className={`flex max-w-xl flex-col ${mine ? "items-end" : ""}`}>
        <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{message.authorName}</span>
          <span>·</span>
          <span>{message.time}</span>
        </div>
        <div
          className={`rounded-2xl border px-4 py-2.5 text-sm leading-relaxed shadow-soft ${
            mine
              ? "rounded-tr-sm border-primary bg-primary text-primary-foreground"
              : "rounded-tl-sm border-border bg-card"
          }`}
        >
          {message.body}
        </div>
      </div>
    </div>
  );
}
