import { useState } from "react";
import {
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Building,
  BookOpen,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface DropZone {
  id: string;
  name: string;
  landmark: string;
  operatingHours: string;
  phone: string;
  officer: string;
  acceptedCategories: string[];
  is24x7?: boolean;
  notes: string;
  icon: typeof MapPin;
}

const DROP_ZONES: DropZone[] = [
  {
    id: "gate-1",
    name: "Main Security Control Desk (Gate 1)",
    landmark: "Main Campus Entrance, Opposite Bus Bay",
    operatingHours: "Open 24 Hours / 7 Days",
    phone: "0413-2643000 (Ext: 101)",
    officer: "Chief Security Officer / Head Guard",
    acceptedCategories: ["All Categories", "High-Value Items", "Electronics", "Wallets & Cash"],
    is24x7: true,
    notes: "Official campus 24/7 repository. Recommended for laptops, phones, gold, wallets, and government IDs. Issue physical receipt on submission.",
    icon: ShieldCheck,
  },
  {
    id: "library",
    name: "Central Library Circulation Counter",
    landmark: "Central Library, Ground Floor Entry",
    operatingHours: "8:30 AM – 6:00 PM (Working Days)",
    phone: "Ext: 204",
    officer: "Assistant Librarian On Duty",
    acceptedCategories: ["Books", "Notebooks", "Calculators", "Stationery", "ID Cards"],
    notes: "Ideal for items left in study halls, digital reference zones, and reading rooms.",
    icon: BookOpen,
  },
  {
    id: "admin",
    name: "Student Affairs & Admin Office",
    landmark: "Administrative Block, 1st Floor Room 104",
    operatingHours: "9:00 AM – 5:00 PM",
    phone: "Ext: 105",
    officer: "Dean of Student Affairs Office",
    acceptedCategories: ["Official Documents", "Hall Tickets", "Certificates", "Keys"],
    notes: "Directly contacts students via college registry database and official SMS/Email.",
    icon: Building,
  },
  {
    id: "canteen",
    name: "Central Canteen Help Counter",
    landmark: "Near Central Token Desk & Dining Hall",
    operatingHours: "8:00 AM – 7:30 PM",
    phone: "Ext: 310",
    officer: "Canteen Supervisor Desk",
    acceptedCategories: ["Water Bottles", "Lunch Boxes", "Keys", "Jackets & Lab Coats"],
    notes: "Common recovery point for items left during morning breakfast and lunch rush hours.",
    icon: Coffee,
  },
];

export function CampusDropZonesModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const copyInfo = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label}: ${text}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <MapPin className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Official Campus Drop-off &amp; Collection Desks
              </h3>
              <p className="text-xs text-muted-foreground">
                Found an item and don't want to hold it? Hand it over to any authorized campus desk.
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

        {/* Protocol Alert Banner */}
        <div className="border-b border-border/60 bg-amber-500/10 px-6 py-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">Campus Security Rule for High-Value Items:</p>
              <p className="mt-0.5 text-[11px] opacity-90">
                Found phones, wallets with cash, laptops, or gold items must be handed directly to <strong>Main Gate 1 Security Desk</strong> within 2 hours of finding to avoid campus misconduct inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {DROP_ZONES.map((zone) => {
              const Icon = zone.icon;
              return (
                <div
                  key={zone.id}
                  className="board-card flex flex-col justify-between border-border/80 bg-card p-5 transition-all hover:border-accent/50"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                        <Icon className="size-5 text-primary" />
                      </div>
                      {zone.is24x7 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          24/7 OPEN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          <Clock className="size-3" />
                          Day Shift
                        </span>
                      )}
                    </div>

                    <h4 className="mt-3 text-sm font-bold text-foreground">
                      {zone.name}
                    </h4>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0 text-amber-500" />
                      {zone.landmark}
                    </p>

                    <div className="mt-3 space-y-1.5 rounded-xl bg-muted/40 p-3 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Operating Hours:</span>
                        <span className="font-semibold text-foreground">{zone.operatingHours}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Contact Officer:</span>
                        <span className="font-medium text-foreground">{zone.officer}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Phone / Intercom:</span>
                        <button
                          type="button"
                          onClick={() => copyInfo(zone.phone, "Intercom")}
                          className="inline-flex items-center gap-1 font-mono font-bold text-primary hover:underline"
                        >
                          {zone.phone} <Copy className="size-2.5" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {zone.notes}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-1.5">
                    {zone.acceptedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Sri Manakula Vinayagar Engineering College · Campus Security Wing
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 font-semibold text-foreground hover:bg-muted"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
}
