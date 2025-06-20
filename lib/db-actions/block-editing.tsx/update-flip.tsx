import { supabase } from "@/utils/supabase";

export async function updateFlippedSupabase(
  blockId: string,
  isFlipped: boolean
) {
  const { error } = await supabase
    .from("blocks")
    .update({ is_flipped: isFlipped })
    .eq("block_id", blockId);

  if (error) {
    console.error("Failed to update flipped state:", error.message);
  }
}
