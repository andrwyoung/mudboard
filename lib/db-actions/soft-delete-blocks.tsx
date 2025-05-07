import { supabase } from "@/lib/supabase";

export async function softDeleteBlocks(blockIds: string[]) {
  if (blockIds.length === 0) return;

  const { error } = await supabase
    .from("blocks")
    .update({ deleted: true })
    .in("block_id", blockIds);

  if (error) {
    console.error("Failed to delete blocks:", error);
  }
}
