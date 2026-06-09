import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /inbox — renders child routes through Outlet.
// The inbox list page is in inbox.index.tsx (renders at /inbox exact).
// The conversation detail page is in inbox.$conversationId.tsx (renders at /inbox/:id).
export const Route = createFileRoute("/inbox")({
  component: () => <Outlet />,
});
