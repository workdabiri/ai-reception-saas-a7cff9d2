/**
 * API Types — Backend Contract Types for UI
 *
 * TypeScript types matching the backend R1/R2 domain contracts.
 * These are the UI-facing representations of backend entities.
 *
 * Source of truth: iranservice/ai-reception-saas
 *   - src/domains/conversations/types.ts
 *   - src/domains/crm/types.ts
 *   - src/app/api/_shared/responses.ts
 *
 * @module
 */

// ---------------------------------------------------------------------------
// API envelope types
// ---------------------------------------------------------------------------

/** API success envelope matching backend { ok: true, data: T } */
export interface ApiSuccessEnvelope<T> {
  ok: true;
  data: T;
}

/** API error envelope matching backend { ok: false, error: { code, message } } */
export interface ApiErrorEnvelope {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

// ---------------------------------------------------------------------------
// Common types
// ---------------------------------------------------------------------------

/** UUID string alias for documentation */
export type UUID = string;

// ---------------------------------------------------------------------------
// Conversation domain
// ---------------------------------------------------------------------------

/** Conversation lifecycle status — matches backend enum */
export const CONVERSATION_STATUSES = [
  "NEW",
  "OPEN",
  "ASSIGNED",
  "WAITING_CUSTOMER",
  "WAITING_OPERATOR",
  "ESCALATED",
  "RESOLVED",
] as const;

export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

/** Message direction — matches backend enum */
export const MESSAGE_DIRECTIONS = ["INBOUND", "OUTBOUND", "SYSTEM", "INTERNAL"] as const;

export type MessageDirection = (typeof MESSAGE_DIRECTIONS)[number];

/** API-allowed message directions (SYSTEM is backend-only) */
export const API_MESSAGE_DIRECTIONS = ["INBOUND", "OUTBOUND", "INTERNAL"] as const;

export type ApiMessageDirection = (typeof API_MESSAGE_DIRECTIONS)[number];

/** Message sender type — matches backend enum */
export const MESSAGE_SENDER_TYPES = ["CUSTOMER", "OPERATOR", "SYSTEM", "AI_RECEPTIONIST"] as const;

export type MessageSenderType = (typeof MESSAGE_SENDER_TYPES)[number];

/** Channel type — matches backend enum */
export const CHANNEL_TYPES = ["INTERNAL", "WEBSITE_CHAT"] as const;

export type ChannelType = (typeof CHANNEL_TYPES)[number];

/** AI classification status — matches backend enum */
export const AI_CLASSIFICATION_STATUSES = ["NOT_REQUESTED", "PENDING", "READY", "FAILED"] as const;

export type AiClassificationStatus = (typeof AI_CLASSIFICATION_STATUSES)[number];

/** AI draft status — matches backend enum */
export const AI_DRAFT_STATUSES = [
  "NOT_REQUESTED",
  "PENDING",
  "READY",
  "APPROVED",
  "REJECTED",
  "FAILED",
] as const;

export type AiDraftStatus = (typeof AI_DRAFT_STATUSES)[number];

// ---------------------------------------------------------------------------
// Conversation entity
// ---------------------------------------------------------------------------

/** Domain representation of a conversation */
export interface Conversation {
  id: UUID;
  businessId: UUID;
  customerId: UUID | null;
  channel: ChannelType;
  status: ConversationStatus;
  subject: string | null;
  assignedUserId: UUID | null;
  aiClassificationStatus: AiClassificationStatus;
  aiDraftStatus: AiDraftStatus;
  channelMetadata: unknown | null;
  metadata: unknown | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Conversation with message count summary */
export interface ConversationWithSummary extends Conversation {
  messageCount: number;
  lastMessageAt: string | null;
}

// ---------------------------------------------------------------------------
// Message entity
// ---------------------------------------------------------------------------

/** Domain representation of a message */
export interface Message {
  id: UUID;
  conversationId: UUID;
  businessId: UUID;
  direction: MessageDirection;
  senderType: MessageSenderType;
  senderUserId: UUID | null;
  senderCustomerId: UUID | null;
  content: string;
  contentType: string;
  channelMetadata: unknown | null;
  metadata: unknown | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Paginated result types
// ---------------------------------------------------------------------------

/** Paginated conversation list result */
export interface PaginatedConversations {
  data: ConversationWithSummary[];
  nextCursor: string | null;
}

/** Paginated message list result */
export interface PaginatedMessages {
  data: Message[];
  nextCursor: string | null;
}

// ---------------------------------------------------------------------------
// Conversation input types (API request bodies)
// ---------------------------------------------------------------------------

/** Initial message when creating a conversation */
export interface CreateConversationInitialMessage {
  content: string;
  direction: ApiMessageDirection;
  senderCustomerId?: UUID;
  contentType?: string;
}

/** Input for creating a new conversation */
export interface CreateConversationInput {
  customerId?: UUID;
  channel?: ChannelType;
  subject?: string;
  channelMetadata?: unknown;
  metadata?: unknown;
  initialMessage?: CreateConversationInitialMessage;
}

/** Input for updating a conversation */
export interface UpdateConversationInput {
  customerId?: UUID | null;
  subject?: string | null;
  metadata?: unknown;
}

/** Input for changing conversation status */
export interface ChangeConversationStatusInput {
  status: ConversationStatus;
}

/** Input for creating a message */
export interface CreateMessageInput {
  content: string;
  direction: ApiMessageDirection;
  senderCustomerId?: UUID;
  contentType?: string;
}

// ---------------------------------------------------------------------------
// Conversation list filters
// ---------------------------------------------------------------------------

/** Filters for listing conversations */
export interface ListConversationsFilters {
  status?: ConversationStatus;
  channel?: ChannelType;
  assignedUserId?: UUID;
  customerId?: UUID;
  limit?: number;
  cursor?: UUID;
}

/** Filters for listing messages — direction uses ApiMessageDirection (SYSTEM excluded at API boundary) */
export interface ListMessagesFilters {
  direction?: ApiMessageDirection;
  limit?: number;
  cursor?: UUID;
}

// ---------------------------------------------------------------------------
// CRM domain
// ---------------------------------------------------------------------------

/** Customer lifecycle status — matches backend enum */
export const CUSTOMER_STATUSES = ["ACTIVE", "ARCHIVED"] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

/** Contact method type — matches backend enum */
export const CONTACT_METHOD_TYPES = [
  "EMAIL",
  "PHONE",
  "WHATSAPP",
  "INSTAGRAM",
  "TELEGRAM",
  "WEBSITE_CHAT",
  "CUSTOM",
] as const;

export type ContactMethodType = (typeof CONTACT_METHOD_TYPES)[number];

/** Domain representation of a customer */
export interface Customer {
  id: UUID;
  businessId: UUID;
  displayName: string;
  status: CustomerStatus;
  locale: string | null;
  notes: string | null;
  metadata: unknown | null;
  createdAt: string;
  updatedAt: string;
}

/** Domain representation of a contact method */
export interface ContactMethod {
  id: UUID;
  customerId: UUID;
  businessId: UUID;
  type: ContactMethodType;
  value: string;
  label: string | null;
  isPrimary: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Convenience alias for downstream compatibility */
export type CustomerContactMethod = ContactMethod;

/** Customer with contact methods */
export interface CustomerWithContacts extends Customer {
  contactMethods: ContactMethod[];
}

// ---------------------------------------------------------------------------
// Customer input types (API request bodies)
// ---------------------------------------------------------------------------

/** Input for creating a new customer */
export interface CreateCustomerInput {
  displayName: string;
  locale?: string;
  notes?: string;
  metadata?: unknown;
  contactMethods?: CreateContactMethodInput[];
}

/** Input for creating a contact method */
export interface CreateContactMethodInput {
  type: ContactMethodType;
  value: string;
  label?: string;
  isPrimary?: boolean;
}

/** Input for identity resolution: find or create by contact */
export interface ResolveCustomerInput {
  type: ContactMethodType;
  value: string;
  displayName?: string;
}

// ---------------------------------------------------------------------------
// Customer list filters
// ---------------------------------------------------------------------------

/** Filters for listing/searching customers */
export interface ListCustomersFilters {
  search?: string;
  status?: CustomerStatus;
  limit?: number;
  cursor?: UUID;
}

/** Paginated customer list result */
export interface PaginatedCustomers {
  data: Customer[];
  nextCursor: string | null;
}
