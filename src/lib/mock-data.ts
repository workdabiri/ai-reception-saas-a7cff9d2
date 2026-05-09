export type ConvStatus = "open" | "pending" | "snoozed" | "closed";
export type Channel = "email" | "webform" | "sms" | "whatsapp" | "voice";

export const channelLabel: Record<Channel, string> = {
  email: "Email",
  webform: "Web form",
  sms: "SMS (planned)",
  whatsapp: "WhatsApp (planned)",
  voice: "Voice (planned)",
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Operator" | "Viewer";
  status: "Active" | "Invited";
  initials: string;
};

export const currentWorkspace = {
  id: "ws_1",
  name: "Northwind Dental",
  plan: "Mock workspace",
};

export const workspaces = [
  { id: "ws_1", name: "Northwind Dental" },
  { id: "ws_2", name: "Atlas Auto Service" },
  { id: "ws_3", name: "Lumen Wellness Studio" },
];

export const members: Member[] = [
  { id: "u1", name: "Amelia Hart", email: "amelia@northwind.co", role: "Owner", status: "Active", initials: "AH" },
  { id: "u2", name: "Daniel Cho", email: "daniel@northwind.co", role: "Admin", status: "Active", initials: "DC" },
  { id: "u3", name: "Priya Raman", email: "priya@northwind.co", role: "Operator", status: "Active", initials: "PR" },
  { id: "u4", name: "Marcus Lee", email: "marcus@northwind.co", role: "Operator", status: "Active", initials: "ML" },
  { id: "u5", name: "Sofia Alvarez", email: "sofia@northwind.co", role: "Viewer", status: "Invited", initials: "SA" },
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
      { id: "m2", author: "ai-draft", authorName: "AI draft", time: "10:43", body: "Hi Eleanor, of course — we have openings next Tuesday at 2:00pm or Wednesday at 10:30am. Which works best? — Northwind Dental" },
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

export const auditEvents = [
  { id: "a1", actor: "Amelia Hart", action: "Invited member", target: "sofia@northwind.co", time: "Today, 09:14" },
  { id: "a2", actor: "Daniel Cho", action: "Closed conversation", target: "Thank you · Hannah Berg", time: "Today, 08:51" },
  { id: "a3", actor: "Priya Raman", action: "Sent reply", target: "Invoice question · Naomi Tanaka", time: "Yesterday, 17:22" },
  { id: "a4", actor: "Amelia Hart", action: "Updated workspace name", target: "Northwind Dental", time: "Yesterday, 14:03" },
  { id: "a5", actor: "Marcus Lee", action: "Assigned conversation", target: "New patient questions → Marcus Lee", time: "Yesterday, 11:40" },
  { id: "a6", actor: "Priya Raman", action: "Snoozed conversation", target: "Forms before first visit", time: "Mon, 16:08" },
  { id: "a7", actor: "Amelia Hart", action: "Changed role", target: "Marcus Lee → Operator", time: "Last week" },
];
