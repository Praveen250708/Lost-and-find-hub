import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Flag,
  HelpCircle,
  Laptop,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteItem,
  fetchItemContact,
  getItemImageUrl,
  mailLink,
  reportItemUser,
  REPORT_REASONS,
  whatsappLink,
  type Item,
  type ItemContact,
} from "@/lib/items";
import { PosterGeneratorModal } from "./PosterGeneratorModal";

const categoryGradients: Record<string, string> = {
  Electronics: "from-blue-600/15 via-indigo-600/10 to-transparent",
  Documents: "from-amber-600/15 via-orange-600/10 to-transparent",
  Keys: "from-emerald-600/15 via-teal-600/10 to-transparent",
  Clothing: "from-purple-600/15 via-pink-600/10 to-transparent",
  Other: "from-slate-600/15 via-gray-600/10 to-transparent",
};

export function ItemCard({
  item,
  onMatchClick,
}: {
  item: Item;
  onMatchClick?: (item: Item) => void;
}) {
  const isLost = item.type === "lost";
  const [contact, setContact] = useState<ItemContact | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);

  useEffect(() => {
    let active = true;
    if (!item.image_url) {
      setImageUrl(null);
      return;
    }
    getItemImageUrl(item.image_url).then((url) => {
      if (active) setImageUrl(url);
    });
    return () => {
      active = false;
    };
  }, [item.image_url]);

  const { userId } = useAuth();
  const isOwner = Boolean(userId && item.user_id === userId);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(item.id),
    onSuccess: async () => {
      toast.success("Report deleted from board.");
      await queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: () => toast.error("Could not delete this report."),
  });

  const reportMutation = useMutation({
    mutationFn: () =>
      reportItemUser(item.id, item.user_id!, userId!, reason),
    onSuccess: () => {
      setReportOpen(false);
      toast.success("Thanks. This report has been flagged for campus moderation.");
    },
    onError: (e: unknown) => {
      const msg =
        (e as { code?: string })?.code === "23505"
          ? "You already reported this post."
          : "Could not send the report.";
      toast.error(msg);
    },
  });

  const canReport = Boolean(userId && item.user_id && item.user_id !== userId);

  const loadContactInfo = async () => {
    if (contact) return;
    setLoadingContact(true);
    try {
      const data = await fetchItemContact(item.id);
      setContact(data);
    } catch {
      setContact({
        contact_email: "lostfound@smvec.ac.in",
        contact_whatsapp: "919442158900",
      });
    } finally {
      setLoadingContact(false);
    }
  };

  const handleOpenClaimModal = () => {
    loadContactInfo();
    setModalOpen(true);
  };

  const wa = contact ? whatsappLink(item, contact) : null;
  const mail = contact ? mailLink(item, contact) : null;

  const handleShare = () => {
    const url = window.location.href;
    const shareText = `[SMVEC Lost & Found] ${item.type.toUpperCase()}: ${item.item_name} at ${item.place}. Check it out on the campus board: ${url}`;
    if (navigator.share) {
      navigator.share({ title: item.item_name, text: shareText, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Item details copied to clipboard! Share on WhatsApp groups.");
    }
  };

  const copyContact = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`Copied: ${val}`);
  };

  return (
    <>
      <article className="board-card board-card-hover group flex flex-col overflow-hidden border-border/80 bg-card">
        {/* Card Header & Visual Media */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Photo of ${item.item_name}`}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className={`flex size-full flex-col items-center justify-center bg-gradient-to-b ${categoryGradients[item.category] ?? "from-muted/40 to-muted"} p-4 text-center`}
            >
              <div className="rounded-2xl border border-border/60 bg-background/70 p-3 shadow-sm backdrop-blur-sm">
                <Tag className="size-6 text-foreground/70" />
              </div>
              <span className="mt-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {item.category}
              </span>
              <span className="text-[10px] text-muted-foreground/60">SMVEC Notice</span>
            </div>
          )}

          {/* Type Badge (Lost vs Found) */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-md",
                item.is_resolved
                  ? "bg-emerald-600 text-white"
                  : isLost
                    ? "bg-lost/90 text-lost-foreground ring-1 ring-white/20"
                    : "bg-found/90 text-found-foreground ring-1 ring-white/20",
              ].join(" ")}
            >
              <span
                className={[
                  "size-1.5 rounded-full",
                  item.is_resolved
                    ? "bg-white"
                    : isLost
                      ? "bg-white animate-pulse"
                      : "bg-white animate-pulse",
                ].join(" ")}
              />
              {item.is_resolved ? "Reunited" : isLost ? "Lost" : "Found"}
            </span>

            <span className="rounded-full bg-background/85 px-2.5 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur-md border border-border/60">
              {item.category}
            </span>
          </div>

          {/* Quick Action Share & Story Generator */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPosterOpen(true)}
              title="Create WhatsApp Status Poster"
              className="rounded-full bg-background/85 p-1.5 text-foreground backdrop-blur-md border border-border/60 shadow-sm transition-transform hover:scale-110"
            >
              <Smartphone className="size-3.5 text-primary" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              title="Share item"
              className="rounded-full bg-background/85 p-1.5 text-foreground backdrop-blur-md border border-border/60 shadow-sm transition-transform hover:scale-110"
            >
              <Share2 className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary line-clamp-1">
            {item.item_name}
          </h3>

          {item.description ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          ) : (
            <p className="mt-2 text-xs italic text-muted-foreground/70">
              No additional notes provided.
            </p>
          )}

          <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0 text-amber-500" />
              <span className="truncate font-medium text-foreground">{item.place}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-3.5 shrink-0 text-amber-500" />
              <span>
                {new Date(item.item_date).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="text-muted-foreground/60">·</span>
              <span className="truncate text-muted-foreground/80">
                By {item.reporter_name}
              </span>
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="mt-5 flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleOpenClaimModal}
              className={[
                "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm",
                isLost
                  ? "bg-lost text-lost-foreground hover:bg-lost/90"
                  : "bg-found text-found-foreground hover:bg-found/90",
              ].join(" ")}
            >
              <MessageCircle className="size-3.5" />
              {isLost ? "I Found This" : "Claim This Item"}
            </button>

            {onMatchClick && !item.is_resolved && (
              <button
                type="button"
                onClick={() => onMatchClick(item)}
                className="inline-flex size-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-all hover:bg-amber-500 hover:text-white"
                title="Search AI matches for this item"
              >
                <Sparkles className="size-4" />
              </button>
            )}

            {isOwner ? (
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (confirm("Delete this report from the SMVEC board?")) {
                    deleteMutation.mutate();
                  }
                }}
                className="inline-flex size-9 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-white"
                title="Delete your report"
              >
                <Trash2 className="size-4" />
              </button>
            ) : null}

            {canReport ? (
              <button
                type="button"
                onClick={() => setReportOpen((v) => !v)}
                className="inline-flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-destructive hover:border-destructive/40"
                title="Report misuse"
              >
                <Flag className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Report Misuse Drawer */}
        {canReport && reportOpen ? (
          <div className="border-t border-border bg-muted/40 p-4">
            <p className="text-xs font-medium text-foreground">
              Report this post for college administration review:
            </p>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                disabled={reportMutation.isPending}
                onClick={() => reportMutation.mutate()}
                className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground disabled:opacity-50"
              >
                Submit Report
              </button>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </article>

      {/* Claim / Contact Dialog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl transition-all">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={[
                  "flex size-11 items-center justify-center rounded-2xl",
                  isLost ? "bg-lost/15 text-lost" : "bg-found/15 text-found",
                ].join(" ")}
              >
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">
                  {isLost ? "Contact Owner" : "Claim Item"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Direct connection for {item.item_name}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">{item.item_name}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  <strong>Location:</strong> {item.place}
                </span>
                <span>
                  <strong>Reported By:</strong> {item.reporter_name}
                </span>
              </div>
              {item.description ? (
                <p className="mt-2 text-xs text-muted-foreground italic border-t border-border/40 pt-2">
                  "{item.description}"
                </p>
              ) : null}
            </div>

            {/* Verification Notice & Ownership Checklist */}
            <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex gap-2">
                <HelpCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="font-bold">Ownership Proof Verification Checklist:</p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    To protect items from wrongful claims, verify before handing over:
                  </p>
                  <ul className="list-disc pl-4 text-[11px] space-y-0.5 opacity-90">
                    <li>College ID card / Roll number matches records</li>
                    <li>Device unlocks via passcode or lockscreen wallpaper matches</li>
                    <li>Unique scratches, sticker initials, or bill proof shown</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="mt-6 space-y-2.5">
              {loadingContact ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  Connecting to reporter details…
                </div>
              ) : (
                <>
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <MessageCircle className="size-4" />
                      Chat on WhatsApp Directly
                    </a>
                  ) : null}

                  {mail ? (
                    <a
                      href={mail}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <Mail className="size-4 text-muted-foreground" />
                      Send College Email
                    </a>
                  ) : null}

                  {contact?.contact_whatsapp ? (
                    <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card px-3.5 py-2.5 text-xs">
                      <span className="text-muted-foreground">
                        WhatsApp / Phone:{" "}
                        <strong className="text-foreground">
                          {contact.contact_whatsapp}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyContact(contact.contact_whatsapp!)}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        <Copy className="size-3" /> Copy
                      </button>
                    </div>
                  ) : null}

                  {contact?.contact_email ? (
                    <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card px-3.5 py-2.5 text-xs">
                      <span className="text-muted-foreground">
                        Email:{" "}
                        <strong className="text-foreground">
                          {contact.contact_email}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyContact(contact.contact_email!)}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        <Copy className="size-3" /> Copy
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      <PosterGeneratorModal
        isOpen={posterOpen}
        onClose={() => setPosterOpen(false)}
        item={item}
      />
    </>
  );
}
