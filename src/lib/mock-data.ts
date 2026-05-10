export type ConvStatus = "open" | "pending" | "snoozed" | "closed";
export type Channel =
  | "email"
  | "webform"
  | "web-chat"
  | "instagram"
  | "whatsapp"
  | "telegram"
  | "sms"
  | "voice";

// Extended chip statuses for the dashboard surface
export type ChipStatus =
  | "new"
  | "open"
  | "waiting"
  | "closed"
  | "needs-review"
  | "access-denied"
  | "future";

export const channelLabel: Record<Channel, string> = {
  email: "Email",
  webform: "Web form",
  "web-chat": "Web Chat",
  instagram: "Instagram DM",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  sms: "SMS",
  voice: "Voice",
};

export type ChannelStatus = "Mock Active" | "Planned" | "Future" | "Not enabled in MVP";
export type ChannelHealth = "ok" | "warn" | "off";

export type ChannelInfo = {
  id: Channel;
  name: string;
  status: ChannelStatus;
  health: ChannelHealth;
  unread: number;
  customers: number;
  waiting: number;
  lastMessage: string;
  hue: string; // brand-ish accent (oklch hue)
  short: string; // 2-letter glyph
};

export const channels: ChannelInfo[] = [
  { id: "web-chat",  name: "Web Chat",     status: "Mock Active",       health: "ok",   unread: 5, customers: 12, waiting: 2, lastMessage: "3 min ago",   hue: "175", short: "WC" },
  { id: "email",     name: "Email",        status: "Mock Active",       health: "ok",   unread: 8, customers: 18, waiting: 4, lastMessage: "12 min ago",  hue: "245", short: "EM" },
  { id: "instagram", name: "Instagram DM", status: "Planned",           health: "off",  unread: 3, customers: 7,  waiting: 1, lastMessage: "1 hr ago",    hue: "330", short: "IG" },
  { id: "whatsapp",  name: "WhatsApp",     status: "Planned",           health: "off",  unread: 2, customers: 5,  waiting: 1, lastMessage: "2 hr ago",    hue: "150", short: "WA" },
  { id: "telegram",  name: "Telegram",     status: "Planned",           health: "off",  unread: 0, customers: 2,  waiting: 0, lastMessage: "Yesterday",   hue: "215", short: "TG" },
  { id: "sms",       name: "SMS",          status: "Planned",           health: "off",  unread: 0, customers: 0,  waiting: 0, lastMessage: "—",           hue: "60",  short: "SMS" },
  { id: "voice",     name: "Voice",        status: "Future",            health: "off",  unread: 0, customers: 0,  waiting: 0, lastMessage: "—",           hue: "20",  short: "VO" },
];

export type WorkspaceRole = "Owner" | "Admin" | "Operator" | "Viewer";

export type Workspace = {
  id: string;
  name: string;
  industry: string;
  role: WorkspaceRole;
  status: "Active" | "Trial" | "Demo";
  initials: string;
  members: number;
  openConversations: number;
};

export const workspaces: Workspace[] = [
  {
    id: "ws_1",
    name: "Tehran Dental Clinic",
    industry: "Healthcare · Dental",
    role: "Owner",
    status: "Active",
    initials: "TD",
    members: 6,
    openConversations: 12,
  },
  {
    id: "ws_2",
    name: "Pars Repair Services",
    industry: "Field service",
    role: "Admin",
    status: "Active",
    initials: "PR",
    members: 4,
    openConversations: 7,
  },
  {
    id: "ws_3",
    name: "Noor Restaurant",
    industry: "Hospitality",
    role: "Operator",
    status: "Trial",
    initials: "NR",
    members: 3,
    openConversations: 3,
  },
  {
    id: "ws_4",
    name: "Demo Ecommerce Support",
    industry: "Retail · Demo",
    role: "Viewer",
    status: "Demo",
    initials: "DE",
    members: 2,
    openConversations: 5,
  },
];

export const currentWorkspace = workspaces[0];

export type Member = {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  status: "Active" | "Invited";
  initials: string;
};

export const members: Member[] = [
  { id: "u1", name: "Amelia Hart", email: "amelia@tehrandental.co", role: "Owner", status: "Active", initials: "AH" },
  { id: "u2", name: "Daniel Cho", email: "daniel@tehrandental.co", role: "Admin", status: "Active", initials: "DC" },
  { id: "u3", name: "Priya Raman", email: "priya@tehrandental.co", role: "Operator", status: "Active", initials: "PR" },
  { id: "u4", name: "Marcus Lee", email: "marcus@tehrandental.co", role: "Operator", status: "Active", initials: "ML" },
  { id: "u5", name: "Sofia Alvarez", email: "sofia@tehrandental.co", role: "Viewer", status: "Invited", initials: "SA" },
];

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  lastSeen: string;
  conversations: number;
  initials: string;
};

