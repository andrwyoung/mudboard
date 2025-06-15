// grab all the sections
// I was debating whether or not this should be the one responsible for
// creating a new section if none exist but I decided against it

import { BoardSection } from "@/types/board-types";
import { supabase } from "../../utils/supabase";

export async function fetchSupabaseSections(
  boardId: string
): Promise<BoardSection[]> {
  const { data, error } = await supabase
    .from("board_sections")
    .select("*, section:sections(*)")
    .eq("board_id", boardId)
    .eq("deleted", false) // Filter on board_sections
    .filter("section.deleted", "eq", false) // Filter on joined section
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch board_sections: " + error.message);
  }

  console.log("fetched board sections: ", data);

  return data as BoardSection[];
}
