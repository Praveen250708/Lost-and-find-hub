import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES, itemSchema, uploadItemImage, itemsQuery, type ItemForm } from "@/lib/items";
import { myProfileQuery } from "@/lib/profile";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a Lost or Found Item — SMVEC Campus Lost & Found" },
      {
        name: "description",
        content:
          "Post an item you lost or found at SMVEC. Add the place, date and how people can reach you.",
      },
      { property: "og:title", content: "Report a Lost or Found Item — SMVEC" },
      {
        property: "og:description",
        content: "Add your lost or found item to the SMVEC board in a minute.",
      },
    ],
  }),
  component: ReportPage,
});

const emptyForm: ItemForm = {
  type: "lost",
  item_name: "",
  category: "Electronics",
  description: "",
  place: "",
  item_date: new Date().toISOString().slice(0, 10),
  reporter_name: "",
  contact_email: "",
  contact_whatsapp: "",
};

const fieldClass =
  "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

function ReportPage() {
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId, email, user, loading: authLoading } = useAuth();

  const { data: profile } = useQuery({
    ...myProfileQuery(userId ?? ""),
    enabled: Boolean(userId),
  });

  const { data: allItems } = useQuery(itemsQuery);
  const potentialMatches = useMemo(() => {
    const term = form.item_name.trim().toLowerCase();
    if (term.length < 3 || !allItems) return [];
    const targetType = form.type === "lost" ? "found" : "lost";
    const words = term.split(/\s+/).filter((w) => w.length > 2);
    return allItems
      .filter((it) => it.type === targetType && !it.is_resolved)
      .filter((it) => {
        const itemText = `${it.item_name} ${it.place} ${it.category}`.toLowerCase();
        return words.some((w) => itemText.includes(w));
      })
      .slice(0, 3);
  }, [form.item_name, form.type, allItems]);

  const metaName =
    typeof user?.user_metadata?.["name"] === "string"
      ? (user.user_metadata["name"] as string)
      : "";
  const accountName =
    profile?.name?.trim() || metaName.trim() || (email ? email.split("@")[0]! : "");

  useEffect(() => {
    if (!email) return;
    setForm((f) => (f.contact_email ? f : { ...f, contact_email: email }));
  }, [email]);

  useEffect(() => {
    if (!accountName) return;
    setForm((f) => ({ ...f, reporter_name: accountName }));
  }, [accountName]);



  const set = <K extends keyof ItemForm>(key: K, value: ItemForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const mutation = useMutation({
    mutationFn: async (values: ItemForm) => {
      let imagePath: string | null = null;
      if (imageFile && userId) {
        imagePath = await uploadItemImage(userId, imageFile);
      }
      const { error } = await supabase.from("items").insert({
        user_id: userId,
        type: values.type,
        item_name: values.item_name,
        category: values.category,
        description: values.description || null,
        place: values.place,
        item_date: values.item_date,
        reporter_name: values.reporter_name,
        contact_email: values.contact_email || null,
        contact_whatsapp: values.contact_whatsapp || null,
        image_url: imagePath,
      });
      if (error) throw error;
    },

    onSuccess: async () => {
      toast.success("Posted! Your item is on the board.");
      await queryClient.invalidateQueries({ queryKey: ["items"] });
      navigate({ to: "/" });
    },
    onError: (e: unknown) =>
      toast.error(
        (e as { code?: string })?.code === "42501"
          ? "Your account is blocked from posting because of misuse reports."
          : "Could not post the item. Please try again.",
      ),

  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = itemSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  }

  if (!authLoading && !userId) {
    return (
      <main className="mx-auto w-full max-w-md px-4 pb-20 pt-14 sm:px-6">
        <div className="board-card p-8 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            Log in to post an item
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We ask you to log in so only you can edit or delete your own reports
            later.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-pin"
          >
            Log in with email
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-20 pt-10 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to board
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl">
        Report an item
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fill this short form. Everyone on campus will see it right away.
      </p>

      <form onSubmit={onSubmit} className="board-card mt-8 space-y-6 p-6 sm:p-8">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-foreground">
            What happened?
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(["lost", "found"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("type", t)}
                aria-pressed={form.type === t}
                className={[
                  "rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition-colors",
                  form.type === t
                    ? t === "lost"
                      ? "border-lost bg-lost text-lost-foreground"
                      : "border-found bg-found text-found-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                I {t} something
              </button>
            ))}
          </div>
        </fieldset>

        <Field label="Item name" error={errors["item_name"]}>
          <input
            className={fieldClass}
            value={form.item_name}
            maxLength={80}
            onChange={(e) => set("item_name", e.target.value)}
            placeholder="Blue student ID card"
          />
        </Field>

        {potentialMatches.length > 0 && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Sparkles className="size-4 text-amber-500 animate-pulse" />
              Wait! We found existing {form.type === "lost" ? "Found" : "Lost"} items matching "{form.item_name}":
            </div>
            <div className="mt-2.5 space-y-2">
              {potentialMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between rounded-xl bg-card/90 p-2.5 border border-border text-xs shadow-xs"
                >
                  <div>
                    <p className="font-bold text-foreground">{match.item_name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      📍 {match.place} · {match.item_date} by {match.reporter_name}
                    </p>
                  </div>
                  <Link
                    to="/"
                    className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    Check on Board
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {form.type === "found" && (
          <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" /> Physical Drop-off Option:
            </p>
            <p className="mt-1 text-[11px] leading-relaxed">
              If you prefer not to keep this item with you, you can hand it over directly to the <strong>Main Gate 1 Security Control Desk (24/7)</strong> or the <strong>Central Library Help Counter</strong>.
            </p>
          </div>
        )}

        <Field label="Category" error={errors["category"]}>
          <select
            className={fieldClass}
            value={form.category}
            onChange={(e) =>
              set("category", e.target.value as ItemForm["category"])
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label={form.type === "lost" ? "Where did you lose it?" : "Where did you find it?"}
            error={errors["place"]}
          >
            <input
              className={fieldClass}
              value={form.place}
              maxLength={120}
              onChange={(e) => set("place", e.target.value)}
              placeholder="e.g. Central Library, 2nd floor"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "Central Library",
                "Canteen",
                "CSE Lab 3",
                "Audi Steps",
                "Mech Workshop",
                "Parking Bay B",
                "Sports Ground",
              ].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => set("place", loc)}
                  className="rounded-lg border border-border/80 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground hover:bg-card"
                >
                  + {loc}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Date" error={errors["item_date"]}>
            <input
              type="date"
              className={fieldClass}
              value={form.item_date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set("item_date", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Details (optional)" error={errors["description"]}>
          <textarea
            className={`${fieldClass} min-h-24 resize-y`}
            value={form.description}
            maxLength={500}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Colour, marks, what was inside…"
          />
        </Field>

        <Field
          label="Photo of the item (optional)"
          error={errors["image"]}
          hint="A clear picture helps people recognise the item. Max 5 MB."
        >
          <input
            type="file"
            accept="image/*"
            className={`${fieldClass} file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-foreground`}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file && file.size > 5 * 1024 * 1024) {
                setErrors((p) => ({ ...p, image: "Please pick an image under 5 MB" }));
                return;
              }
              setErrors((p) => {
                const { image: _drop, ...rest } = p;
                return rest;
              });
              setImageFile(file);
              setImagePreview(file ? URL.createObjectURL(file) : null);
            }}
          />
        </Field>
        {imagePreview ? (
          <div className="flex items-center gap-3">
            <img
              src={imagePreview}
              alt="Selected item preview"
              className="size-20 rounded-xl border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="text-xs font-semibold text-destructive"
            >
              Remove photo
            </button>
          </div>
        ) : null}


        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          Posting as <span className="font-semibold text-foreground">{accountName || "your account"}</span>
          {errors["reporter_name"] ? (
            <span className="mt-1 block text-xs font-medium text-destructive">
              Add your name in your account first.
            </span>
          ) : null}
        </p>


        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Email (optional)" error={errors["contact_email"]}>
            <input
              type="email"
              className={fieldClass}
              value={form.contact_email}
              maxLength={255}
              onChange={(e) => set("contact_email", e.target.value)}
              placeholder="you@campus.edu"
            />
          </Field>

          <Field
            label="WhatsApp number"
            error={errors["contact_whatsapp"]}
            hint="Required — with country code, numbers only. Example: 919876543210"
          >
            <input
              inputMode="numeric"
              className={fieldClass}
              value={form.contact_whatsapp}
              maxLength={15}
              onChange={(e) =>
                set("contact_whatsapp", e.target.value.replace(/\D/g, ""))
              }
              placeholder="919876543210"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-pin transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          Post to the board
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-foreground">
        {label}
      </span>
      {children}
      {hint && !error ? (
        <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}
