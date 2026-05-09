export type ConvStatus = "open" | "pending" | "snoozed" | "closed";
export type Channel = "email" | "webform" | "sms" | "whatsapp" | "voice";

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
  sms: "SMS (planned)",
  whatsapp: "WhatsApp (planned)",
  voice: "Voice (planned)",
};

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

export type Message = {
  id: string;
  author: "customer" | "operator" | "ai-draft";
  authorName: string;
  body: string;
  time: string;
};

export type Conversation = {
  id: string;
  customerId: string;
  subject: string;
  preview: string;
  channel: Channel;
  status: ConvStatus;
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
    assignee: "u3",
    unread: true,
    updated: "12 min",
    messages: [
      { id: "m1", author: "customer", authorName: "Eleanor Whitfield", time: "10:42", body: "Hi — could we move my Thursday 3pm cleaning to next week if possible? Something came up at work." },
      { id: "m2", author: "ai-draft", authorName: "AI draft", time: "10:43", body: "Hi Eleanor, of course — we have openings next Tuesday at 2:00pm or Wednesday at 10:30am. Which works best? — Tehran Dental Clinic" },
    ],
  },
  {
    id: "cv2",
    customerId: "c2",
    subject: "New patient questions",
    preview: "Hello, I'm new to the area and wondering if you accept Aetna…",
    channel: "webform",
    status: "open",
    assignee: "u4",
    unread: true,
    updated: "38 min",
    messages: [
      { id: "m1", author: "customer", authorName: "Jonas Reuter", time: "10:12", body: "Hello, I'm new to the area and wondering if you accept Aetna and what a first cleaning would cost." },
    ],
  },
  {
    id: "cv3",
    customerId: "c3",
    subject: "Invoice question",
    preview: "Got my invoice — I think the fluoride was charged twice.",
    channel: "email",
    status: "pending",
    assignee: "u3",
    unread: false,
    updated: "2 hr",
    messages: [
      { id: "m1", author: "customer", authorName: "Naomi Tanaka", time: "08:55", body: "Got my invoice — I think the fluoride was charged twice. Could someone double check?" },
      { id: "m2", author: "operator", authorName: "Priya R.", time: "09:14", body: "Hi Naomi — checking with billing now and will get back today." },
    ],
  },
  {
    id: "cv4",
    customerId: "c4",
    subject: "Whitening consultation",
    preview: "What's the price range for whitening?",
    channel: "webform",
    status: "open",
    unread: false,
    updated: "Yesterday",
    messages: [
      { id: "m1", author: "customer", authorName: "Carlos Mendes", time: "Yesterday", body: "What's the price range for whitening? Also do you offer payment plans?" },
    ],
  },
  {
    id: "cv5",
    customerId: "c5",
    subject: "Thank you",
    preview: "Just wanted to say Dr. Park was wonderful with my son today.",
    channel: "email",
    status: "closed",
    assignee: "u2",
    unread: false,
    updated: "2 days",
    messages: [
      { id: "m1", author: "customer", authorName: "Hannah Berg", time: "Mon", body: "Just wanted to say Dr. Park was wonderful with my son today. Thank you!" },
      { id: "m2", author: "operator", authorName: "Daniel C.", time: "Mon", body: "Hannah, this made our day — passing along to Dr. Park. ❤️" },
    ],
  },
  {
    id: "cv6",
    customerId: "c6",
    subject: "Forms before first visit",
    preview: "Where do I find the new patient forms?",
    channel: "webform",
    status: "snoozed",
    unread: false,
    updated: "4 days",
    messages: [
      { id: "m1", author: "customer", authorName: "Owen Fitzgerald", time: "Wed", body: "Where do I find the new patient forms?" },
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

export const auditEvents = [
  { id: "a1", actor: "Amelia Hart", action: "Invited member", target: "sofia@tehrandental.co", time: "Today, 09:14", tone: "open" as ChipStatus },
  { id: "a2", actor: "Daniel Cho", action: "Closed conversation", target: "Thank you · Hannah Berg", time: "Today, 08:51", tone: "closed" as ChipStatus },
  { id: "a3", actor: "Priya Raman", action: "Sent reply", target: "Invoice question · Naomi Tanaka", time: "Yesterday, 17:22", tone: "open" as ChipStatus },
  { id: "a4", actor: "System", action: "Blocked export attempt", target: "Viewer tried to export customer list", time: "Yesterday, 15:40", tone: "access-denied" as ChipStatus },
  { id: "a5", actor: "Marcus Lee", action: "Assigned conversation", target: "New patient questions → Marcus Lee", time: "Yesterday, 11:40", tone: "waiting" as ChipStatus },
  { id: "a6", actor: "Priya Raman", action: "Edited AI draft", target: "Reschedule Thursday cleaning", time: "Yesterday, 10:55", tone: "needs-review" as ChipStatus },
];
