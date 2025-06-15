// feel like title is pretty self explanatory lol

import { Board } from "@/types/board-types";
import { supabase } from "@/utils/supabase";

export async function checkIfBoardExists(
  boardId: string
): Promise<Board | null> {
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("board_id", boardId)
    .single();

  if (error) {
    console.error("Error checking board existence:", error);
    return null;
  }

  return data;
}
