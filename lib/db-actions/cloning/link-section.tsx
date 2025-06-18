import { TablesInsert } from "@/types/supabase";
import { supabase } from "@/utils/supabase";

export async function linkSectionToBoard({
  board_id,
  section_id,
  order_index,
}: {
  board_id: string;
  section_id: string;
  order_index: number;
}) {
  // STEP 1: create new board_section relation
  const { data: boardSectionMetadata, error: bsError } = await supabase
    .from("board_sections")
    .insert([
      {
        board_id,
        section_id,
        order_index,
      } as TablesInsert<"board_sections">,
    ])
    .select()
    .single();

  if (bsError || !boardSectionMetadata) {
    console.error("Error creating board_section:", bsError);
    throw new Error("Failed to create board_section");
  }

  //
  // STEP 2: now grab that board section along with the section
  const { data: boardSection, error } = await supabase
    .from("board_sections")
    .select("*, section:sections(*)")
    .eq("board_section_id", boardSectionMetadata.board_section_id);

  if (error) {
    throw new Error("Failed to fetch board_sections: " + error.message);
  }
  console.log(boardSection);

  // STEP 2b: insert that locally

  // STEP 3: now fetch the blocks (i hope it regenerates)

  // STEP 3b: insert those locally

  // STEP 3: locally add the boardSection
  // return the boardSection id
}
