/**
 * API Types — Backend Contract Types for UI
 *
 * TypeScript types matching the backend R1/R2 domain contracts.
 * These are the UI-facing representations of backend entities.
 *
 * Source of truth: workdabiri/ai-reception-saas
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
// Business / Tenancy domain
// ---------------------------------------------------------------------------

/**
 * Business status — matches backend BUSINESS_STATUS_VALUES (UPPERCASE).
 */
export const BUSINESS_STATUSES = ["ACTIVE", "SUSPENDED", "ARCHIVED"] as const;
export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];

/** Tenant-safe user display info — a read-only subset returned from enriched list APIs.
 * Intentionally excludes email and other PII fields.
 * Matches backend UserDisplayInfo in src/domains/identity/types.ts.
 */
export interface UserDisplayInfo {
  id: UUID;
  name: string;
  avatarUrl: string | null;
}

/**
 * Domain representation of a business workspace.
 * Matches backend BusinessIdentity.
 *
 * Returned by GET /api/businesses (authenticated, no tenant scope).
 */
export interface BusinessIdentity {
  id: UUID;
  name: string;
  slug: string;
  status: BusinessStatus;
  timezone: string;
  locale: string;
  createdByUserId: UUID;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

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

/**
 * Valid conversation status transitions.
 * Mirrors backend src/domains/conversations/validation.ts VALID_TRANSITIONS.
 * Backend is authoritative — this map is for UI filtering only.
 */
export const VALID_TRANSITIONS: Record<ConversationStatus, readonly ConversationStatus[]> = {
  NEW: ["OPEN", "ASSIGNED"],
  OPEN: ["ASSIGNED"],
  ASSIGNED: ["WAITING_CUSTOMER", "ESCALATED", "RESOLVED"],
  WAITING_CUSTOMER: ["WAITING_OPERATOR", "RESOLVED"],
  WAITING_OPERATOR: ["ASSIGNED", "ESCALATED"],
  ESCALATED: ["ASSIGNED", "RESOLVED"],
  RESOLVED: ["OPEN"],
} as const;

/** Returns the valid next statuses for a given conversation status. */
export function getValidNextStatuses(status: ConversationStatus): readonly ConversationStatus[] {
  return VALID_TRANSITIONS[status] ?? [];
}

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

/** Conversation with message count summary — enriched with last-message snippet (backend PR #76) */
export interface ConversationWithSummary extends Conversation {
  messageCount: number;
  lastMessageAt: string | null;
  /** Text content of the most recent message. Null when the conversation has no messages. */
  lastMessageContent: string | null;
  /** Direction of the most recent message. Null when the conversation has no messages. */
  lastMessageDirection: MessageDirection | null;
  /** Sender type of the most recent message. Null when the conversation has no messages. */
  lastMessageSenderType: MessageSenderType | null;
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

// ---------------------------------------------------------------------------
// Membership domain
// ---------------------------------------------------------------------------

/**
 * Membership role — matches backend MEMBERSHIP_ROLE_VALUES.
 * Uppercase to match backend enum exactly.
 */
export const MEMBERSHIP_ROLES = ["OWNER", "ADMIN", "OPERATOR", "VIEWER"] as const;

export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

/**
 * Membership status — matches backend MEMBERSHIP_STATUS_VALUES.
 * Richer than the mock (added DECLINED, EXPIRED, LEFT).
 */
export const MEMBERSHIP_STATUSES = [
  "INVITED",
  "ACTIVE",
  "DECLINED",
  "EXPIRED",
  "REMOVED",
  "LEFT",
] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

/**
 * Domain representation of a business membership.
 * Matches backend BusinessMembershipIdentity.
 *
 * user is optional — present when the backend includes the related user
 * record via Prisma join (all list queries from PR #75 onward).
 * Fallback to userId-based display when absent.
 */
export interface BusinessMembership {
  id: UUID;
  businessId: UUID;
  userId: UUID;
  role: MembershipRole;
  status: MembershipStatus;
  invitedByUserId: UUID | null;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Resolved user display info — present from PR #75 enrichment. */
  user?: UserDisplayInfo;
}

/** Filters for listing business memberships */
export interface ListMembershipsFilters {
  /** Include REMOVED/LEFT memberships. Defaults to false. */
  includeRemoved?: boolean;
}

// ---------------------------------------------------------------------------
// Audit domain
// ---------------------------------------------------------------------------

/**
 * Audit actor type — matches backend AUDIT_ACTOR_TYPE_VALUES (UPPERCASE).
 */
export const AUDIT_ACTOR_TYPES = ["USER", "SYSTEM", "AI_RECEPTIONIST"] as const;
export type AuditActorType = (typeof AUDIT_ACTOR_TYPES)[number];

/**
 * Audit result — matches backend AUDIT_RESULT_VALUES (UPPERCASE).
 */
export const AUDIT_RESULTS = ["SUCCESS", "DENIED", "FAILED"] as const;
export type AuditResult = (typeof AUDIT_RESULTS)[number];

/**
 * JSON-compatible value (mirrors backend JsonValue).
 * Used for unstructured audit metadata.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Domain representation of a tenant audit event.
 * Matches backend AuditEventIdentity exactly.
 *
 * Type notes:
 * - id: UUID primary key — always a UUID, UUID alias used.
 * - businessId: string | null — typed as string (not UUID alias) to mirror
 *   backend AuditEventIdentity which uses string | null.
 * - actorUserId: string | null — typed as string (not UUID alias) because
 *   backend types it as string | null. In practice USER actors will have
 *   UUID actorUserIds, but the contract does not enforce this here.
 * - targetId: string | null — typed as string (not UUID alias) because
 *   backend accepts any string up to 160 chars as targetId; not always UUID.
 *
 * actorUser is optional — present from PR #75 enrichment for USER-type actors.
 * Fallback to actorUserId-based display when absent.
 * NOTE: workspace name is not returned — the request is scoped to businessId.
 * NOTE: details text is not returned — compose from action + targetType.
 */
export interface AuditEvent {
  id: UUID;
  businessId: string | null;
  actorType: AuditActorType;
  actorUserId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  result: AuditResult;
  metadata: JsonValue | null;
  createdAt: string; // ISO 8601
  /** Resolved actor display info — present from PR #75 enrichment for USER actors. */
  actorUser?: UserDisplayInfo;
}

/**
 * Client-side UI filters for the audit events list.
 * These are NOT the backend query params — they are applied locally on the
 * fetched array. The backend supports: actorUserId, action, targetType,
 * targetId, result, actorType, limit. This MVP fetches with limit=100
 * and filters entirely client-side.
 */
export interface ListAuditEventsFilters {
  actorType?: AuditActorType;
  result?: AuditResult;
  /** Client-side date range label */
  dateRange?: "All time" | "Today" | "Last 7 days" | "Last 30 days";
  /** Client-side free-text search */
  query?: string;
}

// ---------------------------------------------------------------------------
// Knowledge / Business-Context domain
// ---------------------------------------------------------------------------

/**
 * Business-context lifecycle / verification status.
 * Matches backend BUSINESS_CONTEXT_ITEM_STATUS_VALUES (UPPERCASE).
 *
 * - DRAFT    = unverified; NOT eligible as AI context.
 * - VERIFIED = business-approved; the ONLY status eligible as AI context.
 * - ARCHIVED = retired; NOT eligible as AI context.
 */
export const KNOWLEDGE_STATUSES = ["DRAFT", "VERIFIED", "ARCHIVED"] as const;
export type KnowledgeStatus = (typeof KNOWLEDGE_STATUSES)[number];

/**
 * Business-context provenance/source type.
 * Matches backend BUSINESS_CONTEXT_ITEM_SOURCE_TYPE_VALUES (UPPERCASE).
 * The backend create endpoint validates this with a strict z.enum — only these
 * values are accepted. SYSTEM_SEEDED is backend-only and not offered in the UI
 * create form.
 */
export const KNOWLEDGE_SOURCE_TYPES = [
  "OWNER_APPROVED",
  "OPERATOR_APPROVED",
  "SYSTEM_SEEDED",
  "IMPORT",
  "OTHER",
] as const;
export type KnowledgeSourceType = (typeof KNOWLEDGE_SOURCE_TYPES)[number];

/**
 * Domain representation of a business-context (knowledge) item.
 * Matches backend BusinessContextItem in src/domains/knowledge/types.ts.
 *
 * `sourceMetadata` is intentionally typed as unknown and not surfaced in the
 * UI — there is no safe generic metadata viewer for it yet.
 */
export interface BusinessContextItem {
  id: UUID;
  businessId: UUID;
  category: string;
  key: string;
  value: string;
  status: KnowledgeStatus;
  sourceType: KnowledgeSourceType;
  sourceLabel: string | null;
  sourceUrl: string | null;
  sourceMetadata: unknown;
  verifiedByUserId: string | null;
  verifiedAt: string | null;
  createdByUserId: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Input for creating a knowledge item (POST /knowledge).
 *
 * Server-controlled fields (businessId, status, verifiedByUserId, verifiedAt,
 * createdByUserId, createdAt, updatedAt) are intentionally absent — the backend
 * rejects them via a strict body schema. New items are always created as DRAFT.
 */
export interface CreateKnowledgeItemInput {
  category: string;
  key: string;
  value: string;
  sourceType: KnowledgeSourceType;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
}

/** Filters for listing knowledge items. */
export interface ListKnowledgeFilters {
  /** Lifecycle-status filter; backend defaults to VERIFIED when omitted. */
  status?: KnowledgeStatus;
  /** Optional category filter. */
  category?: string;
  /** Maximum number of items to return. */
  limit?: number;
}

// ---------------------------------------------------------------------------
// Dashboard domain
// ---------------------------------------------------------------------------

/**
 * Dashboard aggregate summary response.
 * Matches backend GET /api/businesses/:businessId/dashboard/summary (PR #77).
 *
 * Field notes:
 * - openConversations: all conversations not in RESOLVED status
 * - waitingForOperator: conversations in WAITING_OPERATOR status
 * - needsFollowUp: active conversations where latest message is INBOUND and >24h old
 * - draftsPendingReview: conversations with aiDraftStatus=READY that are not RESOLVED
 * - accessAlerts: count of DENIED audit events in last 24h;
 *   null when the caller lacks audit.read (OPERATOR / VIEWER roles)
 * - generatedAt: ISO timestamp when the backend computed this snapshot
 */
export interface DashboardSummary {
  openConversations: number;
  waitingForOperator: number;
  needsFollowUp: number;
  draftsPendingReview: number;
  accessAlerts: number | null;
  generatedAt: string;
}

/**
 * Per-operator workload entry.
 * Matches backend OperatorWorkloadEntry from PR #78.
 *
 * Field notes:
 * - openAssigned: non-RESOLVED conversations currently assigned to this operator
 * - resolvedToday: conversations this operator resolved today (closedAt >= start of UTC day)
 * - role: membership role — typed as MembershipRole to share the existing union
 */
export interface OperatorWorkloadEntry {
  userId: UUID;
  name: string;
  avatarUrl: string | null;
  role: MembershipRole;
  openAssigned: number;
  resolvedToday: number;
}

/**
 * Operator workload aggregate response.
 * Matches backend GET /api/businesses/:businessId/dashboard/operator-workload (PR #78).
 *
 * Field notes:
 * - operators: sorted by openAssigned DESC, then name ASC (backend-ordered — do not re-sort)
 * - unassigned.open: conversations with no assignedUserId in non-RESOLVED status
 * - generatedAt: ISO timestamp when the backend computed this snapshot
 */
export interface OperatorWorkloadResponse {
  businessId: UUID;
  generatedAt: string;
  operators: OperatorWorkloadEntry[];
  unassigned: {
    open: number;
  };
}

// ---------------------------------------------------------------------------
// AI Draft Review domain
// ---------------------------------------------------------------------------

/**
 * Source of a reply draft — matches backend ReplyDraftSource enum (PR #79).
 * - AI: generated by an LLM (future, not yet active in MVP)
 * - SYSTEM: deterministic stub generated by the backend (PR #80)
 * - OPERATOR: manually created by an operator
 */
export const DASHBOARD_AI_DRAFT_SOURCES = ["AI", "SYSTEM", "OPERATOR"] as const;
export type DashboardAiDraftSource = (typeof DASHBOARD_AI_DRAFT_SOURCES)[number];

/**
 * Status of a reply draft pending review — matches backend ReplyDraftStatus enum (PR #79).
 * Only reviewable statuses are returned by the dashboard endpoint:
 * - PENDING_REVIEW: draft not yet touched by an operator
 * - EDITED: draft was modified by an operator but not yet approved
 */
export const DASHBOARD_AI_DRAFT_STATUSES = ["PENDING_REVIEW", "EDITED"] as const;
export type DashboardAiDraftStatus = (typeof DASHBOARD_AI_DRAFT_STATUSES)[number];

/**
 * A single draft item in the dashboard AI draft review list.
 * Matches backend DashboardAiDraftItem from PR #79.
 *
 * Field notes:
 * - customerName: null when no CRM customer is linked to the conversation
 * - subject: null when the conversation has no subject set
 * - draftTextPreview: truncated preview of the draft text (max 120 chars)
 */
export interface DashboardAiDraftItem {
  id: UUID;
  conversationId: UUID;
  customerName: string | null;
  subject: string | null;
  channel: string;
  draftTextPreview: string;
  source: DashboardAiDraftSource;
  status: DashboardAiDraftStatus;
  createdAt: string; // ISO 8601
}

/**
 * Dashboard AI draft review aggregate response.
 * Matches backend GET /api/businesses/:businessId/dashboard/ai-drafts (PR #79).
 *
 * Field notes:
 * - pendingCount: total count of PENDING_REVIEW drafts (may exceed drafts.length
 *   if backend paginates or caps the list)
 * - drafts: list of reviewable drafts (PENDING_REVIEW | EDITED), ordered newest first
 * - generatedAt: ISO timestamp when the backend computed this snapshot
 */
export interface DashboardAiDraftsResponse {
  businessId: UUID;
  generatedAt: string;
  pendingCount: number;
  drafts: DashboardAiDraftItem[];
}

// ---------------------------------------------------------------------------
// Conversation-level Reply Draft domain
// ---------------------------------------------------------------------------

/**
 * Reply draft status for conversation-level current draft read.
 * Active statuses only — DISCARDED and SENT are excluded from the current endpoint.
 * Matches backend ACTIVE_DRAFT_STATUSES (PR #85).
 */
export const CURRENT_REPLY_DRAFT_STATUSES = ["PENDING_REVIEW", "EDITED", "APPROVED"] as const;
export type CurrentReplyDraftStatus = (typeof CURRENT_REPLY_DRAFT_STATUSES)[number];

/**
 * Reply draft source — matches backend ReplyDraftSource enum.
 * - AI: generated by an LLM (future)
 * - SYSTEM: deterministic stub (PR #80)
 * - OPERATOR: manually created by an operator
 */
export const CURRENT_REPLY_DRAFT_SOURCES = ["AI", "SYSTEM", "OPERATOR"] as const;
export type CurrentReplyDraftSource = (typeof CURRENT_REPLY_DRAFT_SOURCES)[number];

/**
 * A single draft item returned by the current draft endpoint.
 * Includes full draftText for operator review/editing.
 * Matches backend CurrentDraftResult.draft shape (PR #85).
 */
export interface CurrentReplyDraftItem {
  id: UUID;
  conversationId: UUID;
  status: CurrentReplyDraftStatus;
  source: CurrentReplyDraftSource;
  draftText: string;
  draftTextPreview: string;
  originalText: string | null;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response from GET /api/businesses/:businessId/conversations/:conversationId/reply-drafts/current
 * Matches backend PR #85.
 *
 * draft is null when no active draft exists for the conversation.
 */
export interface CurrentReplyDraftResponse {
  businessId: UUID;
  conversationId: UUID;
  draft: CurrentReplyDraftItem | null;
}

/**
 * Response from POST .../reply-drafts/generate (PR #80).
 * Returns the generated or reused draft. UI uses id, status, source, draftText.
 */
export interface GenerateDraftResponse {
  businessId: UUID;
  conversationId: UUID;
  draft: {
    id: UUID;
    conversationId: UUID;
    status: string;
    source: string;
    draftText: string;
    draftTextPreview: string;
  };
  reused: boolean;
}

/**
 * Response from POST .../reply-drafts/:draftId/edit (PR #83).
 * Returns the updated draft snippet.
 */
export interface EditDraftResponse {
  businessId: UUID;
  conversationId: UUID;
  draft: {
    id: UUID;
    conversationId: UUID;
    status: string;
    source: string;
    draftTextPreview: string;
    reviewedAt: string | null;
    reviewedByUserId: string | null;
    updatedAt: string;
  };
}

/**
 * Response from POST .../reply-drafts/:draftId/discard (PR #82).
 * Returns the discarded draft snippet.
 */
export interface DiscardDraftResponse {
  businessId: UUID;
  conversationId: UUID;
  draft: {
    id: UUID;
    conversationId: UUID;
    status: string;
    reviewedAt: string | null;
    reviewedByUserId: string | null;
    updatedAt: string;
  };
}

/**
 * Response from POST .../reply-drafts/:draftId/approve (PR #84).
 * Returns the approved draft snippet.
 */
export interface ApproveDraftResponse {
  businessId: UUID;
  conversationId: UUID;
  draft: {
    id: UUID;
    conversationId: UUID;
    status: string;
    source: string;
    draftTextPreview: string;
    reviewedAt: string | null;
    reviewedByUserId: string | null;
    updatedAt: string;
  };
}
