import { useMemo, useState } from "react";
import {
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  MessageCircle,
  Tag,
  MapPin,
  Calendar,
} from "lucide-react";
import { type Item } from "@/lib/items";

interface SmartMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  initialSelectedItem?: Item | null;
}

interface MatchPair {
  lostItem: Item;
  foundItem: Item;
  score: number;
  matchingTokens: string[];
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "in", "at", "with", "near", "floor", "smvec",
  "college", "block", "dept", "room", "section", "for", "item", "lost",
  "found", "please", "help", "color", "new", "old", "my"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function calculateSimilarity(itemA: Item, itemB: Item): { score: number; tokens: string[] } {
  let score = 0;
  const commonTokens: string[] = [];

  // Category match
  if (itemA.category === itemB.category) {
    score += 30;
  }

  // Name token overlap
  const tokensA = tokenize(itemA.item_name);
  const tokensB = tokenize(itemB.item_name);
  const matchedNameTokens = tokensA.filter((t) => tokensB.includes(t));
  if (matchedNameTokens.length > 0) {
    score += Math.min(matchedNameTokens.length * 20, 45);
    commonTokens.push(...matchedNameTokens);
  }

  // Place token overlap
  const placeTokensA = tokenize(itemA.place);
  const placeTokensB = tokenize(itemB.place);
  const matchedPlaceTokens = placeTokensA.filter((t) => placeTokensB.includes(t));
  if (matchedPlaceTokens.length > 0) {
    score += Math.min(matchedPlaceTokens.length * 15, 25);
    commonTokens.push(...matchedPlaceTokens.map((t) => `📍 ${t}`));
  }

  // Date proximity (within 3 days)
  try {
    const dateA = new Date(itemA.item_date).getTime();
    const dateB = new Date(itemB.item_date).getTime();
    const diffDays = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);
    if (diffDays <= 3) {
      score += 10;
    }
  } catch {
    // Ignore date parse issues
  }

  return {
    score: Math.min(score, 98), // max 98%
    tokens: Array.from(new Set(commonTokens)),
  };
}

export function SmartMatcherModal({
  isOpen,
  onClose,
  items,
  initialSelectedItem,
}: SmartMatcherModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    initialSelectedItem?.id ?? "all"
  );

  const lostItems = useMemo(
    () => items.filter((i) => i.type === "lost" && !i.is_resolved),
    [items]
  );
  const foundItems = useMemo(
    () => items.filter((i) => i.type === "found" && !i.is_resolved),
    [items]
  );

  const matches: MatchPair[] = useMemo(() => {
    const pairs: MatchPair[] = [];

    const targetLost =
      selectedItemId !== "all"
        ? lostItems.filter((l) => l.id === selectedItemId)
        : lostItems;

    const targetFound =
      selectedItemId !== "all"
        ? foundItems.filter((f) => f.id === selectedItemId)
        : foundItems;

    if (selectedItemId !== "all") {
      const selected = items.find((i) => i.id === selectedItemId);
      if (selected?.type === "lost") {
        for (const found of foundItems) {
          const { score, tokens } = calculateSimilarity(selected, found);
          if (score >= 35) {
            pairs.push({
              lostItem: selected,
              foundItem: found,
              score,
              matchingTokens: tokens,
            });
          }
        }
      } else if (selected?.type === "found") {
        for (const lost of lostItems) {
          const { score, tokens } = calculateSimilarity(lost, selected);
          if (score >= 35) {
            pairs.push({
              lostItem: lost,
              foundItem: selected,
              score,
              matchingTokens: tokens,
            });
          }
        }
      }
    } else {
      for (const lost of lostItems) {
        for (const found of foundItems) {
          const { score, tokens } = calculateSimilarity(lost, found);
          if (score >= 40) {
            pairs.push({
              lostItem: lost,
              foundItem: found,
              score,
              matchingTokens: tokens,
            });
          }
        }
      }
    }

    return pairs.sort((a, b) => b.score - a.score);
  }, [items, lostItems, foundItems, selectedItemId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20">
              <Sparkles className="size-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  AI Smart Match Engine
                </h3>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent-foreground border border-accent/40">
                  Campus Real-Time
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically scans and correlates reported Lost and Found items by keywords, category &amp; location.
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

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-card px-6 py-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Filter by item:</span>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="rounded-xl border border-input bg-muted/40 px-3 py-1.5 font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">⚡ All active campus matches ({matches.length})</option>
              {items
                .filter((i) => !i.is_resolved)
                .map((it) => (
                  <option key={it.id} value={it.id}>
                    [{it.type.toUpperCase()}] {it.item_name} ({it.place})
                  </option>
                ))}
            </select>
          </div>

          <span className="text-xs text-muted-foreground">
            Found <strong className="text-foreground">{matches.length}</strong> strong match candidates
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
                <HelpCircle className="size-8" />
              </div>
              <h4 className="mt-4 text-base font-bold text-foreground">
                No automatic matches detected yet
              </h4>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                Our algorithm looks for similarities in item names, categories, and locations. As more items get reported today, candidates will show up here immediately.
              </p>
            </div>
          ) : (
            matches.map(({ lostItem, foundItem, score, matchingTokens }, index) => {
              const scoreColor =
                score >= 75
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : score >= 50
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";

              return (
                <div
                  key={`${lostItem.id}-${foundItem.id}-${index}`}
                  className="board-card overflow-hidden border-border/80 bg-card transition-all hover:border-accent/40"
                >
                  <div className="flex items-center justify-between border-b border-border/60 bg-muted/25 px-5 py-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-bold ${scoreColor}`}
                      >
                        <Sparkles className="size-3" />
                        {score}% Confidence Match
                      </span>
                      {matchingTokens.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
                          <span>Matched:</span>
                          {matchingTokens.slice(0, 3).map((t, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-muted px-1.5 py-0.2 font-medium text-foreground"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] font-medium text-muted-foreground">
                      Candidate #{index + 1}
                    </span>
                  </div>

                  <div className="grid gap-4 p-5 md:grid-cols-2">
                    {/* Lost Item Side */}
                    <div className="rounded-2xl border border-lost/20 bg-lost/5 p-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-lost px-2.5 py-0.5 text-[10px] font-bold text-lost-foreground">
                          LOST ITEM
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {lostItem.item_date}
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-foreground">
                        {lostItem.item_name}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {lostItem.description || "No description provided."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3 text-lost" /> {lostItem.place}
                        </span>
                        <span>·</span>
                        <span>By {lostItem.reporter_name}</span>
                      </div>
                    </div>

                    {/* Found Item Side */}
                    <div className="rounded-2xl border border-found/20 bg-found/5 p-4">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-found px-2.5 py-0.5 text-[10px] font-bold text-found-foreground">
                          FOUND ITEM
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {foundItem.item_date}
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-foreground">
                        {foundItem.item_name}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {foundItem.description || "No description provided."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3 text-found" /> {foundItem.place}
                        </span>
                        <span>·</span>
                        <span>Reported by {foundItem.reporter_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/15 px-5 py-3 text-xs">
                    <p className="text-muted-foreground">
                      Could these be the same item? Contact the finder to verify details.
                    </p>
                    <a
                      href={`https://wa.me/919442158900?text=${encodeURIComponent(
                        `Hi, SMVEC AI Matcher flagged a possible match between Lost: "${lostItem.item_name}" and Found: "${foundItem.item_name}". Can we verify?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                    >
                      <MessageCircle className="size-3.5" />
                      Verify This Match
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            💡 <strong>Pro-tip:</strong> Always confirm unique identifiers (serial number, bill, or markings) before meeting.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 font-semibold text-foreground hover:bg-muted"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
