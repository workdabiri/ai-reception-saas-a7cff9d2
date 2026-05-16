import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Avatar, ChannelChip } from "@/components/ui-bits";
import { AIDraftPanel } from "@/components/ai-draft-panel";
import {
  conversations,
  customers,
  channelLabel,
  members,
  type InboxStatus,
  type Priority,
  type Message,
  type Channel,
} from "@/lib/mock-data";
import {
  Search,
  SlidersHorizontal,
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
  ArrowLeft,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  PanelRight,
  Inbox as InboxIcon,
  Sparkles,
  Users,
  Radio,
  MessageSquare,
  Instagram,
  MessageCircle,
  Send as SendIcon,
  Smartphone,
  PhoneCall,
  Mail as MailIcon,
  AlertTriangle,
  Clock,
  CheckCheck,
  XCircle,
  FileSearch,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { InboxOperatorFirstEmpty, FilterNoMatchState } from "@/components/empty-states";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — AI Reception" },
      { name: "description", content: "Operator inbox with AI drafts and human review." },
    ],
  }),
  component: InboxPage,
});

const statusFilters: { id: "all" | InboxStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "open", label: "Open" },
  { id: "waiting", label: "Waiting" },
  { id: "needs-followup", label: "Needs follow-up" },
  { id: "closed", label: "Closed" },
];

const inboxStatusLabel: Record<InboxStatus, string> = {
  new: "New",
  open: "Open",
  waiting: "Waiting",
  "needs-followup": "Needs follow-up",
  closed: "Closed",
};

// Monday-style strict semantics — each state communicates a distinct meaning:
//   new        → neutral (untouched)
//   open       → info/blue (working on it)
//   waiting    → warning/amber (waiting on customer)
//   followup   → attention/orange (we're overdue — escalation)
//   closed     → success/green, de-emphasized (done)
const inboxStatusTone: Record<InboxStatus, string> = {
  new: "bg-secondary text-secondary-foreground border-border",
  open: "bg-info/10 text-info border-info/25",
  waiting: "bg-warning/12 text-warning-foreground dark:text-[var(--status-warning-text)] border-warning/30",
  "needs-followup": "bg-attention/12 text-attention dark:text-[var(--status-pending-text)] border-attention/30",
  closed: "bg-success/8 text-success/85 border-success/20",
};

const priorityTone: Record<Priority, { dot: string; label: string; text: string }> = {
  low: { dot: "bg-muted-foreground/35", label: "Low", text: "text-muted-foreground" },
  normal: { dot: "bg-muted-foreground/55", label: "Normal", text: "text-muted-foreground" },
  high: { dot: "bg-attention", label: "High", text: "text-attention" },
  urgent: { dot: "bg-destructive", label: "Urgent", text: "text-destructive" },
};

