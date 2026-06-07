/**
 * Shared UI type aliases used across components.
 *
 * These types were originally defined in mock-data.ts but are not mock-data —
 * they are stable domain vocabulary used by shared UI components (StatusChip,
 * ChannelChip, etc.). Keeping them here removes the last app-level import
 * from mock-data.ts and allows mock-data.ts to be deprecated when its runtime
 * data is no longer referenced.
 */

/** Conversation status as returned by the backend API. */
export type ConvStatus = "open" | "pending" | "snoozed" | "closed";

/**
 * Legacy channel identifier used by ChannelChip and mock-data.
 * Matches the inbox-level channel type (email, webform, SMS, WhatsApp, voice).
 * For the full channel registry (including web_chat, instagram, telegram,
 * facebook, call), see src/lib/channels.ts.
 */
export type Channel = "email" | "webform" | "sms" | "whatsapp" | "voice";

/** Extended chip statuses for conversation status chips on dashboard / inbox. */
export type ChipStatus =
  | "new"
  | "open"
  | "waiting"
  | "closed"
  | "needs-review"
  | "access-denied"
  | "future";
