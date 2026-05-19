import { MessageSquare, Sparkles, ShieldAlert, UserPlus, Radio, BookOpen } from "lucide-react";

export type NotificationCategory =
  | "conversation"
  | "ai"
  | "security"
  | "members"
  | "channels"
  | "knowledge";

export type MockNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  unread: boolean;
  time: string;
  actionLabel: string;
  to: string;
};

export const mockNotifications: MockNotification[] = [
  {
    id: "n1",
    category: "conversation",
    title: "New conversation assigned",
    body: "Sara Mohammadi was assigned to you from Web Chat.",
    unread: true,
    time: "2 min ago",
    actionLabel: "Open Inbox",
    to: "/inbox",
  },
  {
    id: "n2",
    category: "ai",
    title: "AI draft ready for review",
    body: "A draft is prepared for the reschedule request.",
    unread: true,
    time: "14 min ago",
    actionLabel: "Review draft",
    to: "/inbox",
  },
  {
    id: "n3",
    category: "security",
    title: "Access denied event",
    body: "Viewer attempted to export customer data.",
    unread: true,
    time: "1 hr ago",
    actionLabel: "View audit",
    to: "/audit",
  },
  {
    id: "n4",
    category: "members",
    title: "Invitation pending",
    body: "priya@example.com was invited as Operator.",
    unread: false,
    time: "Yesterday",
    actionLabel: "View members",
    to: "/members",
  },
  {
    id: "n5",
    category: "channels",
    title: "Web Chat test message received",
    body: "A mock test message was added to the inbox.",
    unread: false,
    time: "Yesterday",
    actionLabel: "View channels",
    to: "/channels/web-chat",
  },
  {
    id: "n6",
    category: "knowledge",
    title: "Knowledge base partially complete",
    body: "Some AI drafts may need extra operator review.",
    unread: true,
    time: "2 days ago",
    actionLabel: "Open knowledge",
    to: "/knowledge",
  },
];

export const categoryMeta: Record<
  NotificationCategory,
  { label: string; icon: typeof MessageSquare; dot: string; tint: string }
> = {
  conversation: {
    label: "Conversations",
    icon: MessageSquare,
    dot: "bg-info",
    tint: "bg-info/10 ring-info/25",
  },
  ai: {
    label: "AI",
    icon: Sparkles,
    dot: "bg-ai",
    tint: "bg-ai-soft ring-ai/25",
  },
  security: {
    label: "Security",
    icon: ShieldAlert,
    dot: "bg-destructive",
    tint: "bg-destructive/10 ring-destructive/25",
  },
  members: {
    label: "Members",
    icon: UserPlus,
    dot: "bg-success",
    tint: "bg-success/10 ring-success/25",
  },
  channels: {
    label: "Channels",
    icon: Radio,
    dot: "bg-primary",
    tint: "bg-primary-soft ring-primary/25",
  },
  knowledge: {
    label: "Knowledge",
    icon: BookOpen,
    dot: "bg-warning",
    tint: "bg-warning/10 ring-warning/25",
  },
};

export const currentUser = {
  name: "Amelia Hart",
  initials: "AH",
  email: "amelia@tehrandental.example",
  role: "Owner" as const,
  workspace: "Tehran Dental Clinic",
  status: "Active" as const,
};
