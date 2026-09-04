import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  COLLEGE_NAME,
  DEPARTMENTS,
  SECTIONS,
  YEARS,
  fetchMyProfile,
  saveMyProfile,
  syncProfileFromMetadata,
} from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My profile — SMVEC Campus Lost & Found" },
      {
        name: "description",
        content:
          "Update your name, department, year, section and WhatsApp number on the SMVEC Campus Lost & Found board.",
      },
      { property: "og:title", content: "My profile — SMVEC Campus Lost & Found" },
      {
        property: "og:description",
        content: "Keep your campus details up to date when you move to the next year.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent";

function ProfilePage() {
  const { userId, email, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (user) await syncProfileFromMetadata(user.id, user.user_metadata ?? {});
      return fetchMyProfile(userId!);
    },
  });

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setDepartment(profile.department ?? "");
    setYear(profile.year ?? "");
    setSection(profile.section ?? "");
    setWhatsapp(profile.whatsapp ?? "");
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      saveMyProfile(userId!, {
        name: name.trim(),
        department,
        year,
        section,
        whatsapp: whatsapp.trim(),
      }),
    onSuccess: async () => {
      toast.success("Profile saved.");
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: () => toast.error("Could not save your profile. Please try again."),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Please enter your name.");
      return;
    }
    if (whatsapp.replace(/\D/g, "").length < 8) {
      toast.error("Please enter a valid WhatsApp number with country code.");
      return;
    }
    save.mutate();
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-20 pt-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">My profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Keep your details correct. When you move from 1st year to 2nd year, just
        change the year here and save.
      </p>

      <form onSubmit={onSubmit} className="board-card mt-6 space-y-4 p-5">
        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="p-name">
            Name
          </label>
          <input
            id="p-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="p-dept">
            Department
          </label>
          <select
            id="p-dept"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={inputClass}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="p-year">
              Year
            </label>
            <select
              id="p-year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={inputClass}
            >
              <option value="">Select year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="p-sec">
              Section
            </label>
            <select
              id="p-sec"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className={inputClass}
            >
              <option value="">Select section</option>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="p-wa">
            WhatsApp number (with country code)
          </label>
          <input
            id="p-wa"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className={inputClass}
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <p>College: {COLLEGE_NAME}</p>
          <p>Email: {email}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={save.isPending || isLoading}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {save.isPending ? "Saving..." : "Save changes"}
          </button>
          <Link
            to="/my-reports"
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground"
          >
            Back to my dashboard
          </Link>
        </div>
      </form>
    </main>
  );
}
