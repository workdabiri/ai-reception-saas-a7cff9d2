/**
 * Conversation AI Draft Review Panel
 *
 * Inline panel for conversation detail view that enables operators to:
 * - Generate a draft (if none exists)
 * - Read the current draft with full text
 * - Edit and save draft text
 * - Discard a draft
 * - Approve a draft (operator approval only — NOT delivery)
 * - Send an APPROVED draft (operator-triggered; creates the outbound message)
 *
 * Approve and Send are distinct, sequential operator actions. Approval marks a
 * draft APPROVED and creates NO message; Send (offered only for APPROVED drafts)
 * creates one internal OUTBOUND message in the conversation. Sending does NOT
 * dispatch to any external channel (WhatsApp/email/SMS) or provider.
 *
 * Backend endpoints used:
 * - GET .../reply-drafts/current (PR #85)
 * - POST .../reply-drafts/generate (PR #80)
 * - POST .../reply-drafts/:draftId/edit (PR #83)
 * - POST .../reply-drafts/:draftId/discard (PR #82)
 * - POST .../reply-drafts/:draftId/approve (PR #84)
 * - POST .../reply-drafts/:draftId/send
 *
 * @module
 */

import { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  Pencil,
  X,
  RefreshCw,
  Loader2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Send,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentReplyDraft } from "@/hooks/use-current-reply-draft";
import {
  useGenerateDraft,
  useEditDraft,
  useDiscardDraft,
  useApproveDraft,
  useSendDraft,
} from "@/hooks/use-reply-draft-actions";
import type { CurrentReplyDraftItem } from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_DRAFT_LENGTH = 5000;

// ---------------------------------------------------------------------------
// Status badge display
// ---------------------------------------------------------------------------

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  PENDING_REVIEW: {
    label: "Pending review",
    cls: "bg-warning/12 text-foreground border-warning/30",
  },
  EDITED: {
    label: "Edited",
    cls: "bg-info/12 text-foreground border-info/25",
  },
  APPROVED: {
    label: "Approved",
    cls: "bg-success/12 text-foreground border-success/25",
  },
};

const SOURCE_BADGE: Record<string, { label: string; cls: string }> = {
  SYSTEM: {
    label: "System",
    cls: "bg-muted text-muted-foreground border-border",
  },
  AI: {
    label: "AI",
    cls: "bg-primary/10 text-foreground border-primary/25",
  },
  OPERATOR: {
    label: "Operator",
    cls: "bg-info/10 text-foreground border-info/25",
  },
};

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

interface AiDraftReviewPanelProps {
  businessId: string;
  conversationId: string;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AiDraftReviewPanel({ businessId, conversationId }: AiDraftReviewPanelProps) {
  const {
    data: draftData,
    isLoading,
    isError,
    refetch,
  } = useCurrentReplyDraft(businessId, conversationId);

  const generateDraft = useGenerateDraft(businessId, conversationId);

  const draft = draftData?.draft ?? null;

  // ── Loading ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-soft p-5">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading draft…
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-soft p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-destructive/10">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          </div>
          <h3 className="text-[13px] font-medium text-foreground">Draft unavailable</h3>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Something went wrong while loading the draft. Please try again.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground shadow-soft transition hover:opacity-95"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  // ── No draft ─────────────────────────────────────────────────────────
  if (!draft) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-soft p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-[13px] font-medium text-foreground">AI Draft Review</h3>
        </div>
        <p className="text-[12px] text-muted-foreground">No draft for this conversation yet.</p>
        <button
          type="button"
          onClick={() => {
            generateDraft.mutate(undefined, {
              onSuccess: () => toast.success("Draft generated"),
              onError: (err) => {
                if (err.isUnauthenticated) toast.error("Session expired. Please sign in again.");
                else if (err.isForbidden)
                  toast.error("You don't have permission to generate drafts.");
                else toast.error("Failed to generate draft. Please try again.");
              },
            });
          }}
          disabled={generateDraft.isPending}
          className="inline-flex items-center gap-2 h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground shadow-soft transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generateDraft.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {generateDraft.isPending ? "Generating…" : "Generate draft"}
        </button>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
          <Info className="h-3 w-3 shrink-0" />
          Operators review and approve drafts before anything is sent.
        </p>
      </div>
    );
  }

  // ── Draft exists — APPROVED ──────────────────────────────────────────
  if (draft.status === "APPROVED") {
    return (
      <ApprovedDraftView draft={draft} businessId={businessId} conversationId={conversationId} />
    );
  }

  // ── Draft exists — PENDING_REVIEW or EDITED ──────────────────────────
  return (
    <ReviewableDraftView draft={draft} businessId={businessId} conversationId={conversationId} />
  );
}