export const customers: Customer[] = [
  { id: "c1", name: "Eleanor Whitfield", email: "eleanor.w@gmail.com", phone: "+1 (415) 555-0142", tags: ["VIP", "Returning"], lastSeen: "12 min ago", conversations: 8, initials: "EW" },
  { id: "c2", name: "Jonas Reuter", email: "j.reuter@hey.com", phone: "+49 30 5550 8821", tags: ["New"], lastSeen: "1 hr ago", conversations: 1, initials: "JR" },
  { id: "c3", name: "Naomi Tanaka", email: "naomi.t@outlook.com", phone: "+81 90 5550 1133", tags: ["Returning"], lastSeen: "3 hr ago", conversations: 4, initials: "NT" },
  { id: "c4", name: "Carlos Mendes", email: "carlos.m@proton.me", phone: "+55 11 95550 4422", tags: ["Lead"], lastSeen: "Yesterday", conversations: 2, initials: "CM" },
  { id: "c5", name: "Hannah Berg", email: "hannah.berg@me.com", phone: "+47 400 55 991", tags: ["VIP"], lastSeen: "2 days ago", conversations: 12, initials: "HB" },
  { id: "c6", name: "Owen Fitzgerald", email: "owen.f@gmail.com", phone: "+353 87 555 0099", tags: [], lastSeen: "4 days ago", conversations: 1, initials: "OF" },
];

export type ThreadKind =
  | "customer"
  | "operator"
  | "ai-draft"
  | "internal-note"
  | "system-assignment"
  | "system-status"
  | "system-classification";

export type Message = {
  id: string;
  author: ThreadKind;
  authorName: string;
  body: string;
  time: string;
};

export type Priority = "low" | "normal" | "high" | "urgent";
export type InboxStatus = "new" | "open" | "waiting" | "needs-followup" | "closed";

export type Conversation = {
  id: string;
  customerId: string;
  subject: string;
  preview: string;
  channel: Channel;
  status: ConvStatus;
  inboxStatus: InboxStatus;
  priority: Priority;
  classification?: string;
  assignee?: string;
  unread: boolean;
  updated: string;
  messages: Message[];
};

