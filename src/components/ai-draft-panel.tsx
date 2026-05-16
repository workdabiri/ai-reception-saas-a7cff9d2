import { useState } from "react";
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Pencil,
  X,
  RefreshCw,
  BookOpen,
  Info,
  Lock,
} from "lucide-react";

export type DraftState = "pending" | "accepted" | "edited" | "rejected";
export type DraftConfidence = "High" | "Medium" | "Low";

type Props = {
  draft: string;
  confidence?: DraftConfidence;
  sources?: string[];
  riskNote?: string;
  onAccept: (text: string) => void;
  onEdit: (text: string) => void;
  onReject: () => void;
};

const confidenceTone: Record<DraftConfidence, string> = {
  High: "bg-success/12 text-success border-success/25",
  Medium: "bg-warning/20 text-warning-foreground border-warning/35",
  Low: "bg-destructive/12 text-destructive border-destructive/25",
};

const confidencePct: Record<DraftConfidence, number> = {
  High: 92,
  Medium: 68,
  Low: 41,
};

const stateTone: Record<DraftState, string> = {
  pending: "bg-ai-soft text-[oklch(0.40_0.18_290)] border-[oklch(0.55_0.20_295)]/25",
  accepted: "bg-success/12 text-success border-success/25",
  edited: "bg-info/12 text-info border-info/25",
  rejected: "bg-muted text-muted-foreground border-border",
};

const stateLabel: Record<DraftState, string> = {
  pending: "Draft pending review",
  accepted: "Draft accepted",
  edited: "Draft edited",
  rejected: "Draft rejected",
};

export function AIDraftPanel({
  draft,
  confidence = "Medium",
  sources = ["Workspace FAQ · Scheduling policy", "Past replies to this customer"],
  riskNote,
  onAccept,
  onEdit,
  onReject,
}: Props) {
  const [state, setState] = useState<DraftState>("pending");
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(draft);

  const showRisk = confidence === "Low" || !!riskNote;
  const risk =
    riskNote ??
    "Some details (pricing, availability, insurance) may be outdated. Verify before sending.";

  return (
    <div className="overflow-hidden rounded-2xl glass-ai shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[oklch(0.55_0.20_295)]/20 px-4 py-3" style={{ background: "color-mix(in oklab, var(--color-ai) 8%, transparent)" }}>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg gradient-ai text-ai-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-[13px] font-medium tracking-tight text-foreground">
              AI Draft — Human Review Required
            </h3>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Suggested response. Operator sends final reply. AI does not auto-send in MVP.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${stateTone[state]}`}
        >
          {stateLabel[state]}
        </span>
      </div>

      {/* Confidence */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium uppercase tracking-wider text-muted-foreground">
            Confidence
          </span>
          <span
            className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${confidenceTone[confidence]}`}
          >
            {confidence} · {confidencePct[confidence]}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full ${
              confidence === "High"
                ? "bg-success"
                : confidence === "Medium"
                  ? "bg-warning"
                  : "bg-destructive"
            }`}
            style={{ width: `${confidencePct[confidence]}%` }}
          />
        </div>
      </div>

      {/* Draft body */}
      <div className="px-4 py-3">
        {editing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        ) : (
          <p className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm leading-relaxed text-foreground/90">
            {text}
          </p>
        )}
      </div>

      {/* Source / context */}
      <div className="mx-4 mb-3 rounded-lg border border-border bg-surface-muted/60 p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          Sources & context
        </div>
        <ul className="mt-1.5 space-y-1 text-[11px] text-foreground/80">
          {sources.map((s) => (
            <li key={s} className="flex items-start gap-1.5">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
              <span>{s}</span>
            </li>
          ))}
          <li className="flex items-start gap-1.5 text-muted-foreground">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            <span>Source linking is a planned capability — placeholder for MVP.</span>
          </li>
        </ul>
      </div>

      {/* Risk warning */}
      {showRisk && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-[11px] text-warning-foreground">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <div className="font-medium">Verify before sending</div>
            <div className="leading-snug">{risk}</div>
          </div>
        </div>
      )}

      {/* No-autosend assurance */}
      <div className="mx-4 mb-3 flex items-center gap-1.5 rounded-md bg-background/60 px-2.5 py-1.5 text-[10px] text-muted-foreground">
        <Lock className="h-3 w-3" />
        AI never sends. Operator review and approval is always required.
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-[oklch(0.55_0.20_295)]/15 bg-card/60 px-4 py-3">
        {!editing ? (
          <>
            <button
              onClick={() => {
                setState("accepted");
                onAccept(text);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg gradient-ai px-3.5 py-1.5 text-xs font-medium text-ai-foreground shadow-soft transition hover:opacity-95 active:translate-y-px"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accept draft
            </button>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit draft
            </button>
            <button
              onClick={() => {
                setState("rejected");
                onReject();
              }}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              <X className="h-3.5 w-3.5" />
              Reject draft
            </button>
            <button
              className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
              title="Mock — no real AI call"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setEditing(false);
                setState("edited");
                onEdit(text);
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-95"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Save edit
            </button>
            <button
              onClick={() => {
                setText(draft);
                setEditing(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <span className="ml-auto text-[10px] text-muted-foreground">
              Editing · changes stay in operator review
            </span>
          </>
        )}
      </div>
    </div>
  );
}
