import { supabase } from "@/lib/supabase";

export async function checkIfBoardExists(boardId: string) {
  const { data, error } = await supabase
    .from("board")
    .select("board_id")
    .eq("board_id", boardId)
    .single();

  return !!data && !error;
}
