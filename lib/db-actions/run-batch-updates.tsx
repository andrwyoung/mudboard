import { SYNC_BATCH_SIZE } from "@/types/upload-settings";
import { supabase } from "../supabase/supabase-client";
import { BlockInsert } from "@/types/block-types";

export async function runSupabaseBatchUpdates(
  updates: Partial<BlockInsert>[],
  label: string = "Update"
): Promise<boolean> {
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  for (let i = 0; i < updates.length; i += SYNC_BATCH_SIZE) {
    const batch = updates.slice(i, i + SYNC_BATCH_SIZE);
    const batchPromises = batch.map(({ block_id, ...rest }) =>
      supabase.from("blocks").update(rest).eq("block_id", block_id)
    );
    const results = await Promise.all(batchPromises);
    if (results.some((r) => r.error)) {
      console.error(`${label} batch error:`, results);
      return false;
    }
    await sleep(50);
  }

  console.log(`${label} sync complete.`);
  return true;
}
