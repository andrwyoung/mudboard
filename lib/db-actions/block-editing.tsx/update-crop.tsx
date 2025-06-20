import { canEditBoard } from "@/lib/auth/can-edit-board";
import { CropRect } from "@/types/block-types";
import { supabase } from "@/utils/supabase";

export async function updateCropSupabase(
  blockId: string,
  crop: CropRect | null
) {
  const canWrite = canEditBoard();
  if (!canWrite) {
    console.warn("No write access: not persisting crop to db");
    return;
  }

  const { error } = await supabase
    .from("blocks")
    .update({ crop })
    .eq("block_id", blockId);

  if (error) {
    console.error("Failed to update crop:", error.message);
  }
}
