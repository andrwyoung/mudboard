import { BoardWithStats } from "@/types/stat-types";
import { supabase } from "@/utils/supabase";

export async function getUserBoardsWithStats(
  userId: string
): Promise<BoardWithStats[]> {
  const { data, error } = await supabase
    .from("board_with_stats")
    .select("*")
    .eq("user_id", userId)
    .is("deleted", false) // only non-deleted boards
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user board with stats:", error);
    return [];
  }

  return data;
}
