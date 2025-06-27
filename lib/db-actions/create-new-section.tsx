// make new section in database. link that section to board

// this function DOES NOT:
// - check if user is logged in
// - update section locally

import { supabase } from "@/utils/supabase";
import { BoardSection } from "@/types/board-types";
import { TablesInsert } from "@/types/supabase";
import { DEFAULT_COLUMNS } from "@/types/constants";

export async function createSupabaseBoardSection({
  board_id,
  title,
  order_index,
  claimedBy,
}: {
  board_id: string;
  title?: string;
  order_index: number;
  claimedBy: string | null;
}): Promise<BoardSection> {
  // Step 1: create a section (no board_id!)
  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .insert([
      {
        title,
        owned_by: claimedBy,
        saved_column_num: DEFAULT_COLUMNS,
      } as TablesInsert<"sections">,
    ])
    .select()
    .single();

  if (sectionError || !section) {
    console.error("Failed to create section, ", sectionError);
    throw new Error("Failed to create section");
  }

  // Step 2: link section to board
  const { data: boardSectionData, error: bsError } = await supabase
    .from("board_sections")
    .insert([
      {
        board_id,
        section_id: section.section_id,
        order_index,
      } as TablesInsert<"board_sections">,
    ])
    .select("*, section:sections(*)")
    .single();

  if (bsError || !boardSectionData) {
    console.log("Failed to create board section, ", bsError);
    throw new Error("Failed to link section to board");
  }

  // IMPORTANT (kind of fragile sorry). initialize visualColumnNumber
  const boardSection = boardSectionData as BoardSection;
  boardSection.section.visualColumnNum = boardSection.section.saved_column_num;

  return boardSection;
}