export const conversations: Conversation[] = [
  {
    id: "cv1",
    customerId: "c1",
    subject: "Reschedule Thursday cleaning",
    preview: "Hi — could we move my Thursday 3pm cleaning to next week if possible?",
    channel: "email",
    status: "open",
    inboxStatus: "needs-followup",
    priority: "high",
    classification: "Scheduling",
    assignee: "u3",
    unread: true,
    updated: "12 min",
    messages: [
      { id: "m1", author: "customer", authorName: "Eleanor Whitfield", time: "Today · 10:42", body: "Hi — could we move my Thursday 3pm cleaning to next week if possible? Something came up at work." },
      { id: "m2", author: "system-classification", authorName: "System", time: "Today · 10:42", body: "Classified as Scheduling · priority High" },
      { id: "m3", author: "system-assignment", authorName: "System", time: "Today · 10:43", body: "Assigned to Priya Raman" },
      { id: "m4", author: "ai-draft", authorName: "AI draft", time: "Today · 10:43", body: "Hi Eleanor, of course — we have openings next Tuesday at 2:00pm or Wednesday at 10:30am. Which works best? — Tehran Dental Clinic" },
      { id: "m5", author: "internal-note", authorName: "Priya Raman", time: "Today · 10:46", body: "She prefers mornings. I'll suggest Wed 10:30am first and hold Tue 2pm as backup." },
    ],
  },
  {
    id: "cv2",
    customerId: "c2",
    subject: "New patient — insurance question",
    preview: "Hello, I'm new to the area and wondering if you accept Aetna…",
    channel: "webform",
    status: "open",
    inboxStatus: "new",
    priority: "normal",
    classification: "Billing",
    assignee: "u4",
    unread: true,
    updated: "38 min",
    messages: [
      { id: "m1", author: "customer", authorName: "Jonas Reuter", time: "Today · 10:12", body: "Hello, I'm new to the area and wondering if you accept Aetna and what a first cleaning would cost." },
      { id: "m2", author: "system-classification", authorName: "System", time: "Today · 10:12", body: "Classified as Billing · priority Normal" },
      { id: "m3", author: "system-assignment", authorName: "System", time: "Today · 10:13", body: "Assigned to Marcus Lee" },
    ],
  },
  {
    id: "cv3",
    customerId: "c3",
    subject: "Invoice double-charge",
    preview: "Got my invoice — I think the fluoride was charged twice.",
    channel: "email",
    status: "pending",
    inboxStatus: "waiting",
    priority: "urgent",
    classification: "Billing dispute",
    assignee: "u3",
    unread: false,
    updated: "2 hr",
    messages: [
      { id: "m1", author: "customer", authorName: "Naomi Tanaka", time: "Today · 08:55", body: "Got my invoice — I think the fluoride was charged twice. Could someone double check?" },
      { id: "m2", author: "system-classification", authorName: "System", time: "Today · 08:55", body: "Classified as Billing dispute · priority Urgent" },
      { id: "m3", author: "operator", authorName: "Priya R.", time: "Today · 09:14", body: "Hi Naomi — checking with billing now and will get back today." },
      { id: "m4", author: "system-status", authorName: "System", time: "Today · 09:14", body: "Status changed to Waiting on internal review" },
      { id: "m5", author: "internal-note", authorName: "Priya Raman", time: "Today · 09:18", body: "Pinged Daniel to pull the ledger entry. Likely a duplicate from the rebooking last week." },
    ],
  },
  {
    id: "cv4",
    customerId: "c4",
    subject: "Whitening consultation",
    preview: "What's the price range for whitening?",
    channel: "webform",
    status: "open",
    inboxStatus: "open",
    priority: "normal",
    classification: "Sales",
    unread: false,
    updated: "Yesterday",
    messages: [
      { id: "m1", author: "customer", authorName: "Carlos Mendes", time: "Yesterday · 16:20", body: "What's the price range for whitening? Also do you offer payment plans?" },
      { id: "m2", author: "system-classification", authorName: "System", time: "Yesterday · 16:20", body: "Classified as Sales · priority Normal" },
    ],
  },
  {
    id: "cv5",
    customerId: "c5",
    subject: "Thank you",
    preview: "Just wanted to say Dr. Park was wonderful with my son today.",
    channel: "email",
    status: "closed",
    inboxStatus: "closed",
    priority: "low",
    classification: "Feedback",
    assignee: "u2",
    unread: false,
    updated: "2 days",
    messages: [
      { id: "m1", author: "customer", authorName: "Hannah Berg", time: "Mon · 14:02", body: "Just wanted to say Dr. Park was wonderful with my son today. Thank you!" },
      { id: "m2", author: "operator", authorName: "Daniel C.", time: "Mon · 14:18", body: "Hannah, this made our day — passing along to Dr. Park. ❤️" },
      { id: "m3", author: "system-status", authorName: "System", time: "Mon · 14:19", body: "Conversation closed by Daniel Cho" },
    ],
  },
  {
    id: "cv6",
    customerId: "c6",
    subject: "Forms before first visit",
    preview: "Where do I find the new patient forms?",
    channel: "webform",
    status: "snoozed",
    inboxStatus: "waiting",
    priority: "low",
    classification: "Onboarding",
    unread: false,
    updated: "4 days",
    messages: [
      { id: "m1", author: "customer", authorName: "Owen Fitzgerald", time: "Wed · 09:30", body: "Where do I find the new patient forms?" },
    ],
  },
];

// --- Dashboard-specific mock datasets ---

export type QueueItem = {
  id: string;
  customer: string;
  initials: string;
  subject: string;
  channel: Channel;
  status: ChipStatus;
  waiting: string;
  assignee?: string;
};

export const todaysQueue: QueueItem[] = [
  { id: "q1", customer: "Eleanor Whitfield", initials: "EW", subject: "Reschedule Thursday cleaning", channel: "email", status: "needs-review", waiting: "12 min", assignee: "Priya R." },
  { id: "q2", customer: "Jonas Reuter", initials: "JR", subject: "New patient — insurance question", channel: "webform", status: "waiting", waiting: "38 min", assignee: "Marcus L." },
  { id: "q3", customer: "Naomi Tanaka", initials: "NT", subject: "Invoice double-charge", channel: "email", status: "open", waiting: "2 hr", assignee: "Priya R." },
  { id: "q4", customer: "Carlos Mendes", initials: "CM", subject: "Whitening consultation", channel: "webform", status: "new", waiting: "—", assignee: undefined },
  { id: "q5", customer: "Owen Fitzgerald", initials: "OF", subject: "Forms before first visit", channel: "webform", status: "waiting", waiting: "4 d", assignee: undefined },
];

