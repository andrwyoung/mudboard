// this function clones the entry for "sections" and then links this
// new section to your board via "board_sections"

// this function does NOT clone blocks

import { Section } from "@/types/board-types";
import { TablesInsert } from "@/types/supabase";
import { supabase } from "@/utils/supabase";

export async function cloneSection({
  originalSection,
  destinationBoardId,
  positionInBoard,
  newOwnerUserId,
}: {
  originalSection: Section;
  destinationBoardId: string;
  positionInBoard: number;
  newOwnerUserId: string | null;
}): Promise<{ newSectionId: string } | null> {
  // STEP 1: first create a new copy to the sections table
  const sectionInsert: TablesInsert<"sections"> = {
    title: originalSection.title,
    description: originalSection.description,
    forked_from: originalSection.section_id, // IMPORTANT
    saved_column_num: originalSection.saved_column_num,
    owned_by: newOwnerUserId, // IMPORTANT

    // NOTE: we intentionally leave out is_public, is_forkable etc
    // the database will fill in the defaults
  };
  const { data: newSection, error: sectionInsertErr } = await supabase
    .from("sections")
    .insert([sectionInsert])
    .select()
    .single();

  if (sectionInsertErr || !newSection) {
    console.error("Error creating section: ", sectionInsertErr);
    return null;
  }

  // STEP 2: then insert to board section in order to link this
  // new section to your board
  const { error: boardSectionErr } = await supabase
    .from("board_sections")
    .insert([
      {
        board_id: destinationBoardId,
        section_id: newSection.section_id,
        order_index: positionInBoard,
      },
    ]);

  if (boardSectionErr) {
    console.error("Error creating board section entry:, ", boardSectionErr);
    return null;
  }

  return { newSectionId: newSection.section_id };
}
