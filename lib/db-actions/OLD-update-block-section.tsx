// DEPRECATED. we just let sync-order.tsx handle this

import { supabase } from "@/lib/supabase/supabase-client";

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
