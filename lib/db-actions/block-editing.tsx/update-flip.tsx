import { supabase } from "@/lib/supabase/supabase-client";

export async function updateFlippedSupabase(
  blockId: string,
  isFlipped: boolean,
  canEdit: boolean
) {
  if (!canEdit) {
    if (process.env.NODE_ENV === "development") {
      console.warn("No write access: not persisting flip to db");
    }
    return;
  }

  const { error } = await supabase
    .from("blocks")
    .update({ is_flipped: isFlipped })
    .eq("block_id", blockId);

  if (error) {
    console.error("Failed to update flipped state:", error.message);
  }
}
