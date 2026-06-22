import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, MockBanner } from "@/components/ui-bits";
import { useBusinessId } from "@/contexts/business-context";
import {
  useKnowledgeList,
  useCreateKnowledgeItem,
  useVerifyKnowledgeItem,
  useArchiveKnowledgeItem,
} from "@/hooks/use-knowledge";
import {
  KNOWLEDGE_SOURCE_TYPES,
  type BusinessContextItem,
  type CreateKnowledgeItemInput,
  type KnowledgeStatus,
  type KnowledgeSourceType,
} from "@/lib/api-types";
import type { ApiClientError } from "@/lib/api-client";
import { Pill, type PillVariant } from "@/components/ui/pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useStateParam,
  presets as statePresets,
  RouteStatePage,
  RouteSkeleton,
  StateBanner,
} from "@/components/route-state";
import {
  Sparkles,
  Plus,
  ShieldCheck,
  Clock,
  Archive,
  Lock,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  ExternalLink,
  Loader2,
  Inbox,
} from "lucide-react";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge — AI Reception" },
      {
        name: "description",
        content:
          "Manage verified business context the AI receptionist can use later. Drafts are not AI-eligible until verified.",
      },
    ],
  }),
  component: KnowledgePage,
});

// ---------------------------------------------------------------------------
// Display config
// ---------------------------------------------------------------------------

const STATUS_PILL: Record<KnowledgeStatus, { variant: PillVariant; label: string }> = {
  VERIFIED: { variant: "success", label: "Verified" },
  DRAFT: { variant: "warn", label: "Draft" },
  ARCHIVED: { variant: "muted", label: "Archived" },
};

const SOURCE_TYPE_LABEL: Record<KnowledgeSourceType, string> = {
  OWNER_APPROVED: "Owner approved",
  OPERATOR_APPROVED: "Operator approved",
  SYSTEM_SEEDED: "System seeded",
  IMPORT: "Imported",
  OTHER: "Other",
};

/** Source types a human may pick when creating an item (SYSTEM_SEEDED is backend-only). */
const CREATE_SOURCE_TYPES: KnowledgeSourceType[] = KNOWLEDGE_SOURCE_TYPES.filter(
  (s) => s !== "SYSTEM_SEEDED",
);

