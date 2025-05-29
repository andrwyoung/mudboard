// grab all the sections
// I was debating whether or not this should be the one responsible for
// creating a new section if none exist but I decided against it

import { Section } from "@/types/board-types";
import { supabase } from "../../utils/supabase";

export async function fetchSupabaseSections(
  boardId: string
): Promise<Section[]> {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("board_id", boardId)
    .eq("deleted", false) // don't serve deleted blocks
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch sections: " + error.message);
  }

  //  // No sections found — create a default one
  //  if (!data || data.length === 0) {
  //   const fallback = await createSection({ board_id: boardId });
  //   return [fallback];
  // }

  return data;
}
