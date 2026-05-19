// Mock data for the Platform Admin surface (TASK-UX-011).
// 100% static — no persistence, no APIs, no real customer data.

export type AdminPlan = "Starter" | "Growth" | "Scale" | "Trial";
export type AdminStatus = "active" | "trial" | "suspended" | "invited";
export type UsageStatus = "healthy" | "approaching" | "over";
export type RiskLevel = "low" | "medium" | "high";

export type AdminBusiness = {
  id: string;
  name: string;
  owner: string;
  ownerEmail: string;
  plan: AdminPlan;
  status: AdminStatus;
  createdAt: string;
  membersCount: number;
  channels: string[];
  conversationsThisMonth: number;
  aiDraftsThisMonth: number;
  tokensThisMonth: number;
  quotaUsedPct: number;
  usageStatus: UsageStatus;
  lastActivity: string;
  riskLevel: RiskLevel;
};

export const adminBusinesses: AdminBusiness[] = [
  {
    id: "tehran-dental-clinic",
    name: "Tehran Dental Clinic",
    owner: "Dr. Niloofar Karimi",
    ownerEmail: "niloofar@tehrandental.example",
    plan: "Growth",
    status: "active",
    createdAt: "2025-09-12",
    membersCount: 6,
    channels: ["web-chat", "email"],
    conversationsThisMonth: 412,
    aiDraftsThisMonth: 287,
    tokensThisMonth: 184_200,
    quotaUsedPct: 62,
    usageStatus: "healthy",
    lastActivity: "12 min ago",
    riskLevel: "low",
  },
  {
    id: "pars-repair-services",
    name: "Pars Repair Services",
    owner: "Amir Shahbazi",
    ownerEmail: "amir@parsrepair.example",
    plan: "Starter",
    status: "active",
    createdAt: "2025-10-04",
    membersCount: 3,
    channels: ["web-chat"],
    conversationsThisMonth: 198,
    aiDraftsThisMonth: 142,
    tokensThisMonth: 96_400,
    quotaUsedPct: 88,
    usageStatus: "approaching",
    lastActivity: "1 hr ago",
    riskLevel: "medium",
  },
  {
    id: "noor-restaurant",
    name: "Noor Restaurant",
    owner: "Sara Tehrani",
    ownerEmail: "sara@noorrestaurant.example",
    plan: "Growth",
    status: "active",
    createdAt: "2025-08-22",
    membersCount: 8,
    channels: ["web-chat", "email"],
    conversationsThisMonth: 723,
    aiDraftsThisMonth: 511,
    tokensThisMonth: 321_700,
    quotaUsedPct: 104,
    usageStatus: "over",
    lastActivity: "4 min ago",
    riskLevel: "high",
  },
  {
    id: "demo-ecommerce-support",
    name: "Demo Ecommerce Support",
    owner: "Reza Mahdavi",
    ownerEmail: "reza@demo-ecom.example",
    plan: "Trial",
    status: "trial",
    createdAt: "2026-05-02",
    membersCount: 2,
    channels: ["web-chat"],
    conversationsThisMonth: 31,
    aiDraftsThisMonth: 18,
    tokensThisMonth: 9_800,
    quotaUsedPct: 14,
    usageStatus: "healthy",
    lastActivity: "yesterday",
    riskLevel: "low",
  },
  {
    id: "atlas-legal-office",
    name: "Atlas Legal Office",
    owner: "Maryam Hosseini",
    ownerEmail: "maryam@atlaslegal.example",
    plan: "Scale",
    status: "suspended",
    createdAt: "2025-06-18",
    membersCount: 11,
    channels: ["web-chat", "email"],
    conversationsThisMonth: 0,
    aiDraftsThisMonth: 0,
    tokensThisMonth: 0,
    quotaUsedPct: 0,
    usageStatus: "healthy",
    lastActivity: "9 days ago",
    riskLevel: "medium",
  },
];

export const getAdminBusiness = (id: string) => adminBusinesses.find((b) => b.id === id);

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Operator" | "Viewer";
  workspace: string;
  workspaceId: string;
  status: "active" | "invited" | "suspended";
  lastActive: string;
  joinedAt: string;
};

