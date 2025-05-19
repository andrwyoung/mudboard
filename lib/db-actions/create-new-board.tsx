import { supabase } from "@/utils/supabase";
import { Tables, TablesInsert } from "@/types/supabase";
import { v4 as uuidv4 } from "uuid";
import { createSupabaseSection } from "./create-new-section";
import { initializeSectionColumns } from "../sync/new-section-columns";

export async function createNewBoard({
  title = "Untitled Board",
}: {
  title?: string;
}): Promise<Tables<"boards">> {
  const newBoardId = uuidv4();

  const { data: boardData, error: boardError } = await supabase
    .from("boards")
    .insert([
      {
        board_id: newBoardId,
        title,
      } as TablesInsert<"boards">,
    ])
    .select()
    .single();

  if (boardError) throw new Error("Failed to create board");

  // always make a new section if we make a board
  const newSection = await createSupabaseSection({
    board_id: boardData.board_id,
    order_index: 0,
  });

  initializeSectionColumns(newSection.section_id);

  return boardData;
}
