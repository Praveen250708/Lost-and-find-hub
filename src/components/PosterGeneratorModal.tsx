import { useEffect, useRef, useState } from "react";
import {
  Download,
  Share2,
  X,
  Sparkles,
  Check,
  Smartphone,
  Copy,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { type Item } from "@/lib/items";

interface PosterGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
}

export function PosterGeneratorModal({
  isOpen,
  onClose,
  item,
}: PosterGeneratorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<"story" | "square">("story");

  const isLost = item.type === "lost";

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions based on format
    // Story: 1080 x 1920 (9:16)
    // Square: 1080 x 1080 (1:1)
    const width = 1080;
    const height = format === "story" ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    if (isLost) {
      bgGradient.addColorStop(0, "#1c0a0c");
      bgGradient.addColorStop(0.3, "#2d0f14");
      bgGradient.addColorStop(0.7, "#140708");
      bgGradient.addColorStop(1, "#0a0404");
    } else {
      bgGradient.addColorStop(0, "#081c14");
      bgGradient.addColorStop(0.3, "#0d2b1f");
      bgGradient.addColorStop(0.7, "#061710");
      bgGradient.addColorStop(1, "#030d09");
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle background mesh/circles
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, 320, 0, Math.PI * 2);
    ctx.fillStyle = isLost ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width * 0.15, height * 0.85, 400, 0, Math.PI * 2);
    ctx.fillStyle = isLost ? "rgba(249, 115, 22, 0.06)" : "rgba(20, 184, 166, 0.06)";
    ctx.fill();

    // Outer framing border
    ctx.strokeStyle = isLost ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)";
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, width - 104, height - 104);

    let currentY = format === "story" ? 140 : 110;

    // Top College Header Badge
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    const collegePillW = 620;
    const collegePillH = 64;
    const collegePillX = (width - collegePillW) / 2;
    roundRect(ctx, collegePillX, currentY, collegePillW, collegePillH, 32);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px 'DM Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SMVEC CAMPUS LOST & FOUND PORTAL", width / 2, currentY + 41);

    currentY += format === "story" ? 140 : 100;

    // Main Alert Stamp (Red or Green)
    const alertText = isLost ? "🚨 LOST ITEM ALERT" : "✅ FOUND ITEM NOTICE";
    const badgeColor = isLost ? "#dc2626" : "#059669";
    const badgeW = 760;
    const badgeH = 100;
    const badgeX = (width - badgeW) / 2;

    ctx.fillStyle = badgeColor;
    roundRect(ctx, badgeX, currentY, badgeW, badgeH, 24);
    ctx.fill();

    // Inner glow / border on badge
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 48px 'Bricolage Grotesque', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(alertText, width / 2, currentY + 68);

    currentY += format === "story" ? 170 : 120;

    // Item Name Box
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    const cardW = width - 160;
    const cardH = format === "story" ? 540 : 380;
    const cardX = 80;

    roundRect(ctx, cardX, currentY, cardW, cardH, 36);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();

    let innerY = currentY + 70;

    // Category pill
    ctx.fillStyle = isLost ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)";
    roundRect(ctx, cardX + 50, innerY - 32, 220, 48, 16);
    ctx.fill();
    ctx.strokeStyle = isLost ? "rgba(239, 68, 68, 0.5)" : "rgba(16, 185, 129, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = isLost ? "#fca5a5" : "#6ee7b7";
    ctx.font = "bold 22px 'DM Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Category: ${item.category}`, cardX + 70, innerY);

    innerY += 70;

    // Item Name (Multiline wrapping)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px 'Bricolage Grotesque', sans-serif";
    ctx.textAlign = "left";
    const words = item.item_name.split(" ");
    let line = "";
    let linesDrawn = 0;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > cardW - 100 && n > 0) {
        ctx.fillText(line, cardX + 50, innerY);
        line = words[n] + " ";
        innerY += 66;
        linesDrawn++;
        if (linesDrawn >= 2) break;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, cardX + 50, innerY);

    innerY += 75;

    // Location & Date
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 32px 'DM Sans', sans-serif";
    ctx.fillText(`📍 Location: ${item.place}`, cardX + 50, innerY);

    innerY += 50;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "26px 'DM Sans', sans-serif";
    ctx.fillText(
      `📅 Reported on: ${item.item_date} by ${item.reporter_name}`,
      cardX + 50,
      innerY
    );

    if (item.description && format === "story") {
      innerY += 55;
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "italic 24px 'DM Sans', sans-serif";
      const descSnippet =
        item.description.length > 80
          ? item.description.slice(0, 80) + "…"
          : item.description;
      ctx.fillText(`"${descSnippet}"`, cardX + 50, innerY);
    }

    currentY += cardH + (format === "story" ? 80 : 50);

    // Safe Exchange Instructions Box
    ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
    const guideH = format === "story" ? 220 : 160;
    roundRect(ctx, 80, currentY, width - 160, guideH, 28);
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 28px 'DM Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("🛡️ CAMPUS VERIFICATION & RECOVERY RULES", 120, currentY + 55);

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "22px 'DM Sans', sans-serif";
    ctx.fillText(
      "1. Verify ownership (roll number, screen unlock, unique markings).",
      120,
      currentY + 105
    );
    if (format === "story") {
      ctx.fillText(
        "2. Safely exchange at Main Gate 1 Security or Central Canteen.",
        120,
        currentY + 150
      );
      ctx.fillText(
        "3. Mark 'Reunited' on the SMVEC portal once returned.",
        120,
        currentY + 195
      );
    }

    currentY += guideH + (format === "story" ? 100 : 40);

    // Call to Action / Footer Link
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    const footH = format === "story" ? 140 : 100;
    roundRect(ctx, 80, currentY, width - 160, footH, 24);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px 'Bricolage Grotesque', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "Check or Claim on SMVEC Lost & Found Portal",
      width / 2,
      currentY + (format === "story" ? 60 : 45)
    );

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "22px 'DM Sans', sans-serif";
    ctx.fillText(
      "Sri Manakula Vinayagar Engineering College · Madagadipet",
      width / 2,
      currentY + (format === "story" ? 105 : 80)
    );
  }, [isOpen, item, format, isLost]);

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      const cleanName = item.item_name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 30);
      a.download = `smvec-${item.type}-${cleanName}-${format}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Poster downloaded! Ready to post on WhatsApp or Instagram.");
    } catch {
      toast.error("Could not download graphic.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (navigator.share && canvas.toBlob) {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File(
          [blob],
          `smvec-${item.type}-${item.item_name}.png`,
          { type: "image/png" }
        );
        try {
          await navigator.share({
            title: `[SMVEC Lost & Found] ${item.item_name}`,
            text: `🚨 ${item.type.toUpperCase()}: ${item.item_name} at ${item.place}. Please contact if found or if this is yours!`,
            files: [file],
          });
          toast.success("Shared successfully!");
        } catch {
          // Fallback to text copy
          copyShareText();
        }
      });
    } else {
      copyShareText();
    }
  };

  const copyShareText = () => {
    const text = `[SMVEC CAMPUS LOST & FOUND]\n🚨 ${item.type.toUpperCase()}: ${item.item_name}\n📍 Location: ${item.place}\n📅 Date: ${item.item_date}\n👤 Reported by: ${item.reporter_name}\n\nCheck or report on the SMVEC Campus Hub: http://localhost:8080/`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Notice text copied to clipboard! Paste on your WhatsApp groups.");
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Smartphone className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                WhatsApp Status &amp; Story Notice Generator
              </h3>
              <p className="text-xs text-muted-foreground">
                Create a high-resolution college graphic card to share with classmates.
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

        {/* Format Selector */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-6 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Graphic layout:</span>
            <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
              <button
                type="button"
                onClick={() => setFormat("story")}
                className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                  format === "story"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                9:16 WhatsApp / IG Story
              </button>
              <button
                type="button"
                onClick={() => setFormat("square")}
                className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                  format === "square"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                1:1 WhatsApp Group Card
              </button>
            </div>
          </div>

          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            1080p Ultra HD Canvas
          </span>
        </div>

        {/* Live Canvas Preview */}
        <div className="flex flex-1 items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="max-h-[50vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
            <canvas
              ref={canvasRef}
              className="h-auto max-h-[50vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-6 py-4">
          <button
            type="button"
            onClick={copyShareText}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4 text-muted-foreground" />}
            {copied ? "Copied Text!" : "Copy Broadcast Text"}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-sm transition-all hover:bg-muted"
            >
              <Share2 className="size-4" />
              Share
            </button>

            <button
              type="button"
              disabled={downloading}
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="size-4" />
              Download Image (PNG)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