export const adminUsers: AdminUser[] = [
  {
    id: "u1",
    name: "Dr. Niloofar Karimi",
    email: "niloofar@tehrandental.example",
    role: "Owner",
    workspace: "Tehran Dental Clinic",
    workspaceId: "tehran-dental-clinic",
    status: "active",
    lastActive: "12 min ago",
    joinedAt: "2025-09-12",
  },
  {
    id: "u2",
    name: "Mehdi Rahmani",
    email: "mehdi@tehrandental.example",
    role: "Admin",
    workspace: "Tehran Dental Clinic",
    workspaceId: "tehran-dental-clinic",
    status: "active",
    lastActive: "2 hr ago",
    joinedAt: "2025-09-15",
  },
  {
    id: "u3",
    name: "Leila Saberi",
    email: "leila@tehrandental.example",
    role: "Operator",
    workspace: "Tehran Dental Clinic",
    workspaceId: "tehran-dental-clinic",
    status: "active",
    lastActive: "1 hr ago",
    joinedAt: "2025-09-20",
  },
  {
    id: "u4",
    name: "Amir Shahbazi",
    email: "amir@parsrepair.example",
    role: "Owner",
    workspace: "Pars Repair Services",
    workspaceId: "pars-repair-services",
    status: "active",
    lastActive: "1 hr ago",
    joinedAt: "2025-10-04",
  },
  {
    id: "u5",
    name: "Hossein Karim",
    email: "hossein@parsrepair.example",
    role: "Operator",
    workspace: "Pars Repair Services",
    workspaceId: "pars-repair-services",
    status: "invited",
    lastActive: "—",
    joinedAt: "2026-05-10",
  },
  {
    id: "u6",
    name: "Sara Tehrani",
    email: "sara@noorrestaurant.example",
    role: "Owner",
    workspace: "Noor Restaurant",
    workspaceId: "noor-restaurant",
    status: "active",
    lastActive: "4 min ago",
    joinedAt: "2025-08-22",
  },
  {
    id: "u7",
    name: "Babak Yousefi",
    email: "babak@noorrestaurant.example",
    role: "Operator",
    workspace: "Noor Restaurant",
    workspaceId: "noor-restaurant",
    status: "active",
    lastActive: "30 min ago",
    joinedAt: "2025-09-01",
  },
  {
    id: "u8",
    name: "Nazanin Pour",
    email: "nazanin@noorrestaurant.example",
    role: "Viewer",
    workspace: "Noor Restaurant",
    workspaceId: "noor-restaurant",
    status: "active",
    lastActive: "yesterday",
    joinedAt: "2025-09-09",
  },
  {
    id: "u9",
    name: "Reza Mahdavi",
    email: "reza@demo-ecom.example",
    role: "Owner",
    workspace: "Demo Ecommerce Support",
    workspaceId: "demo-ecommerce-support",
    status: "active",
    lastActive: "yesterday",
    joinedAt: "2026-05-02",
  },
  {
    id: "u10",
    name: "Maryam Hosseini",
    email: "maryam@atlaslegal.example",
    role: "Owner",
    workspace: "Atlas Legal Office",
    workspaceId: "atlas-legal-office",
    status: "suspended",
    lastActive: "9 days ago",
    joinedAt: "2025-06-18",
  },
];

export type ProviderStatus = "mock-active" | "planned" | "future";
export type AdminProvider = {
  id: string;
  name: string;
  status: ProviderStatus;
  availabilityPct: number;
  lastCheck: string;
  affectedBusinesses: number;
  latencyMs: number | null;
  notes: string;
};

