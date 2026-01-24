// DATABASE FETCH

import { SectionWithStats } from "@/types/stat-types";
import { supabase } from "@/lib/supabase/supabase-client";

export default async function fetchSingleMudkits(
  sectionId: string
): Promise<SectionWithStats | null> {
  const { data, error } = await supabase
    .from("section_with_stats")
    .select("*")
    .eq("section_id", sectionId)
    .eq("is_public", true)
    .single();

  if (error) {
    console.error("Error fetching mudkit:", error);
    return null;
  }

  return data as SectionWithStats;
}
