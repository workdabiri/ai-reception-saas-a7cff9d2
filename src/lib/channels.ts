/**
 * Channel Identity System — single source of truth.
 *
 * Every visual rendering of a channel (icon, chip, badge, card, dot, tag)
 * MUST go through this registry and the <ChannelIcon>, <ChannelBadge>,
 * <ChannelStateTag> components. Never hard-code a channel color, icon,
 * or label anywhere else.
 *
 * Device-agnostic + theme-agnostic: brand colors do NOT change between
 * mobile/tablet/desktop or light/dark/night themes — that's their identity.
 */
import {
  MessageCircle,
  Mail,
  MessageSquare,
  Instagram,
  Send,
  Facebook,
  Smartphone,
  Phone,
  type LucideIcon,
} from "lucide-react";

export type ChannelKey =
  | "web_chat"
  | "email"
  | "whatsapp"
  | "instagram"
  | "telegram"
  | "facebook"
  | "sms"
  | "call";

export type ChannelState =
  | "active"
  | "connecting"
  | "planned"
  | "not_connected";

export type ChannelDefinition = {
  key: ChannelKey;
  label: string;
  icon: LucideIcon;
  /** CSS color expression (var or hex). Use as `color: var(--ch-...)` for theme-aware. */
  brandColor: string;
  /** Concrete hex fallback. */
  brandColorHex: string;
  description: string;
  /** Maps to --ch-* CSS variable. */
  cssVar: string;
};

export const CHANNELS: Record<ChannelKey, ChannelDefinition> = {
  web_chat: {
    key: "web_chat",
    label: "Web Chat",
    icon: MessageCircle,
    brandColor: "var(--primary)",
    brandColorHex: "#7C7CFF",
    description: "Embedded reception form on your website.",
    cssVar: "--ch-webchat",
  },
  email: {
    key: "email",
    label: "Email",
    icon: Mail,
    brandColor: "#4A90E2",
    brandColorHex: "#4A90E2",
    description: "Inbound customer email — manual reply.",
    cssVar: "--ch-email",
  },
  whatsapp: {
    key: "whatsapp",
    label: "WhatsApp",
    icon: MessageSquare,
    brandColor: "#25D366",
    brandColorHex: "#25D366",
    description: "WhatsApp Business inbound messages.",
    cssVar: "--ch-whatsapp",
  },
  instagram: {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
    brandColor: "#E1306C",
    brandColorHex: "#E1306C",
    description: "Direct messages from Instagram.",
    cssVar: "--ch-instagram",
  },
  telegram: {
    key: "telegram",
    label: "Telegram",
    icon: Send,
    brandColor: "#0088CC",
    brandColorHex: "#0088CC",
    description: "Telegram bot inbound messages.",
    cssVar: "--ch-telegram",
  },
  facebook: {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    brandColor: "#0084FF",
    brandColorHex: "#0084FF",
    description: "Facebook Messenger inbound messages.",
    cssVar: "--ch-facebook",
  },
  sms: {
    key: "sms",
    label: "SMS",
    icon: Smartphone,
    brandColor: "#7C3AED",
    brandColorHex: "#7C3AED",
    description: "Inbound SMS via provider.",
    cssVar: "--ch-sms",
  },
  call: {
    key: "call",
    label: "Call",
    icon: Phone,
    brandColor: "var(--operator, #D4A24C)",
    brandColorHex: "#D4A24C",
    description: "Voice reception with transcripts.",
    cssVar: "--ch-call",
  },
};

/**
 * Resolve any legacy channel key (from mock-data) to the unified ChannelKey.
 * Keeps existing data files working without a sweeping rename.
 */
export function resolveChannelKey(input: string): ChannelKey {
  switch (input) {
    case "web_chat":
    case "webchat":
    case "webform":
      return "web_chat";
    case "voice":
    case "call":
      return "call";
    case "messenger":
    case "facebook":
      return "facebook";
    case "email":
    case "whatsapp":
    case "instagram":
    case "telegram":
    case "sms":
      return input as ChannelKey;
    default:
      return "web_chat";
  }
}

export function getChannel(input: string): ChannelDefinition {
  return CHANNELS[resolveChannelKey(input)];
}
