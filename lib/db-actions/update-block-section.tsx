import { supabase } from "@/lib/supabase";

export async function updateBlockSectionId(
  blockId: string,
  newSectionId: string
) {
  const { error } = await supabase
    .from("blocks")
    .update({ section_id: newSectionId })
    .eq("block_id", blockId);

  if (error) {
    console.error("Failed to update block section:", error.message);
    throw error;
  }
}