export const adminProviders: AdminProvider[] = [
  {
    id: "web-chat",
    name: "Web Chat",
    status: "mock-active",
    availabilityPct: 100,
    lastCheck: "30 s ago",
    affectedBusinesses: 0,
    latencyMs: 42,
    notes: "Mock provider — no real backend.",
  },
  {
    id: "email",
    name: "Email",
    status: "mock-active",
    availabilityPct: 99.7,
    lastCheck: "1 min ago",
    affectedBusinesses: 0,
    latencyMs: 118,
    notes: "Mock provider — no real SMTP/IMAP.",
  },
  {
    id: "instagram",
    name: "Instagram",
    status: "planned",
    availabilityPct: 0,
    lastCheck: "—",
    affectedBusinesses: 0,
    latencyMs: null,
    notes: "Planned — not enabled in MVP.",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    status: "planned",
    availabilityPct: 0,
    lastCheck: "—",
    affectedBusinesses: 0,
    latencyMs: null,
    notes: "Planned — not enabled in MVP.",
  },
  {
    id: "telegram",
    name: "Telegram",
    status: "planned",
    availabilityPct: 0,
    lastCheck: "—",
    affectedBusinesses: 0,
    latencyMs: null,
    notes: "Planned — not enabled in MVP.",
  },
  {
    id: "sms",
    name: "SMS",
    status: "planned",
    availabilityPct: 0,
    lastCheck: "—",
    affectedBusinesses: 0,
    latencyMs: null,
    notes: "Planned — not enabled in MVP.",
  },
  {
    id: "voice",
    name: "Voice",
    status: "future",
    availabilityPct: 0,
    lastCheck: "—",
    affectedBusinesses: 0,
    latencyMs: null,
    notes: "Future — not on MVP roadmap.",
  },
];

export type AdminAuditCategory =
  | "business"
  | "user"
  | "access"
  | "feature-flag"
  | "provider"
  | "support";
export type AdminAuditResult = "success" | "denied" | "failed" | "mock";

export type AdminAuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  actorType: "Platform Admin" | "Platform Support" | "Owner" | "Admin" | "Operator" | "System";
  action: string;
  category: AdminAuditCategory;
  target: string;
  targetBusiness?: string;
  result: AdminAuditResult;
  source: string;
  metadata: string;
};

export const adminAuditEvents: AdminAuditEvent[] = [
  {
    id: "a1",
    timestamp: "2026-05-19 09:42",
    actor: "Platform Admin · Saeed",
    actorType: "Platform Admin",
    action: "Business created",
    category: "business",
    target: "Demo Ecommerce Support",
    targetBusiness: "demo-ecommerce-support",
    result: "mock",
    source: "192.0.2.18",
    metadata: "Plan: Trial · Region: EU",
  },
  {
    id: "a2",
    timestamp: "2026-05-19 09:30",
    actor: "Owner · Sara Tehrani",
    actorType: "Owner",
    action: "Member invited",
    category: "user",
    target: "babak@noorrestaurant.example",
    targetBusiness: "noor-restaurant",
    result: "success",
    source: "203.0.113.4",
    metadata: "Role: Operator",
  },
  {
    id: "a3",
    timestamp: "2026-05-19 09:15",
    actor: "Admin · Mehdi Rahmani",
    actorType: "Admin",
    action: "Role changed",
    category: "user",
    target: "leila@tehrandental.example",
    targetBusiness: "tehran-dental-clinic",
    result: "success",
    source: "198.51.100.22",
    metadata: "Viewer → Operator",
  },
  {
    id: "a4",
    timestamp: "2026-05-19 08:58",
    actor: "Viewer · Nazanin Pour",
    actorType: "Operator",
    action: "Attempted settings change",
    category: "access",
    target: "/settings/ai",
    targetBusiness: "noor-restaurant",
    result: "denied",
    source: "203.0.113.51",
    metadata: "Insufficient role",
  },
  {
    id: "a5",
    timestamp: "2026-05-19 08:32",
    actor: "Platform Admin · Saeed",
    actorType: "Platform Admin",
    action: "Feature flag changed",
    category: "feature-flag",
    target: "platformAdminBeta → on",
    result: "mock",
    source: "192.0.2.18",
    metadata: "Scope: internal",
  },
  {
    id: "a6",
    timestamp: "2026-05-19 08:05",
    actor: "System",
    actorType: "System",
    action: "Provider health check",
    category: "provider",
    target: "Web Chat",
    result: "success",
    source: "internal",
    metadata: "Latency 42 ms",
  },
  {
    id: "a7",
    timestamp: "2026-05-19 07:51",
    actor: "Operator · Leila Saberi",
    actorType: "Operator",
    action: "AI draft approved",
    category: "business",
    target: "Conversation #4821",
    targetBusiness: "tehran-dental-clinic",
    result: "success",
    source: "198.51.100.22",
    metadata: "Confidence 0.84",
  },
  {
    id: "a8",
    timestamp: "2026-05-18 22:14",
    actor: "Platform Support · Mina",
    actorType: "Platform Support",
    action: "Support note added",
    category: "support",
    target: "Pars Repair Services",
    targetBusiness: "pars-repair-services",
    result: "mock",
    source: "192.0.2.31",
    metadata: "Quota concern",
  },
  {
    id: "a9",
    timestamp: "2026-05-18 19:02",
    actor: "Platform Admin · Saeed",
    actorType: "Platform Admin",
    action: "Workspace suspended",
    category: "business",
    target: "Atlas Legal Office",
    targetBusiness: "atlas-legal-office",
    result: "mock",
    source: "192.0.2.18",
    metadata: "Reason: payment review",
  },
  {
    id: "a10",
    timestamp: "2026-05-18 15:33",
    actor: "System",
    actorType: "System",
    action: "Quota warning",
    category: "business",
    target: "Noor Restaurant",
    targetBusiness: "noor-restaurant",
    result: "mock",
    source: "internal",
    metadata: "104% of monthly tokens",
  },
];

