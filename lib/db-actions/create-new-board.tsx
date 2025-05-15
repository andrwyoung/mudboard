import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/supabase";
import { v4 as uuidv4 } from "uuid";

export async function createNewBoard({
  title = "Untitled Board",
}: {
  title?: string;
}): Promise<Tables<"boards">> {
  const newBoardId = uuidv4();

  const { data, error } = await supabase
    .from("boards")
    .insert([
      {
        board_id: newBoardId,
        title,
      },
    ])
    .select()
    .single();

  if (error) throw new Error("Failed to create board");

  return data;
}
