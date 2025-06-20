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
  // 2a: first insert to sections
  const sectionInsert: TablesInsert<"sections"> = {
    title: originalSection.title,
    description: originalSection.description,
    forked_from: originalSection.section_id,
    saved_column_num: originalSection.saved_column_num,
    owned_by: newOwnerUserId,
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

  // 2b: then insert to board section
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
