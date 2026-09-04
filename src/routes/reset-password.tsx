import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — SMVEC Campus Lost & Found" },
      {
        name: "description",
        content:
          "Choose a new password for your SMVEC Campus Lost & Found account after asking for a reset email.",
      },
      { property: "og:title", content: "Set a new password — SMVEC Campus Lost & Found" },
      {
        property: "og:description",
        content: "Choose a new password for your SMVEC Lost & Found account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

const fieldClass =
  "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Your password is changed. You are logged in.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not change the password. Ask for a new reset email.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-20 pt-14 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Set a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Open this page from the reset link in your email, then type your new
        password below.
      </p>

      <form onSubmit={onSubmit} className="board-card mt-8 space-y-5 p-6 sm:p-8">
        <div>
          <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-foreground">
            New password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              className={`${fieldClass} pr-12`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-pin disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <KeyRound className="size-4" aria-hidden />
          )}
          Save new password
        </button>
      </form>
    </main>
  );
}
