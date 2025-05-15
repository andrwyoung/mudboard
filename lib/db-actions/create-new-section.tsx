import { supabase } from "@/lib/supabase";
import { Section } from "@/types/block-types";
import { DEFAULT_SECTION_NAME } from "@/types/constants";
import { TablesInsert } from "@/types/supabase";
import { v4 as uuidv4 } from "uuid";

export async function createSection({
  board_id,
  title = DEFAULT_SECTION_NAME,
  order_index,
}: {
  board_id: string;
  title?: string;
  order_index?: number;
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
