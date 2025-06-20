import { canEditBoard } from "@/lib/auth/can-edit-board";
import { supabase } from "@/utils/supabase";

export async function updateGreyscaleSupabase(
  blockId: string,
  isGreyscale: boolean
) {
  const canWrite = canEditBoard();
  if (!canWrite) {
    console.warn("No write access: not persisting greyscale to db");
    return;
  }

  const { error } = await supabase
    .from("blocks")
    .update({ is_greyscale: isGreyscale })
    .eq("block_id", blockId);

  if (error) {
    console.error("Failed to update greyscale state:", error.message);
  }
}
