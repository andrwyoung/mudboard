import { CropRect } from "@/types/block-types";
import { supabase } from "@/lib/supabase/supabase-client";

export async function updateCropSupabase(
  blockId: string,
  crop: CropRect | null,
  canEdit: boolean
) {
  if (!canEdit) {
    if (process.env.NODE_ENV === "development") {
      console.warn("No write access: not persisting crop to db");
    }
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
