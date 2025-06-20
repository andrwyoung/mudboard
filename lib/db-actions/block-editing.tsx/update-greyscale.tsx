import { supabase } from "@/utils/supabase";

export async function updateGreyscaleSupabase(
  blockId: string,
  isGreyscale: boolean
) {
  const { error } = await supabase
    .from("blocks")
    .update({ is_greyscale: isGreyscale })
    .eq("block_id", blockId);

  if (error) {
    console.error("Failed to update greyscale state:", error.message);
  }
}
