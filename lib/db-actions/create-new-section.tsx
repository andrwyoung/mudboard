// this funcion PURELY create a section in the database.
// since there are a lot of different scenarios where we create a section
// this is just a utility function for others to use

// namely this function isn't responsible to (1) check whether a user is logged in
// nor does (2) it update the new section locally.
// the functions calling this should do that if applicable

import { supabase } from "@/utils/supabase";
import { BoardSection } from "@/types/board-types";
import { TablesInsert } from "@/types/supabase";

export async function createSupabaseSection({
  board_id,
  title,
  order_index,
}: {
  board_id: string;
  title?: string;
  order_index: number;
}): Promise<BoardSection> {
  // Step 1: create a section (no board_id!)
  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .insert([{ title } as TablesInsert<"sections">])
    .select()
    .single();

  if (sectionError || !section) {
    console.error("Failed to create section, ", sectionError);
    throw new Error("Failed to create section");
  }

  // Step 2: link section to board
  const { data: boardSection, error: bsError } = await supabase
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

  if (bsError || !boardSection) {
    console.log("Failed to create board section, ", bsError);
    throw new Error("Failed to link section to board");
  }

  return boardSection;
}
