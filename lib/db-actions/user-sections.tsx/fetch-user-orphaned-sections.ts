// DATABASE FETCH

import { SectionWithStats } from "@/types/stat-types";
import { supabase } from "@/lib/supabase/supabase-client";

export async function getOrphanedSectionsForUser(
  userId: string
): Promise<SectionWithStats[]> {
  const { data, error } = await supabase
    .from("section_with_stats")
    .select("*")
    .eq("owned_by", userId)
    .eq("personal_copy_count", 0)
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch orphaned Sections", error);
  }

  return data;
}
