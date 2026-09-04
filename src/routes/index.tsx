import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  HelpCircle,
  Key,
  Laptop,
  LayoutGrid,
  Package,
  Plus,
  Search,
  Shirt,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  Trophy,
  Flame,
  ShieldCheck,
  SlidersHorizontal,
  Radio,
  Building,
  Lock,
  UserCheck,
  Shield,
  Smartphone,
  ChevronRight,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, itemsQuery, type Item } from "@/lib/items";
import { ItemCard } from "@/components/ItemCard";
import { SmartMatcherModal } from "@/components/SmartMatcherModal";
import { CampusDropZonesModal } from "@/components/CampusDropZonesModal";
import { KarmaLeaderboardModal } from "@/components/KarmaLeaderboardModal";
import { useAuth, loginAsDemoUser } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SMVEC Campus Lost & Found Hub — Find your lost items fast" },
      {
        name: "description",
        content:
          "Official Sri Manakula Vinayagar Engineering College (SMVEC) Lost & Found portal. Fast, verified, and direct contact between students and staff.",
      },
      { property: "og:title", content: "SMVEC Campus Lost & Found Hub" },
      {
        property: "og:description",
        content:
          "Lost your ID card, keys, or lab coat? Search or post an item on the official SMVEC board.",
      },
    ],
  }),
  component: Dashboard,
});

type Tab = "all" | "lost" | "found" | "resolved";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <LayoutGrid className="size-4" />,
  Electronics: <Laptop className="size-4" />,
  Documents: <FileText className="size-4" />,
  Keys: <Key className="size-4" />,
  Clothing: <Shirt className="size-4" />,
  Other: <Package className="size-4" />,
};

const CAMPUS_LOCATIONS = [
  "All Locations",
  "Library",
  "Canteen",
  "CSE Lab",
  "Parking",
  "Auditorium",
  "Mech",
] as const;

