// 1. create the board
// 2. create the default section. Important because all boards need at least 1 section. but it's
// ok if this fails to make a new section because on init-board we catch this edge case
// 3. initialize section columns: which just creates a blank array for us depending on number of columns

import { supabase } from "@/utils/supabase";
import { Tables } from "@/types/supabase";
import { createSupabaseSection } from "./create-new-section";
import { initializeSectionColumns } from "../columns/new-section-columns";

export async function createNewBoard({
  title,
  claimedBy,
  initializeSection = true,
}: {
  title?: string;
  claimedBy?: string;
  initializeSection?: boolean;
}): Promise<Tables<"boards">> {
  const { data: boardData, error: boardError } = await supabase
    .from("boards")
    .insert([{ title, user_id: claimedBy }])
    .select()
    .single();

  if (boardError) throw new Error("Failed to create board");

  // by default we make a new empty section, but we can disable for cloning
  if (initializeSection) {
    // always make a new section if we make a board
    const newSection = await createSupabaseSection({
      board_id: boardData.board_id,
      order_index: 0,
    });

    initializeSectionColumns(newSection.section_id);
  }

  return boardData;
}