export type RecentMessage = {
  id: string;
  customer: string;
  initials: string;
  snippet: string;
  channel: Channel;
  time: string;
};

export const recentMessages: RecentMessage[] = [
  { id: "rm1", customer: "Eleanor Whitfield", initials: "EW", snippet: "Could we move my Thursday 3pm cleaning to next week?", channel: "email", time: "12 min" },
  { id: "rm2", customer: "Jonas Reuter", initials: "JR", snippet: "Do you accept Aetna and what does a first cleaning cost?", channel: "webform", time: "38 min" },
  { id: "rm3", customer: "Naomi Tanaka", initials: "NT", snippet: "I think the fluoride was charged twice on my invoice.", channel: "email", time: "2 hr" },
  { id: "rm4", customer: "Carlos Mendes", initials: "CM", snippet: "What's the price range for whitening? Payment plans?", channel: "webform", time: "Yesterday" },
];

export type OperatorLoad = {
  id: string;
  name: string;
  initials: string;
  role: WorkspaceRole;
  open: number;
  drafts: number;
  resolvedToday: number;
};

export const operatorLoad: OperatorLoad[] = [
  { id: "u3", name: "Priya Raman", initials: "PR", role: "Operator", open: 6, drafts: 3, resolvedToday: 8 },
  { id: "u4", name: "Marcus Lee", initials: "ML", role: "Operator", open: 4, drafts: 2, resolvedToday: 5 },
  { id: "u2", name: "Daniel Cho", initials: "DC", role: "Admin", open: 2, drafts: 1, resolvedToday: 3 },
  { id: "u1", name: "Amelia Hart", initials: "AH", role: "Owner", open: 1, drafts: 0, resolvedToday: 2 },
];

export type DraftReview = {
  id: string;
  customer: string;
  initials: string;
  subject: string;
  draft: string;
  confidence: "High" | "Medium" | "Low";
  prepared: string;
};

export const draftQueue: DraftReview[] = [
  { id: "d1", customer: "Eleanor Whitfield", initials: "EW", subject: "Reschedule Thursday cleaning", draft: "Hi Eleanor, of course — we have openings next Tuesday at 2:00pm or Wednesday at 10:30am…", confidence: "High", prepared: "1 min ago" },
  { id: "d2", customer: "Jonas Reuter", initials: "JR", subject: "New patient — insurance", draft: "Hi Jonas, welcome! Yes, we accept Aetna PPO. A first cleaning typically runs $120–$160…", confidence: "Medium", prepared: "5 min ago" },
  { id: "d3", customer: "Carlos Mendes", initials: "CM", subject: "Whitening consultation", draft: "Hi Carlos, professional whitening starts at $290. We also offer 3-month payment plans…", confidence: "Medium", prepared: "22 min ago" },
];

export type AuditActorType = "User" | "System" | "AI Receptionist";
export type AuditResult = "Success" | "Denied" | "Failed";
export type AuditAction =
  | "member.invited"
  | "member.role_changed"
  | "member.removed"
  | "conversation.assigned"
  | "conversation.closed"
  | "settings.updated"
  | "access.denied"
  | "workspace.switched"
  | "ai.draft_approved"
  | "ai.draft_rejected"
  | "export.blocked";

export type AuditEvent = {
  id: string;
  time: string;
  iso: string;
  actor: string;
  actorType: AuditActorType;
  workspace: string;
  action: AuditAction;
  actionLabel: string;
  target: string;
  result: AuditResult;
  details: string;
  metadata: Record<string, string>;
};

