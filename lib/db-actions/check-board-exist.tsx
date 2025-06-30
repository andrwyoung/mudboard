// feel like title is pretty self explanatory lol

import { Board } from "@/types/board-types";
import { supabase } from "@/lib/supabase/supabase-client";

export async function checkIfBoardExists(
  boardId: string
): Promise<Board | null> {
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("board_id", boardId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // "Row not found" error, expected if board doesn't exist
      return null;
    }

    console.warn("Unexpected error checking board existence:", error.message);
    return null;
  }

  return data;
}
