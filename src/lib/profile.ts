import { supabase } from "@/integrations/supabase/client";

export const COLLEGE_NAME = "Sri Manakula Vinayagar Engineering College";

export const DEPARTMENTS = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "AIDS",
  "AIML",
  "CSBS",
  "MBA",
  "MCA",
  "Other",
] as const;

export const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Staff"] as const;
export const SECTIONS = ["A", "B", "C", "D", "E", "Not applicable"] as const;

export type Profile = {
  id: string;
  name: string;
  city: string | null;
  college: string | null;
  department: string | null;
  year: string | null;
  section: string | null;
  whatsapp: string | null;
};

const PROFILE_COLUMNS = "id, name, city, college, department, year, section, whatsapp";

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export function myProfileQuery(userId: string) {
  return {
    queryKey: ["profile", userId],
    queryFn: () => fetchMyProfile(userId),
  };
}

export type ProfileInput = {
  name: string;
  department: string;
  year: string;
  section: string;
  whatsapp: string;
};

export async function saveMyProfile(userId: string, input: ProfileInput) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      name: input.name,
      college: COLLEGE_NAME,
      department: input.department,
      year: input.year,
      section: input.section,
      whatsapp: input.whatsapp,
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

/**
 * Signup saves the campus details in the account metadata. The first time the
 * user has a real session we copy it into their profile row.
 */
export async function syncProfileFromMetadata(
  userId: string,
  meta: Record<string, unknown>,
) {
  const str = (key: string) =>
    typeof meta[key] === "string" ? (meta[key] as string).trim() : "";
  const name = str("name");
  if (!name) return;
  const existing = await fetchMyProfile(userId);
  if (existing) return;
  await saveMyProfile(userId, {
    name,
    department: str("department"),
    year: str("year"),
    section: str("section"),
    whatsapp: str("whatsapp"),
  });
}

