// DATABASE FETCH

import { SectionWithStatsAndBoardInfo } from "@/types/stat-types";
import { supabase } from "@/lib/supabase/supabase-client";

export default async function fetchGroupedSections(
  userId: string
): Promise<SectionWithStatsAndBoardInfo[]> {
  const { data, error } = await supabase
    .from("user_section_with_board_info")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching mudkit:", error);
    return [];
  }

  return data as SectionWithStatsAndBoardInfo[];
}
