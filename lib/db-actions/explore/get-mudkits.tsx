import { SectionWithStats } from "@/types/stat-types";
import { supabase } from "@/lib/supabase/supabase-client";

export default async function fetchMudkits(): Promise<SectionWithStats[]> {
  const { data, error } = await supabase
    .from("section_with_stats")
    .select("*")
    .eq("is_public", true)
    .eq("is_on_marketplace", true)
    .order("first_published_at", { ascending: false });

  if (error) {
    console.error("Error fetching mudkits:", error.message);
    return [];
  }

  return data;
}