function InboxStatusChip({ status }: { status: InboxStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-[11px] font-medium ${inboxStatusTone[status]}`}
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

type SectionFilter =
  | { kind: "inbox"; value: "all" | "new" | "unassigned" | "assigned-me" | "waiting" | "needs-followup" | "needs-review" | "overdue" | "closed"; label: string }
  | { kind: "channel"; value: Channel | "planned" | "future"; label: string }
  | { kind: "ai"; value: "pending" | "accepted" | "rejected" | "needs-source"; label: string }
  | { kind: "operator"; value: string | "unassigned"; label: string }
  | { kind: "priority"; value: Priority; label: string };

const ME_ID = "u1";

function InboxPage() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [section, setSection] = useState<SectionFilter>({
    kind: "inbox",
    value: "all",
    label: "All conversations",
  });
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [noteMode, setNoteMode] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [contextOpen, setContextOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [queueMenuOpen, setQueueMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      let matchSection = true;
      if (section.kind === "inbox") {
        switch (section.value) {
          case "all": matchSection = true; break;
          case "new": matchSection = c.inboxStatus === "new"; break;
          case "unassigned": matchSection = !c.assignee; break;
          case "assigned-me": matchSection = c.assignee === ME_ID; break;
          case "waiting": matchSection = c.inboxStatus === "waiting"; break;
          case "needs-followup": matchSection = c.inboxStatus === "needs-followup"; break;
          case "needs-review": matchSection = c.messages.some((m) => m.author === "ai-draft"); break;
          case "overdue": matchSection = c.priority === "urgent" || /hr|d/i.test(c.updated); break;
          case "closed": matchSection = c.inboxStatus === "closed"; break;
        }
      } else if (section.kind === "channel") {
        if (section.value === "planned" || section.value === "future") matchSection = false;
        else matchSection = c.channel === section.value;
      } else if (section.kind === "ai") {
        matchSection = section.value === "pending"
          ? c.messages.some((m) => m.author === "ai-draft")
          : false;
      } else if (section.kind === "operator") {
        matchSection = section.value === "unassigned" ? !c.assignee : c.assignee === section.value;
      } else if (section.kind === "priority") {
        matchSection = c.priority === section.value;
      }
      if (!matchSection) return false;

      const cust = customers.find((x) => x.id === c.customerId)!;
      const q = query.trim().toLowerCase();
      return (
        !q ||
        cust.name.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q)
      );
    });
  }, [section, query]);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const customer = customers.find((c) => c.id === active.customerId)!;
  const aiDraft = active.messages.find((m) => m.author === "ai-draft");
  const assignee = active.assignee ? members.find((m) => m.id === active.assignee) : undefined;
  const linked = conversations.filter(
    (c) => c.customerId === active.customerId && c.id !== active.id,
  );

  const openConversation = (id: string) => {
    setActiveId(id);
    setMobileView("thread");
  };

  const allFiltersPanel = (
    <InboxSectionsPanel
      selected={section}
      onSelect={(s) => {
        setSection(s);
        setSectionsOpen(false);
      }}
    />
  );

  const channelChips: { value: Channel | "planned" | "future" | "all"; label: string; planned?: boolean }[] = [
    { value: "all", label: "All" },
    { value: "webform", label: "Web" },
    { value: "email", label: "Email" },
    { value: "planned", label: "Instagram", planned: true },
    { value: "planned", label: "WhatsApp", planned: true },
    { value: "planned", label: "Telegram", planned: true },
    { value: "planned", label: "SMS", planned: true },
    { value: "future", label: "Voice", planned: true },
  ];

  const queueRows = inboxSectionGroups[0].rows;
  const activeQueueLabel =
    section.kind === "inbox" ? section.label : "All conversations";

  return (
    <>
      <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)_340px]">
        {/* Column 1: Conversation list (with integrated queue + channel filters) */}
        <div
          className={`min-h-0 flex-col border-r border-border bg-surface ${
            mobileView === "list" ? "flex" : "hidden"
          } md:flex`}
        >
          <div className="space-y-3 border-b border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <InboxIcon className="h-3 w-3" />
                Inbox
              </div>
              <button
                onClick={() => setSectionsOpen(true)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                aria-label="Open all filters"
                title="All filters · operators, priority, AI review"
              >
                <SlidersHorizontal className="h-3 w-3" />
                Filters
              </button>
            </div>

            {/* Queue selector */}
            <div className="relative">
              <button
                onClick={() => setQueueMenuOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left transition hover:bg-surface-muted"
              >
                <span className="min-w-0 truncate text-[13px] font-medium">
                  {activeQueueLabel}
                </span>
                <span className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground">
                  <span className="tabular-nums">{filtered.length}</span>
                  <ChevronRight className={`h-3.5 w-3.5 transition ${queueMenuOpen ? "rotate-90" : ""}`} />
                </span>
              </button>
              {queueMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setQueueMenuOpen(false)} />
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-pop">
                    {queueRows.map((row) => {
                      const Icon = row.icon;
                      const isActive =
                        section.kind === "inbox" && section.value === (row.filter as { value: string }).value;
                      return (
                        <button
                          key={row.label}
                          onClick={() => {
                            setSection(row.filter);
                            setQueueMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[12.5px] transition ${
                            isActive ? "bg-primary-soft text-primary font-medium" : "hover:bg-secondary"
                          }`}
                        >
                          {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />}
                          <span className="min-w-0 flex-1 truncate">{row.label}</span>
                          {row.badge !== undefined && row.badge !== 0 && (
                            <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-medium tabular-nums ${badgeToneClass[row.badgeTone ?? "muted"]}`}>
                              {row.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, subject…"
                className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* Channel chips */}
            <div className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {channelChips.map((chip, i) => {
                const isActive =
                  (chip.value === "all" && section.kind === "inbox" && section.value === "all") ||
                  (section.kind === "channel" && section.label === chip.label);
                return (
                  <button
                    key={`${chip.label}-${i}`}
                    disabled={chip.planned}
                    onClick={() => {
                      if (chip.value === "all") {
                        setSection({ kind: "inbox", value: "all", label: "All conversations" });
                      } else if (!chip.planned) {
                        setSection({ kind: "channel", value: chip.value as Channel, label: chip.label });
                      }
                    }}
                    className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : chip.planned
                        ? "border-dashed border-border text-muted-foreground/60 cursor-not-allowed"
                        : "border-border bg-surface text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {chip.label}
                    {chip.planned && <span className="ml-1 text-[9px] uppercase opacity-70">soon</span>}
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
                    onClick={() => openConversation(c.id)}
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
                          <span className="truncate text-sm font-medium">{cust.name}</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {c.updated}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs font-medium">{c.subject}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {c.preview}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <InboxStatusChip status={c.inboxStatus} />
                          <ChannelChip channel={c.channel} label={channelLabel[c.channel]} />
                          {c.unread && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1 truncate">
                            {a ? (
                              <>
                                <span className="grid h-4 w-4 place-items-center rounded-full bg-secondary text-[8px] font-medium text-secondary-foreground">
                                  {a.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                                </span>
                                <span className="truncate">{a.name}</span>
                              </>
                            ) : (
                              <span className="italic">Unassigned</span>
                            )}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <span className="tabular-nums">⏱ {c.updated}</span>
                            <PriorityFlag priority={c.priority} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-2 py-2">
                {conversations.length === 0 ? (
                  <InboxOperatorFirstEmpty />
                ) : (
                  <FilterNoMatchState
                    label="conversations"
                    onReset={() => {
                      setQuery("");
                      setSection({ kind: "inbox", value: "all", label: "All conversations" });
                    }}
                  />
                )}
              </li>
            )}
          </ul>
          <div className="border-t border-border bg-surface-muted px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            Mock data · channels are placeholders
          </div>
        </div>

        {/* Column 2: Conversation thread */}
        <div
          className={`min-h-0 flex-col bg-background ${
            mobileView === "thread" ? "flex" : "hidden"
          } md:flex`}
        >
          {/* Thread header */}
          <div className="border-b border-border bg-surface px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                {/* Mobile back button */}
                <button
                  onClick={() => setMobileView("list")}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-secondary md:hidden"
                  aria-label="Back to inbox"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <Avatar initials={customer.initials} tone="primary" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-medium">{active.subject}</h2>
                    <span className="hidden sm:inline-flex">
                      <InboxStatusChip status={active.inboxStatus} />
                    </span>
                    <span className="hidden md:inline-flex">
                      <PriorityFlag priority={active.priority} />
                    </span>
                  </div>
                  <p className="truncate text-[11px] sm:text-xs text-muted-foreground">
                    {customer.name} · via {channelLabel[active.channel]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Desktop actions */}
                <span className="hidden lg:inline-flex items-center gap-1">
                  <ActionBtn icon={UserPlus} label="Assign" />
                  <ActionBtn icon={Tag} label="Classify" />
                  <ActionBtn icon={Flag} label="Priority" />
                </span>
                <button className="hidden sm:inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Close
                </button>
                {/* Open context drawer (mobile + tablet) */}
                <button
                  onClick={() => setContextOpen(true)}
                  className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary xl:hidden"
                  aria-label="Open customer context"
                >
                  <PanelRight className="h-4 w-4" />
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Mobile-only chip row */}
            <div className="mt-2 flex items-center gap-2 sm:hidden">
              <InboxStatusChip status={active.inboxStatus} />
              <PriorityFlag priority={active.priority} />
              {active.classification && (
                <span className="rounded-md border border-border bg-surface-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                  {active.classification}
                </span>
              )}
            </div>
            {active.classification && (
              <div className="mt-3 hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="rounded-md border border-border bg-surface-muted px-2 py-1 font-medium">
                  {active.classification}
                </span>
                <span>·</span>
                <span>{assignee ? `Assigned to ${assignee.name}` : "Unassigned"}</span>
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

          {/* Composer (sticky on mobile, padded above floating bottom nav) */}
          <div className="border-t border-border bg-surface px-4 py-3 sm:px-6 sm:py-4 pb-[88px] md:pb-4">
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
                    ? "bg-warning/30 text-warning-foreground dark:text-[var(--status-warning-text)]"
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
                    <button className="inline-flex items-center gap-2 rounded-md bg-warning px-3 py-2 text-xs font-medium text-[oklch(0.20_0.04_75)] hover:opacity-95">
                      <StickyNote className="h-3.5 w-3.5" />
                      Add note
                    </button>
                  ) : (
                    <div className="inline-flex items-center">
                      <button
                        title="Mock — no message will be sent in this prototype"
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-95"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send reply
                      </button>
                      <span className="mock-suffix ml-2 self-center rounded border-[0.5px] border-border bg-background px-1.5 py-1 text-[10px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                        Mock
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Customer context — desktop xl */}
        <aside className="hidden min-h-0 flex-col overflow-y-auto border-l border-border bg-surface xl:flex">
          <CustomerContext
            customer={customer}
            active={active}
            linked={linked}
            onOpenConversation={openConversation}
          />
        </aside>
      </div>

      {/* Customer context drawer for mobile + tablet */}
      <Sheet open={contextOpen} onOpenChange={setContextOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-md overflow-y-auto p-0 sm:max-w-md xl:hidden"
        >
          <SheetTitle className="sr-only">Customer context</SheetTitle>
          <CustomerContext
            customer={customer}
            active={active}
            linked={linked}
            onOpenConversation={(id) => {
              openConversation(id);
              setContextOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* All filters drawer (operators, priority, AI review, channels) */}
      <Sheet open={sectionsOpen} onOpenChange={setSectionsOpen}>
        <SheetContent
          side="left"
          className="w-[300px] overflow-y-auto p-0"
        >
          <SheetTitle className="sr-only">All filters</SheetTitle>
          {allFiltersPanel}
        </SheetContent>
      </Sheet>
    </>
  );
}

function CustomerContext({
  customer,
  active,
  linked,
  onOpenConversation,
}: {
  customer: (typeof customers)[number];
  active: (typeof conversations)[number];
  linked: (typeof conversations)[number][];
  onOpenConversation: (id: string) => void;
}) {
  return (
    <>
      {/* Profile */}
      <div className="border-b border-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar initials={customer.initials} tone="primary" />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium">{customer.name}</h3>
              <p className="truncate text-xs text-muted-foreground">
                Customer · {customer.conversations} conversations
              </p>
            </div>
          </div>
          <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <ContactRow icon={Mail} value={customer.email} />
          <ContactRow icon={Phone} value={`${customer.phone} · placeholder`} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {customer.tags.map((t) => (
            <span
              key={t}
              className="rounded-md border border-border bg-surface-muted px-2 py-1 text-[11px] font-medium"
            >
              {t}
            </span>
          ))}
          <button className="rounded-md border border-dashed border-border px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary">
            + Tag
          </button>
        </div>
      </div>

      {/* Visibility warning */}
      <div className="workspace-scoped-callout mx-5 mt-4 flex items-start gap-2 px-3 py-3">
        <Shield className="mt-[2px] h-3.5 w-3.5 shrink-0 text-warning" />
        <div>
          <div className="workspace-scoped-callout-title">Workspace-scoped</div>
          <div className="workspace-scoped-callout-body">
            Customer data is visible only to members of this workspace. Mock data — no real PII shown.
          </div>
        </div>
      </div>

      {/* Next actions */}
      <div className="p-5">
        <SectionTitle>Next action suggestions</SectionTitle>
        <ul className="mt-3 space-y-2">
          <NextAction label="Confirm Wed 10:30am slot" hint="Based on customer's morning preference" />
          <NextAction label="Send first-visit forms" hint="Eleanor hasn't returned them" />
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
                onClick={() => onOpenConversation(c.id)}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left hover:bg-surface-muted"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{c.subject}</div>
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

      {/* Internal notes */}
      <div className="border-t border-border p-5">
        <SectionTitle>Internal notes</SectionTitle>
        <ul className="mt-3 space-y-2">
          {active.messages
            .filter((m) => m.author === "internal-note")
            .map((n) => (
              <li
                key={n.id}
                className="rounded-r-[8px] rounded-l-none border-0 border-l-[3px] border-l-warning bg-[rgba(255,203,0,0.06)] py-3 px-3.5 dark:bg-[rgba(255,211,64,0.08)]"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-foreground">{n.authorName}</span>
                  <span className="text-[12px] text-muted-foreground tabular-nums">{n.time}</span>
                </div>
                <p className="text-[13px] font-normal leading-[1.5] text-muted-foreground">{n.body}</p>
              </li>
            ))}
          {active.messages.filter((m) => m.author === "internal-note").length === 0 && (
            <li className="text-[11px] text-muted-foreground">No internal notes yet.</li>
          )}
        </ul>
      </div>

      {/* Audit summary */}
      <div className="border-t border-border p-5 pb-10">
        <SectionTitle>Audit summary</SectionTitle>
        <ul className="mt-3 space-y-3 text-[11px]">
          {active.messages
            .filter(
              (m) =>
                m.author === "system-assignment" ||
                m.author === "system-status" ||
                m.author === "system-classification" ||
                m.author === "operator",
            )
            .map((m) => (
              <li key={m.id} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{systemLabel(m)}</div>
                  <div className="text-muted-foreground tabular-nums">{m.time}</div>
                </div>
              </li>
            ))}
        </ul>
        <button className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
          View full audit log
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </>
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
    <button className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-secondary">
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
    <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </h4>
  );
}

function NextAction({ label, hint }: { label: string; hint: string }) {
  return (
    <li>
      <button className="flex w-full items-start justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left hover:bg-surface-muted">
        <div className="min-w-0">
          <div className="text-xs font-medium">{label}</div>
          <div className="text-[11px] text-muted-foreground">{hint}</div>
        </div>
        <ArrowRight className="mt-1 h-3.5 w-3.5 text-muted-foreground" />
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
          ? "border-warning/30 text-warning-foreground dark:text-[var(--status-warning-text)]"
          : "border-primary/30 text-primary";
    return (
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <div
          className={`inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1 text-[11px] font-medium ${tone}`}
        >
          {message.body} · <span className="opacity-70 tabular-nums">{message.time}</span>
        </div>
        <div className="h-px flex-1 bg-border" />
      </div>
    );
  }

  // Internal note
  if (message.author === "internal-note") {
    return (
      <div className="rounded-xl border border-border border-l-[3px] border-l-warning bg-warning/8 p-3 shadow-soft">
        <div className="mb-2 flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-2 font-medium text-foreground">
            <StickyNote className="h-3 w-3 text-warning" />
            Internal note · {message.authorName}
          </span>
          <span className="tabular-nums text-muted-foreground">{message.time}</span>
        </div>
        <p className="text-sm text-foreground/90">{message.body}</p>
        <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
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
          <span className="tabular-nums">{message.time}</span>
        </div>
        <div
          className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-soft ${
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

/* ───────── Inbox sections panel ───────── */

function sectionGroupLabel(kind: SectionFilter["kind"]) {
  switch (kind) {
    case "inbox": return "Inbox";
    case "channel": return "Channels";
    case "ai": return "AI Review";
    case "operator": return "Operators";
    case "priority": return "Priority";
  }
}

type SectionRow = {
  label: string;
  filter: SectionFilter;
  icon?: typeof InboxIcon;
  badge?: string | number;
  badgeTone?: "primary" | "muted" | "warning" | "success" | "info";
  disabled?: boolean;
};

type SectionGroup = { id: SectionFilter["kind"]; title: string; rows: SectionRow[] };

const inboxSectionGroups: SectionGroup[] = [
  {
    id: "inbox",
    title: "Inbox",
    rows: [
      { label: "All conversations", filter: { kind: "inbox", value: "all", label: "All conversations" }, icon: InboxIcon, badge: 6 },
      { label: "New", filter: { kind: "inbox", value: "new", label: "New" }, icon: Sparkles, badge: 1, badgeTone: "info" },
      { label: "Unassigned", filter: { kind: "inbox", value: "unassigned", label: "Unassigned" }, icon: AlertTriangle, badge: 2, badgeTone: "warning" },
      { label: "Assigned to me", filter: { kind: "inbox", value: "assigned-me", label: "Assigned to me" }, icon: UserPlus, badge: 0 },
      { label: "Waiting for operator", filter: { kind: "inbox", value: "waiting", label: "Waiting for operator" }, icon: Clock, badge: 2, badgeTone: "warning" },
      { label: "Needs follow-up", filter: { kind: "inbox", value: "needs-followup", label: "Needs follow-up" }, icon: Flag, badge: 1, badgeTone: "primary" },
      { label: "Needs review", filter: { kind: "inbox", value: "needs-review", label: "Needs review" }, icon: FileSearch, badge: 1, badgeTone: "primary" },
      { label: "Overdue", filter: { kind: "inbox", value: "overdue", label: "Overdue" }, icon: AlertTriangle, badge: 2, badgeTone: "warning" },
      { label: "Closed", filter: { kind: "inbox", value: "closed", label: "Closed" }, icon: CheckCheck, badge: 1, badgeTone: "muted" },
    ],
  },
  {
    id: "channel",
    title: "Channels",
    rows: [
      { label: "Web Chat", filter: { kind: "channel", value: "webform", label: "Web Chat" }, icon: MessageSquare, badge: 3, badgeTone: "info" },
      { label: "Email", filter: { kind: "channel", value: "email", label: "Email" }, icon: MailIcon, badge: 5, badgeTone: "info" },
      { label: "Instagram DM", filter: { kind: "channel", value: "planned", label: "Instagram DM" }, icon: Instagram, badge: "Planned", badgeTone: "muted", disabled: true },
      { label: "WhatsApp", filter: { kind: "channel", value: "planned", label: "WhatsApp" }, icon: MessageCircle, badge: "Planned", badgeTone: "muted", disabled: true },
      { label: "Telegram", filter: { kind: "channel", value: "planned", label: "Telegram" }, icon: SendIcon, badge: "Planned", badgeTone: "muted", disabled: true },
      { label: "SMS", filter: { kind: "channel", value: "planned", label: "SMS" }, icon: Smartphone, badge: "Planned", badgeTone: "muted", disabled: true },
      { label: "Voice", filter: { kind: "channel", value: "future", label: "Voice" }, icon: PhoneCall, badge: "Future", badgeTone: "muted", disabled: true },
    ],
  },
  {
    id: "ai",
    title: "AI Review",
    rows: [
      { label: "Drafts pending review", filter: { kind: "ai", value: "pending", label: "Drafts pending review" }, icon: Sparkles, badge: 1, badgeTone: "primary" },
      { label: "Accepted drafts", filter: { kind: "ai", value: "accepted", label: "Accepted drafts" }, icon: CheckCircle2, badge: 0 },
      { label: "Rejected drafts", filter: { kind: "ai", value: "rejected", label: "Rejected drafts" }, icon: XCircle, badge: 0 },
      { label: "Needs source check", filter: { kind: "ai", value: "needs-source", label: "Needs source check" }, icon: FileSearch, badge: 0 },
    ],
  },
  {
    id: "operator",
    title: "Operators",
    rows: [
      { label: "Unassigned", filter: { kind: "operator", value: "unassigned", label: "Unassigned" }, badge: 2, badgeTone: "warning" },
      { label: "Priya Raman", filter: { kind: "operator", value: "u3", label: "Priya Raman" }, badge: 2 },
      { label: "Marcus Lee", filter: { kind: "operator", value: "u4", label: "Marcus Lee" }, badge: 1 },
      { label: "Daniel Cho", filter: { kind: "operator", value: "u2", label: "Daniel Cho" }, badge: 1 },
      { label: "Amelia Hart", filter: { kind: "operator", value: "u1", label: "Amelia Hart" }, badge: 0 },
    ],
  },
  {
    id: "priority",
    title: "Priority",
    rows: [
      { label: "Urgent", filter: { kind: "priority", value: "urgent", label: "Urgent" }, badge: 1, badgeTone: "warning" },
      { label: "High", filter: { kind: "priority", value: "high", label: "High" }, badge: 1, badgeTone: "primary" },
      { label: "Normal", filter: { kind: "priority", value: "normal", label: "Normal" }, badge: 2, badgeTone: "info" },
      { label: "Low", filter: { kind: "priority", value: "low", label: "Low" }, badge: 2, badgeTone: "muted" },
    ],
  },
];

const badgeToneClass: Record<NonNullable<SectionRow["badgeTone"]>, string> = {
  primary: "bg-primary-soft text-primary",
  muted: "bg-secondary text-muted-foreground",
  warning: "bg-warning/20 text-warning-foreground dark:text-[var(--status-warning-text)]",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
};

function isSameFilter(a: SectionFilter, b: SectionFilter) {
  return a.kind === b.kind && a.value === b.value && a.label === b.label;
}

function InboxSectionsPanel({
  selected,
  onSelect,
}: {
  selected: SectionFilter;
  onSelect: (s: SectionFilter) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          All filters
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 pt-2">
        {inboxSectionGroups.map((g) => (
          <div key={g.id} className="mt-3 first:mt-0">
            <div className="px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
              {g.title}
            </div>
            <ul className="space-y-px">
              {g.rows.map((row) => {
                const Icon = row.icon;
                const active = isSameFilter(selected, row.filter);
                return (
                  <li key={row.label}>
                    <button
                      disabled={row.disabled}
                      onClick={() => !row.disabled && onSelect(row.filter)}
                      className={`group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12.5px] transition ${
                        active
                          ? "bg-primary-soft text-primary font-medium"
                          : row.disabled
                          ? "text-muted-foreground/60 cursor-not-allowed"
                          : "text-foreground/85 hover:bg-secondary"
                      }`}
                    >
                      {Icon ? (
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      ) : (
                        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-secondary text-[8px] font-medium text-muted-foreground">
                          {row.label.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate">{row.label}</span>
                      {row.badge !== undefined && row.badge !== 0 && (
                        <span
                          className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-medium ${
                            badgeToneClass[row.badgeTone ?? "muted"]
                          }`}
                        >
                          {row.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
