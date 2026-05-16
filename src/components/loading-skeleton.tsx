// Skeleton primitives that mirror the actual content layout — used instead of
// spinners for any wait >500ms. Pure presentation; no data dependency.
import type { ReactNode } from "react";

function Bone({
  className = "",
  w,
  h = "h-3",
  rounded = "rounded",
}: {
  className?: string;
  w?: string;
  h?: string;
  rounded?: string;
}) {
  return (
    <div className={`skeleton ${rounded} ${h} ${w ?? "w-full"} ${className}`} />
  );
}

export function LoadingSkeleton({
  variant,
  count = 5,
}: {
  variant: "kpi-grid" | "table-rows" | "conversation-list" | "card" | "text";
  count?: number;
}) {
  if (variant === "kpi-grid") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl bg-surface px-6 py-5 shadow-card"
          >
            <div className="flex items-start justify-between">
              <Bone w="w-24" />
              <div className="skeleton h-8 w-8 rounded-lg" />
            </div>
            <Bone className="mt-4" w="w-[60px]" h="h-8" />
            <Bone className="mt-3" w="w-16" h="h-2.5" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table-rows") {
    return (
      <div className="divide-y divide-border rounded-xl border border-border bg-surface">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
            <Bone w="w-40" />
            <Bone w="w-24" />
            <Bone className="ml-auto" w="w-16" h="h-2.5" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "conversation-list") {
    return (
      <div className="space-y-1 p-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg px-3 py-3">
            <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Bone w="w-28" />
                <Bone w="w-10" h="h-2.5" />
              </div>
              <Bone w="w-full" h="h-2.5" />
              <Bone w="w-2/3" h="h-2.5" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (variant === "card") {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <Bone w="w-32" h="h-3.5" />
        <Bone className="mt-4" w="w-full" />
        <Bone className="mt-2" w="w-full" />
        <Bone className="mt-2" w="w-3/4" />
      </div>
    );
  }

  // text
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Bone key={i} w={i === count - 1 ? "w-2/3" : "w-full"} />
      ))}
    </div>
  );
}

/** Wrap content with a skeleton fallback when `loading` is true. */
export function SkeletonGate({
  loading,
  skeleton,
  children,
}: {
  loading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
}) {
  return <>{loading ? skeleton : children}</>;
}
