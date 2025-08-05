// DATABASE FETCH

import { SectionWithStatsAndBoardInfo } from "@/types/stat-types";
import { supabase } from "@/lib/supabase/supabase-client";

export default async function fetchGroupedSections(
  userId: string
): Promise<SectionWithStatsAndBoardInfo[]> {
  const { data, error } = await supabase
    .from("user_section_with_board_info_stats")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching mudkit:", error);
    return [];
  }
  console.log("boardSection data: ", data);

  return data as SectionWithStatsAndBoardInfo[];
}
