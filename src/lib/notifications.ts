import {
  MessageSquare,
  Sparkles,
  ShieldAlert,
  UserPlus,
  Radio,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export type NotificationCategory =
  | "conversation"
  | "ai"
  | "security"
  | "members"
  | "channel"
  | "knowledge";

export type NotificationTone =
  | "info"
  | "ai"
  | "destructive"
  | "primary"
  | "success"
  | "warn";

export type MockNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  read: boolean;
  time: string;
  actionLabel: string;
  to: string;
  icon: LucideIcon;
  tone: NotificationTone;
};

export const CATEGORY_META: Record<
  NotificationCategory,
  { label: string; icon: LucideIcon; tone: NotificationTone }
> = {
  conversation: { label: "Conversations", icon: MessageSquare, tone: "info" },
  ai: { label: "AI", icon: Sparkles, tone: "ai" },
  security: { label: "Security", icon: ShieldAlert, tone: "destructive" },
  members: { label: "Members", icon: UserPlus, tone: "primary" },
  channel: { label: "Channels", icon: Radio, tone: "success" },
  knowledge: { label: "Knowledge", icon: BookOpen, tone: "warn" },
};

export const mockNotifications: MockNotification[] = [
  {
    id: "n1",
    category: "conversation",
    title: "New conversation assigned",
    body: "Sara Mohammadi was assigned to you from Web Chat.",
    read: false,
    time: "2 min ago",
    actionLabel: "Open Inbox",
    to: "/inbox",
    icon: MessageSquare,
    tone: "info",
  },
  {
    id: "n2",
    category: "ai",
    title: "AI draft ready for review",
    body: "A draft is prepared for the reschedule request.",
    read: false,
    time: "11 min ago",
    actionLabel: "Review draft",
    to: "/inbox",
    icon: Sparkles,
    tone: "ai",
  },
  {
    id: "n3",
    category: "security",
    title: "Access denied event",
    body: "Viewer attempted to export customer data.",
    read: false,
    time: "34 min ago",
    actionLabel: "View audit",
    to: "/audit",
    icon: ShieldAlert,
    tone: "destructive",
  },
  {
    id: "n6",
    category: "knowledge",
    title: "Knowledge base partially complete",
    body: "Some AI drafts may need extra operator review.",
    read: false,
    time: "1 h ago",
    actionLabel: "Open knowledge",
    to: "/knowledge",
    icon: BookOpen,
    tone: "warn",
  },
  {
    id: "n_extra",
    category: "conversation",
    title: "Customer reply received",
    body: "Reza Karimi replied to an open Web Chat thread.",
    read: false,
    time: "2 h ago",
    actionLabel: "Open Inbox",
    to: "/inbox",
    icon: MessageSquare,
    tone: "info",
  },
  {
    id: "n4",
    category: "members",
    title: "Invitation pending",
    body: "priya@example.com was invited as Operator.",
    read: true,
    time: "Yesterday",
    actionLabel: "View members",
    to: "/members",
    icon: UserPlus,
    tone: "primary",
  },
  {
    id: "n5",
    category: "channel",
    title: "Web Chat test message received",
    body: "A mock test message was added to the inbox.",
    read: true,
    time: "Yesterday",
    actionLabel: "View channels",
    to: "/channels/web-chat",
    icon: Radio,
    tone: "success",
  },
];

export const CATEGORY_FILTERS: Array<{
  id: "all" | "unread" | NotificationCategory;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "conversation", label: "Conversations" },
  { id: "ai", label: "AI" },
  { id: "security", label: "Security" },
  { id: "members", label: "Members" },
  { id: "channel", label: "Channels" },
];

export const mockUser = {
  name: "Amelia Hart",
  email: "amelia@tehrandental.example",
  role: "Owner" as const,
  workspace: "Tehran Dental Clinic",
  initials: "AH",
  status: "Active" as const,
};
