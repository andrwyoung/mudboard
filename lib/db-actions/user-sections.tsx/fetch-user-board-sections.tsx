// DATABASE FETCH

import { UserBoardSection } from "@/types/board-types";
import { supabase } from "@/lib/supabase/supabase-client";

export async function getUserBoardSections(
  userId: string
): Promise<UserBoardSection[]> {
  const { data, error } = await supabase
    .from("user_board_sections")
    .select("*")
    .eq("board_owner", userId);

  if (error) {
    console.error("Failed to fetch user_board_sections", error);
    throw error;
  }

  return data;
}
