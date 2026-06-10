import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /channels — renders child routes through Outlet.
// The channel list page is in channels.index.tsx (renders at /channels exact).
// The channel detail page is in channels.$channelId.tsx (renders at /channels/:channelId).
export const Route = createFileRoute("/channels")({
  component: () => <Outlet />,
});
