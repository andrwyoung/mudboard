// grab the board
// if this fails we're screwed

import { Board } from "@/types/board-types"; // adjust path as needed
import { supabase } from "../../utils/supabase";

export async function fetchSupabaseBoard(boardId: string): Promise<Board> {
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("board_id", boardId)
    .single();

  if (error || !data) {
    throw new Error("Failed to fetch board: " + error?.message);
  }

  return data;
}
