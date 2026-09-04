import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const CATEGORIES = [
  "Electronics",
  "Documents",
  "Keys",
  "Clothing",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Item = {
  id: string;
  type: "lost" | "found";
  item_name: string;
  category: Category;
  description: string | null;
  place: string;
  item_date: string;
  reporter_name: string;
  image_url: string | null;
  is_resolved: boolean;
  created_at: string;
  expires_at: string;
  user_id: string | null;
};

const ITEM_COLUMNS =
  "id, type, item_name, category, description, place, item_date, reporter_name, image_url, is_resolved, created_at, expires_at, user_id";

export const itemSchema = z.object({
  type: z.enum(["lost", "found"]),
  item_name: z.string().trim().min(2, "Please write the item name").max(80),
  category: z.enum(CATEGORIES),
  description: z.string().trim().max(500).optional(),
  place: z.string().trim().min(2, "Please write the place").max(120),
  item_date: z.string().min(1, "Please pick a date"),
  reporter_name: z.string().trim().min(2, "Please write your name").max(60),
  contact_email: z
    .string()
    .trim()
    .max(255)
    .email("Please write a correct email")
    .optional()
    .or(z.literal("")),
  contact_whatsapp: z
    .string()
    .trim()
    .min(8, "Please enter a complete WhatsApp number")
    .max(15, "WhatsApp number is too long")
    .regex(/^[0-9]{8,15}$/, "Only numbers, with country code"),
});

export type ItemForm = z.infer<typeof itemSchema>;

export const DEFAULT_CAMPUS_ITEMS: Item[] = [
  {
    id: "demo-item-1",
    type: "found",
    item_name: "Casio fx-991CW Scientific Calculator",
    category: "Electronics",
    description: "Found on table 14 in CSE Lab 3 with blue marker initials 'P.K.' on the back cover.",
    place: "CSE Lab 3, 2nd Floor",
    item_date: new Date().toISOString().slice(0, 10),
    reporter_name: "Karthik R (CSE Dept)",
    image_url: null,
    is_resolved: false,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
    user_id: null,
  },
  {
    id: "demo-item-2",
    type: "lost",
    item_name: "SMVEC Student ID Card & Maroon Lanyard",
    category: "Documents",
    description: "Lost during the afternoon break between Canteen and the Mechanical block. Roll No ending with 104.",
    place: "Near Central Canteen & Mech Block",
    item_date: new Date().toISOString().slice(0, 10),
    reporter_name: "Praveen Kumar (ECE 3rd Year)",
    image_url: null,
    is_resolved: false,
    created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
    user_id: null,
  },
  {
    id: "demo-item-3",
    type: "found",
    item_name: "Honda Bike Key with Blue Fabric Ribbon",
    category: "Keys",
    description: "Found near the main security gate two-wheeler parking stand #B4. Handed over details for safe verification.",
    place: "Two-Wheeler Parking Bay B",
    item_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    reporter_name: "Vignesh S (IT Staff)",
    image_url: null,
    is_resolved: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
    user_id: null,
  },
  {
    id: "demo-item-4",
    type: "lost",
    item_name: "Black Boat Earbuds Case",
    category: "Electronics",
    description: "Matte black case with small scratch on the logo. Lost during library study hour.",
    place: "Central Library, Reference Section",
    item_date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    reporter_name: "Ananya M (AIDS Dept)",
    image_url: null,
    is_resolved: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
    user_id: null,
  },
  {
    id: "demo-item-5",
    type: "found",
    item_name: "Wildcraft College Backpack (Navy Blue)",
    category: "Clothing",
    description: "Left near Bench 3 at the College Auditorium. Contains lecture notes and a water bottle.",
    place: "College Auditorium Steps",
    item_date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    reporter_name: "Campus Security Desk",
    image_url: null,
    is_resolved: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
    user_id: null,
  },
];

export const itemsQuery = {
  queryKey: ["items"],
  queryFn: async (): Promise<Item[]> => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select(ITEM_COLUMNS)
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Item[];
      }
      return DEFAULT_CAMPUS_ITEMS;
    } catch {
      return DEFAULT_CAMPUS_ITEMS;
    }
  },
};

export function myItemsQuery(userId: string) {
  return {
    queryKey: ["items", "mine", userId],
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from("items")
        .select(ITEM_COLUMNS)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Item[];
    },
  };
}

export const ITEM_IMAGE_BUCKET = "item-images";

export async function uploadItemImage(userId: string, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(ITEM_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

export async function getItemImageUrl(path: string) {
  const { data, error } = await supabase.storage
    .from(ITEM_IMAGE_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

export const REPORT_REASONS = [
  "Joke or fake item",
  "Rude or inappropriate item",
  "Wrong or inappropriate photo",
  "Spam",
  "Other misuse",
] as const;

export async function reportItemUser(
  itemId: string,
  reportedUserId: string,
  reporterId: string,
  reason: string,
) {
  const { error } = await supabase.from("user_reports").insert({
    item_id: itemId,
    reported_user_id: reportedUserId,
    reporter_id: reporterId,
    reason,
  });
  if (error) throw error;
}



export async function setItemResolved(id: string, isResolved: boolean) {
  const { error } = await supabase
    .from("items")
    .update({ is_resolved: isResolved })
    .eq("id", id);
  if (error) throw error;
}

export type ItemContact = {
  contact_email: string | null;
  contact_whatsapp: string | null;
};

export async function fetchItemContact(id: string): Promise<ItemContact> {
  if (id.startsWith("demo-item-")) {
    return {
      contact_email: "lostfound@smvec.ac.in",
      contact_whatsapp: "919442158900",
    };
  }
  try {
    const { data, error } = await supabase.rpc("get_item_contact", {
      _item_id: id,
    });
    if (error) throw error;
    const row = (data as ItemContact[] | null)?.[0];
    return {
      contact_email: row?.contact_email ?? null,
      contact_whatsapp: row?.contact_whatsapp ?? null,
    };
  } catch {
    return {
      contact_email: "lostfound@smvec.ac.in",
      contact_whatsapp: "919442158900",
    };
  }
}

export function whatsappLink(item: Item, contact: ItemContact) {
  if (!contact.contact_whatsapp) return null;
  const text =
    item.type === "found"
      ? `Hi ${item.reporter_name}, I think the "${item.item_name}" you found at ${item.place} is mine. Can we meet?`
      : `Hi ${item.reporter_name}, I think I found your "${item.item_name}". Can we meet?`;
  return `https://wa.me/${contact.contact_whatsapp}?text=${encodeURIComponent(text)}`;
}

export function mailLink(item: Item, contact: ItemContact) {
  if (!contact.contact_email) return null;
  const subject = `SMVEC Campus Lost & Found: ${item.item_name}`;
  const body =
    item.type === "found"
      ? `Hi ${item.reporter_name},\n\nI think the "${item.item_name}" you found at ${item.place} is mine.\n\nThanks!`
      : `Hi ${item.reporter_name},\n\nI think I found your "${item.item_name}".\n\nThanks!`;
  return `mailto:${encodeURIComponent(contact.contact_email)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}
