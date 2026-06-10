import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /customers — renders child routes through Outlet.
// The customer list page is in customers.index.tsx (renders at /customers exact).
// The customer detail page is in customers.$customerId.tsx (renders at /customers/:customerId).
export const Route = createFileRoute("/customers")({
  component: () => <Outlet />,
});
