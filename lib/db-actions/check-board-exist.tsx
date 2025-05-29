// feel like title is pretty self explanatory lol

import { supabase } from "@/utils/supabase";

export async function checkIfBoardExists(boardId: string) {
  const { data, error } = await supabase
    .from("boards")
    .select("board_id")
    .eq("board_id", boardId)
    .single();

  return !!data && !error;
}