// ---------------------------------------------------------------------------
// Approved draft (read-only)
// ---------------------------------------------------------------------------

function ApprovedDraftView({
  draft,
  businessId,
  conversationId,
}: {
  draft: CurrentReplyDraftItem;
  businessId: string;
  conversationId: string;
}) {
  const sendDraft = useSendDraft(businessId, conversationId);
  const badge = STATUS_BADGE[draft.status] ?? STATUS_BADGE.APPROVED;
  const srcBadge = SOURCE_BADGE[draft.source] ?? SOURCE_BADGE.SYSTEM;

  function handleSend() {
    // Confirm: sending creates a real outbound message in the conversation.
    const confirmed = window.confirm(
      "Send this approved reply? This adds an outbound message to the conversation.",
    );
    if (!confirmed) return;
    sendDraft.mutate(
      { draftId: draft.id },
      {
        onSuccess: () => toast.success("Reply sent"),
        onError: (err) => {
          if (err.isUnauthenticated) toast.error("Session expired. Please sign in again.");
          else if (err.isForbidden) toast.error("You don't have permission to send drafts.");
          else toast.error("Failed to send draft. Please try again.");
        },
      },
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-success/5">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-success/10">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
          </div>
          <h3 className="text-[13px] font-medium text-foreground">AI Draft Review</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${srcBadge.cls}`}>
            {srcBadge.label}
          </span>
          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Read-only draft text */}
      <div className="px-4 py-3">
        <div className="rounded-lg border border-border bg-surface-muted/40 px-3 py-3">
          <p className="text-[13px] leading-[1.6] text-foreground/90 whitespace-pre-wrap break-words">
            {draft.draftText}
          </p>
        </div>
      </div>

      {/* Approval notice */}
      <div className="mx-4 mb-2 rounded-md border border-success/20 bg-success/5 px-3 py-2 space-y-1">
        <p className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 text-success" />
          Approved
        </p>
        <p className="text-[10px] text-muted-foreground">
          Approved drafts are not sent automatically. Send when you&apos;re ready to add this reply
          to the conversation. Sending does not deliver to any external channel.
        </p>
      </div>

      {/* Send error */}
      {sendDraft.isError && (
        <div className="mx-4 mb-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-[11px] text-foreground">
          {sendDraft.error?.message || "Failed to send draft. Please try again."}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-border bg-card/60 px-4 py-3">
        <button
          type="button"
          onClick={handleSend}
          disabled={sendDraft.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground shadow-soft transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendDraft.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {sendDraft.isPending ? "Sending…" : "Send approved draft"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reviewable draft (PENDING_REVIEW | EDITED)
// ---------------------------------------------------------------------------

function ReviewableDraftView({
  draft,
  businessId,
  conversationId,
}: {
  draft: CurrentReplyDraftItem;
  businessId: string;
  conversationId: string;
}) {
  const editDraft = useEditDraft(businessId, conversationId);
  const discardDraft = useDiscardDraft(businessId, conversationId);
  const approveDraft = useApproveDraft(businessId, conversationId);

  const [localText, setLocalText] = useState(draft.draftText);
  const [isEditing, setIsEditing] = useState(false);

  // Sync localText when the draft from the server changes (after mutation success)
  useEffect(() => {
    setLocalText(draft.draftText);
    setIsEditing(false);
  }, [draft.draftText, draft.id]);

  const anyPending = editDraft.isPending || discardDraft.isPending || approveDraft.isPending;
  const trimmedText = localText.trim();
  const textChanged = trimmedText !== draft.draftText.trim();
  const canSave =
    textChanged && trimmedText.length > 0 && trimmedText.length <= MAX_DRAFT_LENGTH && !anyPending;

  const badge = STATUS_BADGE[draft.status] ?? STATUS_BADGE.PENDING_REVIEW;
  const srcBadge = SOURCE_BADGE[draft.source] ?? SOURCE_BADGE.SYSTEM;

  function handleSaveEdit() {
    if (!canSave) return;
    editDraft.mutate(
      { draftId: draft.id, draftText: trimmedText },
      {
        onSuccess: () => toast.success("Draft saved"),
        onError: (err) => {
          if (err.isUnauthenticated) toast.error("Session expired. Please sign in again.");
          else if (err.isForbidden) toast.error("You don't have permission to edit drafts.");
          else toast.error("Failed to save draft. Please try again.");
        },
      },
    );
  }

  function handleDiscard() {
    const confirmed = window.confirm("Discard this draft? This cannot be undone.");
    if (!confirmed) return;
    discardDraft.mutate(
      { draftId: draft.id },
      {
        onSuccess: () => toast.success("Draft discarded"),
        onError: (err) => {
          if (err.isUnauthenticated) toast.error("Session expired. Please sign in again.");
          else if (err.isForbidden) toast.error("You don't have permission to discard drafts.");
          else toast.error("Failed to discard draft. Please try again.");
        },
      },
    );
  }

  function handleApprove() {
    approveDraft.mutate(
      { draftId: draft.id },
      {
        onSuccess: () => toast.success("Draft approved"),
        onError: (err) => {
          if (err.isUnauthenticated) toast.error("Session expired. Please sign in again.");
          else if (err.isForbidden) toast.error("You don't have permission to approve drafts.");
          else toast.error("Failed to approve draft. Please try again.");
        },
      },
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10">
            <FileText className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-[13px] font-medium text-foreground">AI Draft Review</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${srcBadge.cls}`}>
            {srcBadge.label}
          </span>
          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Draft text */}
      <div className="px-4 py-3">
        {isEditing ? (
          <textarea
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            rows={5}
            maxLength={MAX_DRAFT_LENGTH}
            disabled={anyPending}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
          />
        ) : (
          <div
            className="rounded-lg border border-border bg-surface-muted/40 px-3 py-3 cursor-pointer hover:bg-surface-muted/60 transition-colors"
            onClick={() => setIsEditing(true)}
            title="Click to edit"
          >
            <p className="text-[13px] leading-[1.6] text-foreground/90 whitespace-pre-wrap break-words">
              {draft.draftText}
            </p>
          </div>
        )}

        {/* Character count */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">
            {isEditing && textChanged && <span className="text-info">Unsaved changes</span>}
          </span>
          <span
            className={`text-[10px] tabular-nums ${
              localText.length > MAX_DRAFT_LENGTH * 0.95
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {localText.length.toLocaleString()}/{MAX_DRAFT_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Mutation error */}
      {(editDraft.isError || discardDraft.isError || approveDraft.isError) && (
        <div className="mx-4 mb-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-[11px] text-foreground">
          {editDraft.error?.message ||
            discardDraft.error?.message ||
            approveDraft.error?.message ||
            "An error occurred."}
        </div>
      )}

      {/* No-autosend assurance */}
      <div className="mx-4 mb-3 flex items-center gap-2 rounded-md bg-surface-muted/60 px-3 py-2 text-[10px] text-muted-foreground">
        <Info className="h-3 w-3 shrink-0" />
        Approving does not send this message — nothing is sent automatically. After approval you can
        send it as a separate, explicit step.
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-card/60 px-4 py-3">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={!canSave}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editDraft.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {editDraft.isPending ? "Saving…" : "Save edit"}
            </button>
            <button
              type="button"
              onClick={() => {
                setLocalText(draft.draftText);
                setIsEditing(false);
              }}
              disabled={anyPending}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[12px] font-medium text-muted-foreground hover:bg-secondary disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={anyPending}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              disabled={anyPending}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[12px] font-medium text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {discardDraft.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
              {discardDraft.isPending ? "Discarding…" : "Discard"}
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={anyPending}
              className="ml-auto inline-flex items-center gap-2 rounded-md bg-success/90 px-3 py-2 text-[12px] font-medium text-success-foreground shadow-soft hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approveDraft.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              {approveDraft.isPending ? "Approving…" : "Approve draft"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
