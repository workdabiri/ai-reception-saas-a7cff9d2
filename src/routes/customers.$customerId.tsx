import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Avatar, PageHeader } from "@/components/ui-bits";
import {
  customers,
  conversations,
  members,
  channelLabel,
  type InboxStatus,
  type Message,
} from "@/lib/mock-data";
import {
  Mail,
  Phone,
  Shield,
  StickyNote,
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  Clock,
  Tag,
  Plus,
  Lock,
  Inbox as InboxIcon,
} from "lucide-react";

export const Route = createFileRoute("/customers/$customerId")({
  head: ({ params }) => {
    const c = customers.find((x) => x.id === params.customerId);
    const name = c?.name ?? "Customer";
    return {
      meta: [
        { title: `${name} — Customers — AI Reception` },
        { name: "description", content: `Reception profile for ${name}.` },
      ],
    };
  },
  loader: ({ params }) => {
    const customer = customers.find((c) => c.id === params.customerId);
    if (!customer) throw notFound();
    return { customer };
  },
  notFoundComponent: () => (
    <>
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-xl font-semibold">Customer not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This profile doesn't exist in the current workspace.
        </p>
        <Link
          to="/customers"
          className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
        </Link>
      </div>
    </>
  ),
  component: CustomerProfilePage,
});

const statusLabel: Record<InboxStatus, string> = {
  new: "New",
  open: "Open",
  waiting: "Waiting",
  "needs-followup": "Needs follow-up",
  closed: "Closed",
};

const statusTone: Record<InboxStatus, string> = {
  new: "bg-secondary text-secondary-foreground border-border",
  open: "bg-info/10 text-info border-info/25",
  waiting: "bg-warning/12 text-warning-foreground border-warning/30",
  "needs-followup": "bg-attention/12 text-attention border-attention/30",
  closed: "bg-success/8 text-success/85 border-success/20",
};

// Mock internal notes per customer (kept here to stay UI-only)
const mockNotesByCustomer: Record<string, { id: string; author: string; time: string; body: string }[]> = {
  c1: [
    { id: "n1", author: "Priya Raman", time: "Today · 10:46", body: "Prefers morning appointments. Sensitive about scheduling changes." },
    { id: "n2", author: "Daniel Cho", time: "Last week", body: "VIP — long-time patient, family of four also booked here." },
  ],
  c3: [
    { id: "n1", author: "Priya Raman", time: "Today · 09:18", body: "Billing dispute — pinged Daniel for ledger review." },
  ],
};