export type AdminFeatureFlag = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  scope: "All workspaces" | "Internal" | "Beta opt-in" | "Mock active";
  affectedWorkspaces: number;
  owner: string;
  lastChanged: string;
};

export const adminFeatureFlags: AdminFeatureFlag[] = [
  {
    id: "webChatMock",
    label: "Web Chat (mock)",
    description: "Mock Web Chat channel rendering for all workspaces.",
    enabled: true,
    scope: "Mock active",
    affectedWorkspaces: 5,
    owner: "Platform Ops",
    lastChanged: "2026-04-30",
  },
  {
    id: "emailMock",
    label: "Email (mock)",
    description: "Mock email channel rendering and threading.",
    enabled: true,
    scope: "Mock active",
    affectedWorkspaces: 5,
    owner: "Platform Ops",
    lastChanged: "2026-04-30",
  },
  {
    id: "aiDraftReview",
    label: "AI draft review",
    description: "Operator-reviewed AI drafts. Human-review-first. No auto-send.",
    enabled: true,
    scope: "All workspaces",
    affectedWorkspaces: 5,
    owner: "Product",
    lastChanged: "2026-05-02",
  },
  {
    id: "knowledgeBase",
    label: "Knowledge base",
    description: "FAQ + business rules editor for AI grounding.",
    enabled: true,
    scope: "All workspaces",
    affectedWorkspaces: 5,
    owner: "Product",
    lastChanged: "2026-05-05",
  },
  {
    id: "nightMode",
    label: "Night mode",
    description: "Optional fourth theme layered on dark for low-light reception desks.",
    enabled: true,
    scope: "All workspaces",
    affectedWorkspaces: 5,
    owner: "Design",
    lastChanged: "2026-05-10",
  },
  {
    id: "whatsappPlanned",
    label: "WhatsApp (planned visible)",
    description: "Show WhatsApp as a planned channel in channel setup.",
    enabled: true,
    scope: "All workspaces",
    affectedWorkspaces: 5,
    owner: "Product",
    lastChanged: "2026-04-21",
  },
  {
    id: "platformAdminBeta",
    label: "Platform Admin (beta)",
    description: "Internal mock admin surface — visible to platform staff only.",
    enabled: true,
    scope: "Internal",
    affectedWorkspaces: 0,
    owner: "Platform Ops",
    lastChanged: "2026-05-19",
  },
];

export type SupportCategory =
  | "Workspace setup"
  | "Invite issue"
  | "Channel setup"
  | "Billing (future)"
  | "AI draft review";
export type SupportPriority = "low" | "normal" | "high" | "urgent";
export type SupportStatus = "open" | "waiting" | "resolved";

export type AdminSupportItem = {
  id: string;
  business: string;
  businessId: string;
  requester: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  createdAt: string;
  owner: string;
  summary: string;
  timeline: { at: string; actor: string; note: string }[];
};