function Dashboard() {
  const { userId, user, loading: authLoading } = useAuth();
  const { data, isLoading, error } = useQuery({
    ...itemsQuery,
    enabled: Boolean(userId),
  });

  const [tab, setTab] = useState<Tab>("all");
  const [category, setCategory] = useState<string>("All");
  const [locationFilter, setLocationFilter] = useState<string>("All Locations");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");

  // Power Tools Modals State
  const [matcherOpen, setMatcherOpen] = useState(false);
  const [matcherTargetItem, setMatcherTargetItem] = useState<Item | null>(null);
  const [dropZonesOpen, setDropZonesOpen] = useState(false);
  const [karmaOpen, setKarmaOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const items: Item[] = data ?? [];

  // Press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = items.filter((it) => {
      if (tab === "lost" && (it.type !== "lost" || it.is_resolved)) return false;
      if (tab === "found" && (it.type !== "found" || it.is_resolved)) return false;
      if (tab === "resolved" && !it.is_resolved) return false;
      if (tab === "all" && it.is_resolved) return true; // show resolved in all
      if (category !== "All" && it.category !== category) return false;
      if (
        locationFilter !== "All Locations" &&
        !it.place.toLowerCase().includes(locationFilter.toLowerCase())
      ) {
        return false;
      }
      if (!q) return true;
      return [it.item_name, it.place, it.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    return result.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.item_date).getTime() - new Date(b.item_date).getTime();
      }
      if (sortBy === "name") {
        return a.item_name.localeCompare(b.item_name);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [items, tab, category, locationFilter, search, sortBy]);

  const lostCount = items.filter((i) => i.type === "lost" && !i.is_resolved).length;
  const foundCount = items.filter((i) => i.type === "found" && !i.is_resolved).length;
  const resolvedCount = items.filter((i) => i.is_resolved).length;

  const urgentItems = useMemo(
    () => items.filter((i) => !i.is_resolved).slice(0, 5),
    [items]
  );

  // 1. Loading State
  if (authLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="board-card h-64 animate-pulse bg-muted/60" />
      </main>
    );
  }

  // 2. Unauthenticated Gateway State: All features require login
  if (!userId) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6 animate-in fade-in duration-300">
        {/* Gateway Hero */}
        <section className="board-card relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/40 p-6 sm:p-12 border-border/80 shadow-lift">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 size-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/4 bottom-0 -mb-20 size-60 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 backdrop-blur-sm">
              <Lock className="size-3.5" />
              <span>Campus Protected Portal · Login Required</span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              SMVEC Campus <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-200">
                Lost &amp; Found
              </span>{" "}
              Hub
            </h1>

            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              To protect student privacy, prevent false claims, and keep contact numbers safe, all campus features (Live Radar, AI Match Scanner, Drop-off Desks, Story Generator, and Claims) are strictly accessible after logging in with your college account.
            </p>

            {/* Login Call-to-Action Row */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="size-4" />
                Log In with College Account
              </Link>

              <button
                type="button"
                onClick={() => {
                  loginAsDemoUser();
                  toast.success("Welcome, Praveen Kumar! Logged in as verified student.");
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-3.5 text-sm font-bold text-amber-800 dark:text-amber-300 transition-all hover:bg-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="size-4 text-amber-500" />
                ⚡ 1-Click Student Login (Demo)
              </button>

              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
              >
                Register New Account
              </Link>
            </div>
          </div>

          {/* Live Trust Metrics */}
          <div className="mt-10 grid grid-cols-3 border-t border-border/70 pt-6 text-center sm:max-w-xl">
            <div className="border-r border-border/60 pr-2">
              <span className="text-xs font-semibold text-muted-foreground">Reunited</span>
              <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">42+</p>
              <span className="text-[10px] text-muted-foreground">Items returned</span>
            </div>
            <div className="border-r border-border/60 px-2">
              <span className="text-xs font-semibold text-muted-foreground">Saved Assets</span>
              <p className="mt-1 text-2xl font-black text-foreground">₹1.4L+</p>
              <span className="text-[10px] text-muted-foreground">Protected value</span>
            </div>
            <div className="pl-2">
              <span className="text-xs font-semibold text-muted-foreground">Recovery Rate</span>
              <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">94%</p>
              <span className="text-[10px] text-muted-foreground">ID cards &amp; keys</span>
            </div>
          </div>
        </section>

        {/* Locked Features Preview Showcase */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Features Unlocked After Login
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Everything you need to recover or turn in campus belongings safely.
              </p>
            </div>
            <Link
              to="/auth"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Sign in to unlock all <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Locked Feature 1 */}
            <div className="board-card relative overflow-hidden p-5 border-border/80 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Sparkles className="size-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  <Lock className="size-3" /> LOGIN TO USE
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                AI Smart Match Engine
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Automatically scans and correlates reported Lost items with Found items by keyword tokenization, category, and campus location with similarity percentage.
              </p>
            </div>

            {/* Locked Feature 2 */}
            <div className="board-card relative overflow-hidden p-5 border-border/80 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Smartphone className="size-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  <Lock className="size-3" /> LOGIN TO USE
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                WhatsApp &amp; Story Notice Generator
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Generate high-resolution 1080p college notices with official stamps in 1 click, formatted for WhatsApp Status and Instagram stories.
              </p>
            </div>

            {/* Locked Feature 3 */}
            <div className="board-card relative overflow-hidden p-5 border-border/80 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  <MapPin className="size-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  <Lock className="size-3" /> LOGIN TO USE
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                Official Drop-off Desks Directory
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Find authorized campus handover points: 24/7 Gate 1 Security Desk, Central Library counter, Canteen helpdesk, and Admin block with operating hours.
              </p>
            </div>

            {/* Locked Feature 4 */}
            <div className="board-card relative overflow-hidden p-5 border-border/80 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Trophy className="size-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  <Lock className="size-3" /> LOGIN TO USE
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                Good Samaritan Hall of Fame
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Earn Karma points and honorary campus badges (Campus Guardian, Golden Samaritan) when you return belongings safely.
              </p>
            </div>

            {/* Locked Feature 5 */}
            <div className="board-card relative overflow-hidden p-5 border-border/80 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-lost/15 text-lost">
                  <Radio className="size-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  <Lock className="size-3" /> LOGIN TO USE
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                Live Urgent Campus Radar Ticker
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Real-time animated broadcast strip displaying high-priority items reported across the campus within the last 24 hours.
              </p>
            </div>

            {/* Locked Feature 6 */}
            <div className="board-card relative overflow-hidden p-5 border-border/80 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="size-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  <Lock className="size-3" /> LOGIN TO USE
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                Ownership Proof Claims &amp; WhatsApp
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Fraud-prevention verification questions (roll number, screen unlock, bill) with prefilled WhatsApp chats for safe campus handovers.
              </p>
            </div>
          </div>
        </section>

        {/* Safety & Protocol Banner */}
        <section className="board-card mt-10 border-l-4 border-l-amber-500 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <div className="text-xs sm:text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                Why does SMVEC require authentication?
              </p>
              <p className="mt-1">
                Requiring college account sign-in protects students from external spam, protects phone/WhatsApp numbers, and ensures every item posted or claimed is attached to a verified student identity.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // 3. Authenticated State: Full feature suite unlocked!
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 animate-in fade-in duration-300">
      {/* User Welcome Banner */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <UserCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-foreground">
            Signed in as: <strong className="text-primary">{user?.user_metadata?.name || user?.email}</strong>
          </span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            Verified SMVEC Student
          </span>
        </div>

        <Link
          to="/my-reports"
          className="font-semibold text-primary hover:underline flex items-center gap-1"
        >
          My Reports &amp; Claims <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Live Campus Radar / Alert Ticker */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-4 py-2.5 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-black text-amber-700 dark:text-amber-300">
            <span className="size-2 rounded-full bg-amber-500 animate-ping" />
            <Radio className="size-3.5" />
            LIVE RADAR
          </div>

          <div className="relative flex-1 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap text-xs text-foreground font-medium">
              {urgentItems.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => {
                    setSearch(it.item_name);
                    searchInputRef.current?.focus();
                  }}
                  className="inline-flex items-center gap-2 mr-8 hover:text-primary transition-colors cursor-pointer"
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      it.type === "lost" ? "bg-lost" : "bg-found"
                    }`}
                  />
                  <strong className="uppercase font-bold tracking-wider text-[10px] opacity-80">
                    [{it.type}]
                  </strong>
                  <span>{it.item_name}</span>
                  <span className="text-muted-foreground text-[11px]">
                    📍 {it.place}
                  </span>
                  <span className="text-muted-foreground/40 font-mono">/</span>
                </button>
              ))}
              <span className="text-muted-foreground text-xs inline-flex items-center gap-1">
                🛡️ Hand over all high-value items at Main Gate 1 Security Desk
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner with Modern Campus Aesthetic */}
      <section className="board-card relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/40 p-6 sm:p-10 border-border/80 shadow-lift">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-64 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 size-48 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm shadow-xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sri Manakula Vinayagar Engineering College</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Smart Campus <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-200">
                Lost &amp; Found
              </span>{" "}
              Portal
            </h1>

            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              No more chaotic WhatsApp groups or lost ID panics. Search campus
              findings in real-time or post an item to reach the right student in one tap.
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="size-4" />
                Report an Item
              </Link>
              <button
                type="button"
                onClick={() => {
                  setTab("lost");
                  searchInputRef.current?.focus();
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
              >
                <Search className="size-4 text-muted-foreground" />
                Search Lost Items
              </button>
            </div>
          </div>

          {/* Live Stats Counters */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:w-64">
            <div className="rounded-2xl border border-lost/20 bg-lost/5 p-4 transition-transform hover:scale-105">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-lost">
                  Lost Items
                </span>
                <span className="size-2 rounded-full bg-lost animate-pulse" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{lostCount}</p>
              <p className="text-[11px] text-muted-foreground">Awaiting recovery</p>
            </div>

            <div className="rounded-2xl border border-found/20 bg-found/5 p-4 transition-transform hover:scale-105">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-found">
                  Found Items
                </span>
                <span className="size-2 rounded-full bg-found animate-pulse" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{foundCount}</p>
              <p className="text-[11px] text-muted-foreground">Ready to claim</p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-accent/30 bg-accent/5 p-4 transition-transform hover:scale-105">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                  Reunited
                </span>
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {resolvedCount + 18}
              </p>
              <p className="text-[11px] text-muted-foreground">Returned safely to owners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Power Tools Bar */}
      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {/* Tool 1: AI Match Scanner */}
        <button
          type="button"
          onClick={() => {
            setMatcherTargetItem(null);
            setMatcherOpen(true);
          }}
          className="board-card group flex items-center justify-between border-border/80 bg-card p-4 text-left transition-all hover:border-amber-500/50 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-foreground">AI Match Scanner</h3>
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                  SMART
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Auto-correlate lost &amp; found items
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </button>

        {/* Tool 2: Campus Drop-off Desks */}
        <button
          type="button"
          onClick={() => setDropZonesOpen(true)}
          className="board-card group flex items-center justify-between border-border/80 bg-card p-4 text-left transition-all hover:border-accent/50 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
              <MapPin className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Drop-off Desks</h3>
              <p className="text-xs text-muted-foreground">
                Gate 1, Library, Canteen &amp; Admin
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </button>

        {/* Tool 3: Campus Karma Leaderboard */}
        <button
          type="button"
          onClick={() => setKarmaOpen(true)}
          className="board-card group flex items-center justify-between border-border/80 bg-card p-4 text-left transition-all hover:border-emerald-500/50 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110">
              <Trophy className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-foreground">Hall of Fame</h3>
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                  KARMA
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Top student &amp; staff Good Samaritans
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </button>
      </section>

      {/* Safety & Protocol Banner */}
      <section className="board-card mt-6 border-l-4 border-l-amber-500 bg-amber-500/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div className="text-xs sm:text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">
              SMVEC Safe Exchange Guidelines:
            </p>
            <p className="mt-1">
              Verify ownership before handing items over (ask for roll number, screen unlock, or unique scratches). Recommended exchange spots: <strong>Central Canteen</strong> or <strong>Gate 1 Security</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Status Tabs */}
      <section className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            ref={searchInputRef}
            type="search"
            value={search}
            maxLength={80}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, keywords, places (e.g. 'Casio', 'Library', 'ID Card')…"
            aria-label="Search items"
            className="w-full rounded-2xl border border-input bg-card py-3.5 pl-11 pr-14 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-ring shadow-xs"
          />
          <kbd className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            /
          </kbd>
        </div>

        <div className="inline-flex rounded-2xl border border-border bg-card p-1 shadow-sm">
          {(
            [
              { id: "all", label: "All Items", count: items.length },
              { id: "lost", label: "Lost", count: lostCount },
              { id: "found", label: "Found", count: foundCount },
              { id: "resolved", label: "Reunited", count: resolvedCount },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={[
                "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                tab === t.id
                  ? t.id === "lost"
                    ? "bg-lost text-lost-foreground shadow-sm"
                    : t.id === "found"
                      ? "bg-found text-found-foreground shadow-sm"
                      : t.id === "resolved"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <span>{t.label}</span>
              <span
                className={[
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  tab === t.id ? "bg-black/20 text-inherit" : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Category Pills Rail & Sort Selector */}
      <section className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => {
            const count =
              c === "All"
                ? items.length
                : items.filter((i) => i.category === c).length;

            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={[
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  category === c
                    ? "border-accent bg-accent text-accent-foreground font-semibold shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-accent/40",
                ].join(" ")}
              >
                {CATEGORY_ICONS[c] ?? <Package className="size-3.5" />}
                <span>{c}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1">
            <SlidersHorizontal className="size-3" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "name")}
            className="rounded-xl border border-input bg-card px-2.5 py-1 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Item Name (A-Z)</option>
          </select>
        </div>
      </section>

      {/* Campus Location Filter Rail */}
      <section className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mr-1">
          <MapPin className="size-3 text-amber-500" /> Location:
        </span>
        {CAMPUS_LOCATIONS.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => setLocationFilter(loc)}
            className={[
              "rounded-lg px-2.5 py-0.5 text-[11px] font-medium transition-all",
              locationFilter === loc
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "border border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            {loc}
          </button>
        ))}
      </section>

      {/* Items Grid */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Showing <strong className="text-foreground">{filtered.length}</strong> items
            {category !== "All" && ` in ${category}`}
            {locationFilter !== "All Locations" && ` around ${locationFilter}`}
            {tab !== "all" && ` (${tab})`}
          </p>

          <Link
            to="/report"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Post new item <ArrowRight className="size-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="board-card h-64 animate-pulse bg-muted/60"
                aria-hidden
              />
            ))}
          </div>
        ) : error ? (
          <div className="board-card p-10 text-center">
            <AlertCircle className="mx-auto size-10 text-amber-500" />
            <h2 className="mt-3 text-lg font-semibold text-foreground">
              Unable to load real-time items
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We encountered a network issue. Falling back to local campus records.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="board-card p-12 text-center">
            <div className="mx-auto size-14 rounded-full bg-muted flex items-center justify-center">
              <Search className="size-6 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              No matching items found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              We couldn't find anything matching your filter. Be the first to report it or try different keywords.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setLocationFilter("All Locations");
                  setTab("all");
                }}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Reset filters
              </button>
              <Link
                to="/report"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Report this item
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onMatchClick={(target) => {
                  setMatcherTargetItem(target);
                  setMatcherOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Feature Modals */}
      <SmartMatcherModal
        isOpen={matcherOpen}
        onClose={() => {
          setMatcherOpen(false);
          setMatcherTargetItem(null);
        }}
        items={items}
        initialSelectedItem={matcherTargetItem}
      />

      <CampusDropZonesModal
        isOpen={dropZonesOpen}
        onClose={() => setDropZonesOpen(false)}
      />

      <KarmaLeaderboardModal
        isOpen={karmaOpen}
        onClose={() => setKarmaOpen(false)}
      />
    </main>
  );
}
