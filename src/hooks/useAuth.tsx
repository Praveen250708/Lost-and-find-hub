import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const DEMO_USER: User = {
  id: "demo-student-praveen",
  app_metadata: { provider: "email" },
  user_metadata: {
    name: "Praveen Kumar",
    college: "Sri Manakula Vinayagar Engineering College",
    department: "ECE",
    year: "3rd Year",
    section: "B",
    whatsapp: "919442158900",
  },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "praveen.ece@smvec.ac.in",
  phone: "",
  role: "authenticated",
  updated_at: new Date().toISOString(),
};

export function loginAsDemoUser() {
  if (typeof window !== "undefined") {
    localStorage.setItem("smvec_demo_user", JSON.stringify(DEMO_USER));
    window.dispatchEvent(new Event("smvec-auth-change"));
  }
}

export function logoutDemoUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("smvec_demo_user");
    window.dispatchEvent(new Event("smvec-auth-change"));
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [demoUser, setDemoUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("smvec_demo_user");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    // Check supabase session
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });

    // Check custom demo auth events
    const handleAuthChange = () => {
      const saved = localStorage.getItem("smvec_demo_user");
      setDemoUser(saved ? JSON.parse(saved) : null);
    };

    window.addEventListener("smvec-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      active = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("smvec-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const activeUser = session?.user ?? demoUser ?? null;

  return {
    session,
    user: activeUser,
    userId: activeUser?.id ?? null,
    email: activeUser?.email ?? null,
    loading,
    isDemo: Boolean(!session?.user && demoUser),
  };
}
