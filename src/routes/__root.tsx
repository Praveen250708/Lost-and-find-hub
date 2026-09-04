import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import collegeLogoAsset from "@/assets/college-logo.png.asset.json";
import { Toaster } from "@/components/ui/sonner";
import { useAuth, logoutDemoUser } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, ShieldCheck } from "lucide-react";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
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
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
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
      { title: "SMVEC Campus Lost & Found Hub" },
      {
        name: "description",
        content:
          "A simple board for SMVEC college to post lost and found items and reach each other fast.",
      },
      { property: "og:title", content: "SMVEC Campus Lost & Found Hub" },
      {
        property: "og:description",
        content:
          "A simple board for SMVEC college to post lost and found items and reach each other fast.",
      },
      { property: "og:type", content: "website" },
      {
        name: "google-site-verification",
        content: "R5d6foSx-gqEWeWgL0jwi-W78nF-VQSgcM2HOzFPqC0",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}


function SiteHeader() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { queryClient } = Route.useRouteContext();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    logoutDemoUser();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-card/85 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <img
              src="/college-logo.svg"
              onError={(e) => {
                // Fallback to asset json url if svg fails
                (e.currentTarget as HTMLImageElement).src = collegeLogoAsset.url;
              }}
              alt="SMVEC college logo"
              className="size-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                SMVEC Lost &amp; Found
              </span>
              <span className="hidden items-center gap-0.5 rounded-md bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground sm:inline-flex">
                <ShieldCheck className="size-3" /> Campus Verified
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground hidden sm:block">
              Sri Manakula Vinayagar Engineering College
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/"
            className="rounded-lg px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            activeProps={{ className: "bg-muted font-semibold text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Board
          </Link>
          {userId ? (
            <>
              <Link
                to="/my-reports"
                className="rounded-lg px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-muted font-semibold text-foreground" }}
              >
                My reports
              </Link>
              <Link
                to="/profile"
                className="rounded-lg px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-muted font-semibold text-foreground" }}
              >
                Profile
              </Link>
            </>
          ) : null}

          <Link
            to="/report"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow"
          >
            <Sparkles className="size-3.5" />
            Report
          </Link>

          <div className="mx-1 h-5 w-px bg-border/60" aria-hidden="true" />

          <ThemeToggle />

          {userId ? (
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-border/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/auth"
              className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background selection:bg-accent/30">
        <SiteHeader />
        {/* Public board and routes render directly. Protected routes are secured by _authenticated/route.tsx */}
        <Outlet />
        <footer className="mt-auto border-t border-border/70 bg-card/40 py-8 text-center text-xs text-muted-foreground backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
            <div className="flex items-center gap-2">
              <img src="/college-logo.svg" alt="SMVEC" className="size-5 object-contain" />
              <p className="font-medium text-foreground">SMVEC Smart Campus Lost &amp; Found Portal</p>
            </div>
            <p className="text-muted-foreground">
              Madagadipet, Puducherry 605 107 · Please return found items to the College Security Office or rightful owner.
            </p>
            <p className="text-[11px] text-muted-foreground/80">
              Built with care for students &amp; staff
            </p>
          </div>
        </footer>
      </div>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}


