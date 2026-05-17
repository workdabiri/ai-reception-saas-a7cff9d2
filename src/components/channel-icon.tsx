import {
  MessageSquare,
  Mail,
  Instagram,
  Phone,
  MessageCircle,
  Send,
  Smartphone,
} from "lucide-react";
import type { ChannelKey } from "@/lib/mock-data";

const iconMap: Record<ChannelKey, typeof Mail> = {
  webchat: MessageSquare,
  email: Mail,
  instagram: Instagram,
  whatsapp: MessageCircle,
  telegram: Send,
  sms: Smartphone,
  voice: Phone,
};

const toneMap: Record<ChannelKey, string> = {
  webchat: "bg-info/10 text-info",
  email: "bg-primary-soft text-primary",
  instagram: "bg-destructive/10 text-destructive",
  whatsapp: "bg-success/10 text-success",
  telegram: "bg-info/10 text-info",
  sms: "bg-warning/15 text-warning",
  voice: "bg-secondary text-secondary-foreground",
};

export function ChannelIcon({
  channel,
  size = 36,
  inactive = false,
}: {
  channel: ChannelKey;
  size?: number;
  /** When true, render in a desaturated/neutral state to signal the channel is disabled or planned. */
  inactive?: boolean;
}) {
  const Icon = iconMap[channel];
  const tone = inactive ? "muted-icon-tile" : toneMap[channel];
  return (
    <div
      className={`grid place-items-center rounded-xl ${tone}`}
      data-channel={inactive ? channel : undefined}
      style={{ width: size, height: size }}
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}

export const channelIconMap = iconMap;
export const channelToneMap = toneMap;
