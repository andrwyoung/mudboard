// DATABASE FETCH

import { Section } from "@/types/board-types";
import { supabase } from "@/lib/supabase/supabase-client";

export async function checkIfSectionExists(
  sectionId: string
): Promise<Section | null> {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("section_id", sectionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // "Row not found" error, expected if section doesn't exist
      return null;
    }

    console.warn("Unexpected error checking section existence:", error.message);
    return null;
  }

  return data;
}