export const auditEvents: AuditEvent[] = [
  {
    id: "a1",
    time: "Today · 09:14",
    iso: "2026-05-10T09:14:00Z",
    actor: "Amelia Hart",
    actorType: "User",
    workspace: "Tehran Dental Clinic",
    action: "member.invited",
    actionLabel: "Member invited",
    target: "sofia@tehrandental.co",
    result: "Success",
    details: "Invited as Viewer. Invitation pending acceptance.",
    metadata: { role: "Viewer", "invite.id": "inv_8f21", "ip": "73.14.22.10" },
  },
  {
    id: "a2",
    time: "Today · 08:51",
    iso: "2026-05-10T08:51:00Z",
    actor: "Daniel Cho",
    actorType: "User",
    workspace: "Tehran Dental Clinic",
    action: "conversation.closed",
    actionLabel: "Conversation closed",
    target: "Thank you · Hannah Berg",
    result: "Success",
    details: "Marked as resolved after one-touch reply.",
    metadata: { "conversation.id": "cv5", priority: "low" },
  },
  {
    id: "a3",
    time: "Today · 08:30",
    iso: "2026-05-10T08:30:00Z",
    actor: "AI Receptionist",
    actorType: "AI Receptionist",
    workspace: "Tehran Dental Clinic",
    action: "ai.draft_approved",
    actionLabel: "AI draft approved",
    target: "Reschedule Thursday cleaning · Eleanor Whitfield",
    result: "Success",
    details: "Operator Priya Raman accepted AI draft and sent the final reply.",
    metadata: { "conversation.id": "cv1", confidence: "High", "reviewer": "Priya Raman" },
  },
  {
    id: "a4",
    time: "Yesterday · 17:22",
    iso: "2026-05-09T17:22:00Z",
    actor: "Amelia Hart",
    actorType: "User",
    workspace: "Tehran Dental Clinic",
    action: "member.role_changed",
    actionLabel: "Role changed",
    target: "Marcus Lee · Operator → Admin",
    result: "Success",
    details: "Role updated. Member retains access to all assigned conversations.",
    metadata: { from: "Operator", to: "Admin", "member.id": "u4" },
  },
  {
    id: "a5",
    time: "Yesterday · 15:40",
    iso: "2026-05-09T15:40:00Z",
    actor: "System",
    actorType: "System",
    workspace: "Tehran Dental Clinic",
    action: "access.denied",
    actionLabel: "Access denied",
    target: "Viewer attempted to export customer list",
    result: "Denied",
    details: "Server-side membership check rejected the request. Client-side hint was a UX safeguard only.",
    metadata: { "policy": "viewer.cannot_export", "member.id": "u5" },
  },
  {
    id: "a6",
    time: "Yesterday · 11:40",
    iso: "2026-05-09T11:40:00Z",
    actor: "System",
    actorType: "System",
    workspace: "Tehran Dental Clinic",
    action: "conversation.assigned",
    actionLabel: "Conversation assigned",
    target: "New patient — insurance question → Marcus Lee",
    result: "Success",
    details: "Round-robin routing assigned the conversation to next available operator.",
    metadata: { "conversation.id": "cv2", routing: "round-robin" },
  },
  {
    id: "a7",
    time: "Yesterday · 10:55",
    iso: "2026-05-09T10:55:00Z",
    actor: "Amelia Hart",
    actorType: "User",
    workspace: "Tehran Dental Clinic",
    action: "settings.updated",
    actionLabel: "Settings updated",
    target: "Reception · Manual review mode",
    result: "Success",
    details: "Manual review mode confirmed enabled. Auto-reply remains disabled.",
    metadata: { setting: "reception.manual_review", value: "enabled" },
  },
  {
    id: "a8",
    time: "Yesterday · 09:02",
    iso: "2026-05-09T09:02:00Z",
    actor: "Priya Raman",
    actorType: "User",
    workspace: "Pars Repair Services",
    action: "workspace.switched",
    actionLabel: "Workspace switched",
    target: "Tehran Dental Clinic → Pars Repair Services",
    result: "Success",
    details: "Operator switched active workspace. Cross-workspace data was not exposed.",
    metadata: { from: "ws_1", to: "ws_2" },
  },
  {
    id: "a9",
    time: "2 days ago · 14:18",
    iso: "2026-05-08T14:18:00Z",
    actor: "System",
    actorType: "System",
    workspace: "Tehran Dental Clinic",
    action: "export.blocked",
    actionLabel: "Export blocked",
    target: "Cross-workspace export attempt",
    result: "Failed",
    details: "Export request referenced a workspace the actor is not a member of. Request rejected before any data was read.",
    metadata: { "requested.workspace": "ws_4", "actor.workspace": "ws_1" },
  },
  {
    id: "a10",
    time: "2 days ago · 10:11",
    iso: "2026-05-08T10:11:00Z",
    actor: "Amelia Hart",
    actorType: "User",
    workspace: "Tehran Dental Clinic",
    action: "member.removed",
    actionLabel: "Member removed",
    target: "alex@tehrandental.co",
    result: "Success",
    details: "Member access revoked. Server invalidates active sessions on next request.",
    metadata: { "member.id": "u_old_07" },
  },
];