const TABS: { status: KnowledgeStatus; label: string; icon: typeof ShieldCheck }[] = [
  { status: "VERIFIED", label: "Verified", icon: ShieldCheck },
  { status: "DRAFT", label: "Pending Review", icon: Clock },
  { status: "ARCHIVED", label: "Archived", icon: Archive },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function sourceTypeLabel(sourceType: KnowledgeSourceType): string {
  return SOURCE_TYPE_LABEL[sourceType] ?? sourceType;
}

/** Maps an API error to a calm, human toast message for mutations. */
function mutationErrorMessage(err: ApiClientError, action: string): string {
  if (err.isUnauthenticated) return "Session expired. Please sign in again.";
  if (err.isForbidden) return `You do not have permission to ${action}.`;
  if (err.isValidationError) return err.message || "Please check your input and try again.";
  return `Could not ${action}. Please try again.`;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

function KnowledgePage() {
  const stateOverride = useStateParam();
  const businessId = useBusinessId();

  const [activeStatus, setActiveStatus] = useState<KnowledgeStatus>("VERIFIED");
  const [selected, setSelected] = useState<BusinessContextItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // ── Dev-state overrides (?state= param) ─────────────────────────────────
  if (stateOverride === "empty") {
    return <RouteStatePage title="Knowledge">{statePresets.knowledgeEmpty()}</RouteStatePage>;
  }
  if (stateOverride === "access-denied") {
    return (
      <RouteStatePage title="Knowledge">{statePresets.knowledgeAccessDenied()}</RouteStatePage>
    );
  }
  if (stateOverride === "loading") {
    return (
      <RouteStatePage title="Knowledge" description="Loading knowledge…">
        <RouteSkeleton variant="cards" />
      </RouteStatePage>
    );
  }

  // ── No businessId (VITE_DEV_BUSINESS_ID not set in development) ──────────
  if (!businessId) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
        <PageHeader
          title="Knowledge"
          description="Verified business context is used later by the AI receptionist. Drafts are not AI-eligible until verified."
        />
        <StateBanner
          icon={AlertTriangle}
          tone="warning"
          title="No business configured"
          description="Set VITE_DEV_BUSINESS_ID in your .env.local file to load knowledge."
        />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-6">
        <PageHeader
          title="Knowledge"
          description="Verified business context is used later by the AI receptionist. Drafts are not AI-eligible until verified."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/settings/ai"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-[12.5px] font-medium hover:bg-secondary"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI assistance settings
              </Link>
              <Button onClick={() => setCreateOpen(true)} className="h-9">
                <Plus className="h-3.5 w-3.5" />
                Add knowledge
              </Button>
            </div>
          }
        />

        <MockBanner />

        <div className="callout callout--primary flex items-start gap-3">
          <BookOpen className="callout-icon mt-0.5 shrink-0" />
          <div className="callout-body">
            <span className="callout-title" style={{ marginBottom: 0, display: "inline" }}>
              How knowledge is used.
            </span>{" "}
            Verified items can be used later as business context. Draft items are not used by the AI
            receptionist until verified, and archiving removes an item from AI eligibility.
            Operators always review and send every customer reply.
          </div>
        </div>

        {/* Segmented tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.status === activeStatus;
            return (
              <button
                key={t.status}
                type="button"
                onClick={() => setActiveStatus(t.status)}
                aria-pressed={active}
                className={
                  active
                    ? "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] font-medium text-foreground shadow-soft"
                    : "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-[12.5px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <KnowledgeTabContent
          businessId={businessId}
          status={activeStatus}
          onSelect={(item) => setSelected(item)}
        />
      </div>

      {/* Create form */}
      <CreateKnowledgeDialog
        businessId={businessId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => setActiveStatus("DRAFT")}
      />

      {/* Item detail / review */}
      <KnowledgeDetailSheet
        businessId={businessId}
        item={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab content — one query per active status
// ---------------------------------------------------------------------------

function KnowledgeTabContent({
  businessId,
  status,
  onSelect,
}: {
  businessId: string;
  status: KnowledgeStatus;
  onSelect: (item: BusinessContextItem) => void;
}) {
  const { data, isLoading, isError, error, refetch, isFetching } = useKnowledgeList(businessId, {
    status,
  });

  if (isLoading) {
    return <RouteSkeleton variant="cards" />;
  }

  if (isError) {
    const apiErr = error as ApiClientError;
    // 403 → calm "no permission to view this queue" state (the API is authoritative).
    if (apiErr?.isForbidden) {
      return (
        <EmptyBlock
          icon={Lock}
          title="You do not have permission to view this queue"
          description={
            status === "DRAFT"
              ? "Reviewing pending knowledge requires the verify permission. Ask an Owner or Admin for access."
              : status === "ARCHIVED"
                ? "Viewing archived knowledge requires the archive permission. Ask an Owner or Admin for access."
                : "Your current role cannot view this knowledge queue."
          }
        />
      );
    }
    if (apiErr?.isUnauthenticated) {
      return (
        <EmptyBlock
          icon={Lock}
          title="Session expired"
          description="Please sign in again to continue."
          action={
            <Link to="/login">
              <Button variant="outline" className="h-9">
                Sign in again
              </Button>
            </Link>
          }
        />
      );
    }
    return (
      <EmptyBlock
        icon={AlertTriangle}
        title="Could not load knowledge"
        description="Something went wrong while fetching this queue. Please try again."
        action={
          <Button variant="outline" className="h-9" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
        }
      />
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <EmptyBlock
        icon={Inbox}
        title={
          status === "VERIFIED"
            ? "No verified knowledge yet"
            : status === "DRAFT"
              ? "Nothing pending review"
              : "No archived knowledge"
        }
        description={
          status === "VERIFIED"
            ? "Verify draft items so they can be used later as business context."
            : status === "DRAFT"
              ? "New knowledge you add starts as a draft here, awaiting verification."
              : "Archived items are removed from AI eligibility and appear here."
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <span>
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
        {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      </div>
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <KnowledgeCard item={item} onSelect={() => onSelect(item)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function KnowledgeCard({ item, onSelect }: { item: BusinessContextItem; onSelect: () => void }) {
  const pill = STATUS_PILL[item.status];
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-soft transition hover:border-border-strong hover:bg-surface-muted/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {item.category}
            </span>
            <span className="truncate text-[13px] font-medium text-foreground">{item.key}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
            {item.value}
          </p>
        </div>
        <Pill variant={pill.variant} size="sm" className="shrink-0">
          {pill.label}
        </Pill>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span>Source: {sourceTypeLabel(item.sourceType)}</span>
        <span>Updated {formatDate(item.updatedAt)}</span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Item detail / review (Sheet)
// ---------------------------------------------------------------------------

function KnowledgeDetailSheet({
  businessId,
  item,
  onOpenChange,
}: {
  businessId: string;
  item: BusinessContextItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  const verify = useVerifyKnowledgeItem(businessId);
  const archive = useArchiveKnowledgeItem(businessId);

  const busy = verify.isPending || archive.isPending;

  const handleVerify = () => {
    if (!item) return;
    verify.mutate(
      { itemId: item.id },
      {
        onSuccess: () => {
          toast.success("Knowledge verified");
          onOpenChange(false);
        },
        onError: (err) => toast.error(mutationErrorMessage(err, "verify this item")),
      },
    );
  };

  const handleArchive = () => {
    if (!item) return;
    archive.mutate(
      { itemId: item.id },
      {
        onSuccess: () => {
          toast.success("Knowledge archived");
          onOpenChange(false);
        },
        onError: (err) => toast.error(mutationErrorMessage(err, "archive this item")),
      },
    );
  };

  const pill = item ? STATUS_PILL[item.status] : null;

  return (
    <Sheet open={!!item} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Knowledge item</SheetTitle>
          <SheetDescription>
            Review the item and its provenance. Verified items can be used later as business
            context.
          </SheetDescription>
        </SheetHeader>

        {item && pill && (
          <div className="mt-4 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Pill variant={pill.variant} size="md">
                {pill.label}
              </Pill>
              <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {item.category}
              </span>
            </div>

            <DetailField label="Key">
              <div className="text-[13px] font-medium text-foreground break-words">{item.key}</div>
            </DetailField>

            <DetailField label="Value">
              <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-surface-muted/50 p-3 text-[12.5px] leading-relaxed text-foreground break-words">
                {item.value}
              </div>
            </DetailField>

            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Source type">
                <div className="text-[12.5px] text-foreground">
                  {sourceTypeLabel(item.sourceType)}
                </div>
              </DetailField>
              <DetailField label="Source label">
                <div className="text-[12.5px] text-foreground break-words">
                  {item.sourceLabel ?? "—"}
                </div>
              </DetailField>
            </div>

            {item.sourceUrl && (
              <DetailField label="Source URL">
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary hover:underline break-all"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  {item.sourceUrl}
                </a>
              </DetailField>
            )}

            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Created">
                <div className="text-[12.5px] text-foreground">{formatDate(item.createdAt)}</div>
              </DetailField>
              <DetailField label="Verified">
                <div className="text-[12.5px] text-foreground">
                  {item.status === "VERIFIED" ? formatDate(item.verifiedAt) : "—"}
                </div>
              </DetailField>
            </div>

            {/* Actions */}
            {item.status === "ARCHIVED" ? (
              <div className="rounded-lg border border-border bg-surface-muted/50 p-3 text-[12px] text-muted-foreground">
                <Lock className="mr-1 inline h-3.5 w-3.5" />
                Archived items are removed from AI eligibility.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                {item.status === "DRAFT" && (
                  <Button onClick={handleVerify} disabled={busy} className="h-9">
                    {verify.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    )}
                    Verify
                  </Button>
                )}
                <Button variant="outline" onClick={handleArchive} disabled={busy} className="h-9">
                  {archive.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Archive className="h-3.5 w-3.5" />
                  )}
                  Archive
                </Button>
              </div>
            )}

            {item.status === "DRAFT" && (
              <p className="text-[11px] text-muted-foreground">
                Verifying marks this item as usable business context. It does not trigger any AI
                generation.
              </p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create form (Dialog)
// ---------------------------------------------------------------------------

type CreateFormErrors = Partial<Record<"category" | "key" | "value" | "sourceUrl", string>>;

function isUrlLike(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function CreateKnowledgeDialog({
  businessId,
  open,
  onOpenChange,
  onCreated,
}: {
  businessId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const create = useCreateKnowledgeItem(businessId);

  const [category, setCategory] = useState("");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [sourceType, setSourceType] = useState<KnowledgeSourceType>("OWNER_APPROVED");
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [errors, setErrors] = useState<CreateFormErrors>({});

  const reset = () => {
    setCategory("");
    setKey("");
    setValue("");
    setSourceType("OWNER_APPROVED");
    setSourceLabel("");
    setSourceUrl("");
    setErrors({});
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const validate = (): CreateFormErrors => {
    const next: CreateFormErrors = {};
    if (!category.trim()) next.category = "Category is required.";
    if (!key.trim()) next.key = "Key is required.";
    if (!value.trim()) next.value = "Value is required.";
    if (sourceUrl.trim() && !isUrlLike(sourceUrl.trim())) {
      next.sourceUrl = "Enter a valid http(s) URL, or leave it empty.";
    }
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const input: CreateKnowledgeItemInput = {
      category: category.trim(),
      key: key.trim(),
      value: value.trim(),
      sourceType,
      sourceLabel: sourceLabel.trim() ? sourceLabel.trim() : null,
      sourceUrl: sourceUrl.trim() ? sourceUrl.trim() : null,
    };

    create.mutate(input, {
      onSuccess: () => {
        toast.success("Draft knowledge added. Verify it to make it AI-eligible.");
        reset();
        onOpenChange(false);
        onCreated();
      },
      onError: (err) => toast.error(mutationErrorMessage(err, "add this item")),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add knowledge</DialogTitle>
          <DialogDescription>
            New items are saved as a draft. Draft items are not used by the AI receptionist until
            verified.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="knowledge-category">Category</Label>
              <Input
                id="knowledge-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Hours"
                aria-invalid={!!errors.category}
              />
              {errors.category && <p className="text-[11px] text-destructive">{errors.category}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="knowledge-key">Key</Label>
              <Input
                id="knowledge-key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g. opening_hours"
                aria-invalid={!!errors.key}
              />
              {errors.key && <p className="text-[11px] text-destructive">{errors.key}</p>}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="knowledge-value">Value</Label>
            <Textarea
              id="knowledge-value"
              rows={4}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="The business-owned fact operators and the AI receptionist can rely on."
              aria-invalid={!!errors.value}
            />
            {errors.value && <p className="text-[11px] text-destructive">{errors.value}</p>}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="knowledge-source-type">Source type</Label>
              <select
                id="knowledge-source-type"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as KnowledgeSourceType)}
                className="h-9 rounded-md border border-input bg-surface px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                {CREATE_SOURCE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {sourceTypeLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="knowledge-source-label">Source label (optional)</Label>
              <Input
                id="knowledge-source-label"
                value={sourceLabel}
                onChange={(e) => setSourceLabel(e.target.value)}
                placeholder="e.g. Front-desk policy"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="knowledge-source-url">Source URL (optional)</Label>
            <Input
              id="knowledge-source-url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/policy"
              aria-invalid={!!errors.sourceUrl}
            />
            {errors.sourceUrl && <p className="text-[11px] text-destructive">{errors.sourceUrl}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Add as draft
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Shared empty/error block
// ---------------------------------------------------------------------------

function EmptyBlock({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Inbox;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center px-6 py-16 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-surface-muted">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="mb-1.5 text-[16px] font-medium leading-tight text-foreground">{title}</h3>
        <p className="mb-5 text-[13px] leading-[1.5] text-muted-foreground">{description}</p>
        {action}
      </div>
    </div>
  );
}