function CustomerProfilePage() {
  const { customer } = Route.useLoaderData();
  const linked = conversations.filter((c) => c.customerId === customer.id);
  const notes = mockNotesByCustomer[customer.id] ?? [];

  // Recent messages (customer-authored, latest first)
  const recentMessages = linked
    .flatMap((c) =>
      c.messages
        .filter((m) => m.author === "customer" || m.author === "operator")
        .map((m) => ({ ...m, conversationId: c.id, subject: c.subject })),
    )
    .slice(0, 6);

  // Timeline = audit-related events across this customer's conversations
  const timeline = linked
    .flatMap((c) =>
      c.messages
        .filter(
          (m) =>
            m.author === "system-assignment" ||
            m.author === "system-status" ||
            m.author === "system-classification" ||
            m.author === "operator",
        )
        .map((m) => ({ ...m, conversationId: c.id, subject: c.subject })),
    )
    .reverse()
    .slice(0, 8);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <Link
          to="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Customers
        </Link>

        <div className="mt-3">
          <PageHeader
            title={customer.name}
            description={`${linked.length} conversation${linked.length === 1 ? "" : "s"} · last seen ${customer.lastSeen}`}
            action={
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                  <Tag className="h-3.5 w-3.5" /> Manage tags
                </button>
                <Link
                  to="/inbox"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-95"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Open in inbox
                </Link>
              </div>
            }
          />
        </div>

        {/* Visibility warning */}
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[12px] text-warning-foreground">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <span className="font-semibold">Visible only inside this workspace.</span>{" "}
            Customer data and notes are workspace-scoped to permitted members. Mock data —
            no real PII shown.
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar: identity + tags + notes */}
          <aside className="space-y-6">
            <Card>
              <div className="flex items-center gap-3">
                <Avatar initials={customer.initials} tone="primary" />
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">{customer.name}</h2>
                  <p className="text-xs text-muted-foreground">Reception contact</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <ContactRow icon={Mail} value={customer.email} note="primary" />
                <ContactRow icon={Phone} value={customer.phone} note="placeholder" />
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <SectionTitle>Tags</SectionTitle>
                <div className="mt-2 flex flex-wrap gap-1">
                  {customer.tags.length === 0 && (
                    <span className="text-xs text-muted-foreground">No tags yet.</span>
                  )}
                  {customer.tags.map((t: string) => (
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
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <SectionTitle>Internal notes</SectionTitle>
                <button className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                  <Plus className="h-3 w-3" /> Add note
                </button>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Lock className="h-3 w-3" />
                Private to this workspace · never shared with the customer
              </div>
              <ul className="mt-3 space-y-2">
                {notes.length === 0 && (
                  <li className="rounded-lg border border-dashed border-border bg-surface-muted/40 px-3 py-4 text-center text-xs text-muted-foreground">
                    No notes yet. Add context your team should know.
                  </li>
                )}
                {notes.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning-foreground"
                  >
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <StickyNote className="h-3 w-3" />
                        {n.author}
                      </span>
                      <span className="opacity-70">{n.time}</span>
                    </div>
                    <p className="leading-snug">{n.body}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>

          {/* Main: linked convos + recent messages + timeline */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between">
                <SectionTitle>Linked conversations</SectionTitle>
                <span className="text-[11px] text-muted-foreground">{linked.length} total</span>
              </div>
              {linked.length === 0 ? (
                <div className="mt-3 grid place-items-center rounded-lg border border-dashed border-border bg-surface-muted/40 px-6 py-10 text-center">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground">
                    <InboxIcon className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-xs font-semibold">No linked conversations</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    New messages from this customer will appear here.
                  </p>
                </div>
              ) : (
                <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
                  {linked.map((c) => {
                    const a = c.assignee
                      ? members.find((m) => m.id === c.assignee)?.name
                      : null;
                    return (
                      <li key={c.id}>
                        <Link
                          to="/inbox"
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-muted"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{c.subject}</div>
                            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              {channelLabel[c.channel]} · {c.updated} ·{" "}
                              {a ? `Assigned to ${a}` : "Unassigned"}
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${statusTone[c.inboxStatus]}`}
                          >
                            {statusLabel[c.inboxStatus]}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card>
              <SectionTitle>Recent messages</SectionTitle>
              {recentMessages.length === 0 ? (
                <EmptyInline text="No recent messages." />
              ) : (
                <ul className="mt-3 space-y-2">
                  {recentMessages.map((m) => (
                    <li
                      key={`${m.conversationId}-${m.id}`}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                          <MessageBadge author={m.author} />
                          {m.authorName}
                        </span>
                        <span>{m.time}</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground/90">
                        {m.body}
                      </p>
                      <div className="mt-2 truncate text-[11px] text-muted-foreground">
                        in <span className="font-medium text-foreground">{m.subject}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <SectionTitle>Timeline</SectionTitle>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Audit-related events for this customer (workspace-scoped).
              </div>
              {timeline.length === 0 ? (
                <EmptyInline text="No activity yet." />
              ) : (
                <ol className="relative mt-4 space-y-4 border-l border-border pl-5">
                  {timeline.map((e) => (
                    <li key={`${e.conversationId}-${e.id}`} className="relative">
                      <span className="absolute -left-[22px] top-1 grid h-3 w-3 place-items-center rounded-full bg-card ring-2 ring-border">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {e.time}
                      </div>
                      <div className="mt-0.5 text-sm">
                        {timelineLabel(e)}{" "}
                        <span className="text-muted-foreground">in {e.subject}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function timelineLabel(m: Message) {
  if (m.author === "operator") return `${m.authorName} sent a reply`;
  return m.body;
}

function MessageBadge({ author }: { author: Message["author"] }) {
  if (author === "operator")
    return (
      <span className="rounded-sm bg-primary/15 px-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
        Op
      </span>
    );
  return (
    <span className="rounded-sm bg-secondary px-1 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">
      Cust
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">{children}</div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}

function ContactRow({
  icon: Icon,
  value,
  note,
}: {
  icon: typeof Mail;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="truncate">{value}</span>
      {note && (
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
          {note}
        </span>
      )}
    </div>
  );
}

function EmptyInline({ text }: { text: string }) {
  return (
    <div className="mt-3 rounded-lg border border-dashed border-border bg-surface-muted/40 px-4 py-6 text-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}
