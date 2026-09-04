import {
  Trophy,
  Award,
  Medal,
  Sparkles,
  Heart,
  CheckCircle2,
  X,
  TrendingUp,
  Shield,
  Star,
} from "lucide-react";

interface GoodSamaritan {
  rank: number;
  name: string;
  role: string;
  itemsReturned: number;
  karmaPoints: number;
  badge: string;
  badgeColor: string;
}

const LEADERBOARD: GoodSamaritan[] = [
  {
    rank: 1,
    name: "Main Security Control Desk",
    role: "Campus Central Security Wing",
    itemsReturned: 28,
    karmaPoints: 1420,
    badge: "Official Custodian",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    rank: 2,
    name: "Vignesh S",
    role: "IT Department Staff",
    itemsReturned: 14,
    karmaPoints: 850,
    badge: "Golden Samaritan",
    badgeColor: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  },
  {
    rank: 3,
    name: "Karthik R",
    role: "CSE Dept, 3rd Year",
    itemsReturned: 9,
    karmaPoints: 560,
    badge: "Campus Guardian",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    rank: 4,
    name: "Ananya M",
    role: "AIDS Dept, 2nd Year",
    itemsReturned: 6,
    karmaPoints: 390,
    badge: "Honest Finder",
    badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  {
    rank: 5,
    name: "Praveen Kumar",
    role: "ECE Dept, 3rd Year",
    itemsReturned: 4,
    karmaPoints: 280,
    badge: "Active Helper",
    badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
];

export function KarmaLeaderboardModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <Trophy className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  Campus Karma &amp; Hall of Fame
                </h3>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  SMVEC Honor Board
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Celebrating honest students and staff who helped reunite lost belongings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Impact Counters */}
        <div className="grid grid-cols-3 border-b border-border/60 bg-muted/30 p-4 text-center">
          <div className="border-r border-border/60 px-2">
            <span className="text-xs font-semibold text-muted-foreground">Reunited Items</span>
            <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">42+</p>
            <span className="text-[10px] text-muted-foreground">Returned to owners</span>
          </div>
          <div className="border-r border-border/60 px-2">
            <span className="text-xs font-semibold text-muted-foreground">Estimated Value</span>
            <p className="mt-1 text-2xl font-black text-foreground">₹1,45,000</p>
            <span className="text-[10px] text-muted-foreground">Student assets saved</span>
          </div>
          <div className="px-2">
            <span className="text-xs font-semibold text-muted-foreground">ID Card Recovery</span>
            <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">94%</p>
            <span className="text-[10px] text-muted-foreground">Direct handover rate</span>
          </div>
        </div>

        {/* Leaderboard list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Top Good Samaritans
          </h4>

          {LEADERBOARD.map((hero) => (
            <div
              key={hero.rank}
              className="board-card flex items-center justify-between border-border/70 bg-card p-4 transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                    hero.rank === 1
                      ? "bg-amber-500 text-white shadow-sm"
                      : hero.rank === 2
                        ? "bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                        : hero.rank === 3
                          ? "bg-amber-700/80 text-white"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  #{hero.rank}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-foreground">
                      {hero.name}
                    </h5>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.2 text-[10px] font-bold ${hero.badgeColor}`}
                    >
                      <Award className="size-2.5" />
                      {hero.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{hero.role}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-black text-foreground">
                  {hero.itemsReturned} <span className="text-xs font-normal text-muted-foreground">returned</span>
                </p>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  +{hero.karmaPoints} Karma
                </span>
              </div>
            </div>
          ))}

          {/* Karma System Explainer */}
          <div className="mt-6 rounded-2xl border border-border/80 bg-muted/30 p-4">
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Sparkles className="size-3.5 text-amber-500" />
              How do you earn Campus Karma?
            </h5>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-card p-2 border border-border/60">
                <span className="font-bold text-primary">+10 pts</span>
                <p className="text-[10px] text-muted-foreground">Post a found item</p>
              </div>
              <div className="rounded-xl bg-card p-2 border border-border/60">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">+50 pts</span>
                <p className="text-[10px] text-muted-foreground">Return verified item</p>
              </div>
              <div className="rounded-xl bg-card p-2 border border-border/60">
                <span className="font-bold text-amber-600 dark:text-amber-400">Badge</span>
                <p className="text-[10px] text-muted-foreground">Reach Top 5 on board</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Thank you to every student and staff member making SMVEC a safer community!</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 font-semibold text-foreground hover:bg-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