export const adminSupportItems: AdminSupportItem[] = [
  {
    id: "s1",
    business: "Pars Repair Services",
    businessId: "pars-repair-services",
    requester: "Amir Shahbazi",
    category: "Workspace setup",
    priority: "high",
    status: "open",
    createdAt: "2026-05-19 08:10",
    owner: "Mina (Support)",
    summary: "Owner is approaching monthly quota — wants to review usage breakdown.",
    timeline: [
      { at: "08:10", actor: "Amir Shahbazi", note: "Submitted from workspace settings (mock)." },
      {
        at: "08:32",
        actor: "Mina (Support)",
        note: "Added internal note: monitor quota; suggest plan review.",
      },
    ],
  },
  {
    id: "s2",
    business: "Noor Restaurant",
    businessId: "noor-restaurant",
    requester: "Sara Tehrani",
    category: "Invite issue",
    priority: "normal",
    status: "waiting",
    createdAt: "2026-05-19 07:24",
    owner: "Mina (Support)",
    summary: "Invitee didn't receive mock invite email — needs resend.",
    timeline: [
      { at: "07:24", actor: "Sara Tehrani", note: "Reported missing invite (mock)." },
      { at: "07:48", actor: "Mina (Support)", note: "Resent mock invite — awaiting confirmation." },
    ],
  },
  {
    id: "s3",
    business: "Tehran Dental Clinic",
    businessId: "tehran-dental-clinic",
    requester: "Dr. Niloofar Karimi",
    category: "Channel setup",
    priority: "low",
    status: "resolved",
    createdAt: "2026-05-17 13:02",
    owner: "Saeed (Admin)",
    summary: "Question about Email channel mock configuration.",
    timeline: [
      {
        at: "13:02",
        actor: "Dr. Niloofar Karimi",
        note: "Asked how Email auto-routing will work.",
      },
      {
        at: "14:15",
        actor: "Saeed (Admin)",
        note: "Resolved — explained mock behavior; pointed to docs.",
      },
    ],
  },
  {
    id: "s4",
    business: "Demo Ecommerce Support",
    businessId: "demo-ecommerce-support",
    requester: "Reza Mahdavi",
    category: "Billing (future)",
    priority: "low",
    status: "open",
    createdAt: "2026-05-18 11:40",
    owner: "—",
    summary: "Asked about plan upgrade path. Billing not enabled in MVP.",
    timeline: [{ at: "11:40", actor: "Reza Mahdavi", note: "Requested pricing options (mock)." }],
  },
  {
    id: "s5",
    business: "Atlas Legal Office",
    businessId: "atlas-legal-office",
    requester: "Maryam Hosseini",
    category: "AI draft review",
    priority: "urgent",
    status: "open",
    createdAt: "2026-05-18 18:55",
    owner: "Saeed (Admin)",
    summary: "Workspace suspended — owner asking for review timeline.",
    timeline: [
      { at: "18:55", actor: "Maryam Hosseini", note: "Requested suspension review." },
      { at: "19:02", actor: "Saeed (Admin)", note: "Acknowledged — mock review queued." },
    ],
  },
];

// Platform-wide rollup numbers for /admin and /admin/usage.
export const adminPlatformKPIs = {
  activeBusinesses: adminBusinesses.filter((b) => b.status === "active").length,
  trialWorkspaces: adminBusinesses.filter((b) => b.status === "trial").length,
  messagesThisMonth: adminBusinesses.reduce((s, b) => s + b.conversationsThisMonth, 0),
  aiDraftsThisMonth: adminBusinesses.reduce((s, b) => s + b.aiDraftsThisMonth, 0),
  tokensThisMonth: adminBusinesses.reduce((s, b) => s + b.tokensThisMonth, 0),
  providerAlerts: adminProviders.filter(
    (p) => p.status === "mock-active" && p.availabilityPct < 99.9,
  ).length,
  supportItemsOpen: adminSupportItems.filter((s) => s.status !== "resolved").length,
  quotaWarnings: adminBusinesses.filter((b) => b.usageStatus !== "healthy").length,
};
