// this funcion PURELY create a section in the database.
// since there are a lot of different scenarios where we create a section
// this is just a utility function for others to use

// namely this function isn't responsible to (1) check whether a user is logged in
// nor does (2) it update the new section locally.
// the functions calling this should do that if applicable

import { supabase } from "@/utils/supabase";
import { Section } from "@/types/board-types";
import { TablesInsert } from "@/types/supabase";

export async function createSupabaseSection({
  board_id,
  title,
  order_index,
}: {
  board_id: string;
  title?: string;
  order_index: number;
}): Promise<Section> {
  const { data, error } = await supabase
    .from("sections")
    .insert([
      {
        board_id,
        title,
        order_index,
      } as TablesInsert<"sections">,
    ])
    .select()
    .single();

  if (error) throw new Error("Failed to create section");

  return data;
}
