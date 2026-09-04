import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { loginAsDemoUser } from "@/hooks/useAuth";
import {
  COLLEGE_NAME,
  DEPARTMENTS,
  SECTIONS,
  YEARS,
  saveMyProfile,
} from "@/lib/profile";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in with email — SMVEC Campus Lost & Found" },
      {
        name: "description",
        content:
          "Log in with your @smvec.ac.in email and password to post lost or found items and manage your own reports at SMVEC.",
      },
      { property: "og:title", content: "Log in — SMVEC Campus Lost & Found" },
      {
        property: "og:description",
        content: "Use your college email and password to post and manage lost or found items at SMVEC.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const fieldClass =
  "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

const EMAIL_DOMAIN = "@smvec.ac.in";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [year, setYear] = useState<string>(YEARS[0]);
  const [section, setSection] = useState<string>(SECTIONS[0]);
  const [whatsapp, setWhatsapp] = useState("");

  async function onForgotPassword() {
    const target = email.trim().toLowerCase();
    if (!target.endsWith(EMAIL_DOMAIN)) {
      toast.error(`Please type your college email ending with ${EMAIL_DOMAIN} first.`);
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(target, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("We sent a password reset link to your email.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not send the reset email.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith(EMAIL_DOMAIN) && !cleanEmail.includes("@")) {
      toast.error(`Please enter a valid email address.`);
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup") {
      if (name.trim().length < 2) {
        toast.error("Please enter your name.");
        return;
      }
      if (!/^[0-9]{8,15}$/.test(whatsapp.trim())) {
        toast.error("Please enter your WhatsApp number with country code, numbers only.");
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const details = {
          name: name.trim(),
          department,
          year,
          section,
          whatsapp: whatsapp.trim(),
        };
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: details,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setShowVerifyPopup(true);
          return;
        }
        await saveMyProfile(data.session.user.id, details);
        toast.success("Welcome! Your account is ready.");
        navigate({ to: "/my-reports" });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) throw error;
      toast.success("You are logged in.");
      navigate({ to: "/" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-20 pt-14 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">
        {mode === "login" ? "Log in" : "Create an account"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use your college email ({EMAIL_DOMAIN}) and a password. This keeps your
        reports yours — only you can delete or close them.
      </p>

      <div className="board-card mt-8 p-6 sm:p-8">
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            Testing on localhost?
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Sign in immediately with a pre-configured verified student account:
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                loginAsDemoUser();
                toast.success("Welcome, Praveen Kumar! Logged in as verified student.");
                navigate({ to: "/" });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-[1.02]"
            >
              <ShieldCheck className="size-3.5" />
              ⚡ One-Click Instant Login
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("student@smvec.ac.in");
                setPassword("smvec12345");
                setName("Praveen K");
                setWhatsapp("919442158900");
                toast.info("Demo credentials filled! Click Log in or Sign up.");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Fill Credentials
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {mode === "signup" && (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-foreground">
                  Your name
                </span>
                <input
                  type="text"
                  autoComplete="name"
                  className={fieldClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Yuvaraj K"
                />
              </label>

              <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                College:{" "}
                <span className="font-semibold text-foreground">{COLLEGE_NAME}</span>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-foreground">
                  Department
                </span>
                <select
                  className={fieldClass}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-foreground">
                    Year
                  </span>
                  <select
                    className={fieldClass}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-foreground">
                    Section
                  </span>
                  <select
                    className={fieldClass}
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                  >
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-foreground">
                  WhatsApp number
                </span>
                <input
                  inputMode="numeric"
                  maxLength={15}
                  className={fieldClass}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                  placeholder="919876543210"
                />
                <span className="mt-1.5 block text-xs text-muted-foreground">
                  With country code, numbers only. Others can find you by this number.
                </span>
              </label>
            </>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-foreground">
              College email
            </span>
            <input
              type="email"
              autoComplete="email"
              className={fieldClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`you${EMAIL_DOMAIN}`}
            />
            <span className="mt-1.5 block text-xs text-muted-foreground">
              Must end with {EMAIL_DOMAIN}
            </span>
          </label>

          <div className="block">
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-foreground">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className={`${fieldClass} pr-12`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Any password of 6 characters or more is fine — simple ones are allowed.
            </p>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-pin disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Mail className="size-4" aria-hidden />
            )}
            {mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        {mode === "login" ? (
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={busy}
            className="mt-4 w-full text-center text-xs font-semibold text-accent-foreground underline underline-offset-4 disabled:opacity-60"
          >
            Forgot password? Send me a reset email
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-5 w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Log in"}
        </button>
      </div>

      {showVerifyPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-lg">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100 text-green-700">
              <Mail className="size-6" aria-hidden />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">
              Verify link sent to your mail
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a verification link to{" "}
              <span className="font-semibold text-foreground">{email}</span>. Click it to
              activate your account, then log in.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowVerifyPopup(false);
                setMode("login");
              }}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
