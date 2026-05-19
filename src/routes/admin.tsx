import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /admin — just renders child routes through Outlet.
// The AdminShell wrapper itself is mounted from __root.tsx based on the
// pathname, so this file is intentionally minimal.
export const Route = createFileRoute("/admin")({
  component: () => <Outlet />,
});
