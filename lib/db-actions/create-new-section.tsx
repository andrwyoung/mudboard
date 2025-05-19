import { supabase } from "@/utils/supabase";
import { Section } from "@/types/board-types";
import { TablesInsert } from "@/types/supabase";
import { v4 as uuidv4 } from "uuid";

export async function createSupabaseSection({
  board_id,
  title,
  order_index,
}: {
  board_id: string;
  title?: string;
  order_index: number;
}): Promise<Section> {
  const newSectionId = uuidv4();

  const { data, error } = await supabase
    .from("sections")
    .insert([
      {
        section_id: newSectionId,
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
