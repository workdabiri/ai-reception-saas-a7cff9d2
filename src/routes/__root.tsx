import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { AdminShell } from "@/components/admin-shell";
import { BusinessProvider } from "@/contexts/business-context";
import { themeBootScript } from "@/components/theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-medium text-foreground tracking-tight">404</h1>
        <h2 className="mt-4 text-xl font-medium text-foreground tracking-tight">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-medium tracking-tight text-foreground tracking-tight">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AI Reception — Human-first reception workspace" },
      {
        name: "description",
        content:
          "AI Reception is a human-first AI-assisted reception workspace for service businesses. Operators stay in control — AI drafts, humans send.",
      },
      { property: "og:title", content: "AI Reception — Human-first reception workspace" },
      {
        property: "og:description",
        content: "Operator-first inbox with AI drafts. Mock prototype.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "AI Reception — Human-first reception workspace" },
      {
        name: "description",
        content: "AI Reception Workspace is a premium UI/UX prototype for a B2B SaaS product.",
      },
      {
        property: "og:description",
        content: "AI Reception Workspace is a premium UI/UX prototype for a B2B SaaS product.",
      },
      {
        name: "twitter:description",
        content: "AI Reception Workspace is a premium UI/UX prototype for a B2B SaaS product.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/93e0d0f6-711c-474c-884d-ad2c41cf8c6b/id-preview-b0970bd7--bd179e44-2211-4f15-bcc7-fe40d1f91c7e.lovable.app-1778369692666.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/93e0d0f6-711c-474c-884d-ad2c41cf8c6b/id-preview-b0970bd7--bd179e44-2211-4f15-bcc7-fe40d1f91c7e.lovable.app-1778369692666.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-email",
  "/invite",
  "/access-denied",
  "/session-expired",
  "/onboarding",
  "/chat",
  "/widget-preview",
];

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuth = AUTH_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  let body: React.ReactNode;
  if (isAuth) body = <Outlet />;
  else if (isAdmin)
    body = (
      <AdminShell>
        <Outlet />
      </AdminShell>
    );
  else
    body = (
      <AppShell>
        <Outlet />
      </AppShell>
    );

  return (
    <QueryClientProvider client={queryClient}>
      <BusinessProvider>
        <TooltipProvider delayDuration={150}>{body}</TooltipProvider>
        <Toaster />
      </BusinessProvider>
    </QueryClientProvider>
  );
}
