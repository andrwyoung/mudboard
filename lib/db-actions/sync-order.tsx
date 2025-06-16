// this is the function that syncs the block order to supabase

import { BlockInsert } from "@/types/block-types";
import { supabase } from "../../utils/supabase";
import { PositionedBlock } from "@/types/sync-types";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { SYNC_BATCH_SIZE } from "@/types/upload-settings";

function positionedBlocksToUpdates(
  blocks: PositionedBlock[]
): Partial<BlockInsert>[] {
  return blocks
    .filter(({ block }) => !block.block_id.startsWith("temp-"))
    .map(({ block, colIndex, rowIndex, orderIndex }) => ({
      block_id: block.block_id,
      section_id: block.section_id,
      col_index: colIndex,
      row_index: rowIndex,
      order_index: orderIndex,
    }));
}

export async function syncOrderToSupabase(
  positionedBlocks: PositionedBlock[]
): Promise<boolean> {
  // check for access
  const canWrite = canEditBoard();
  if (!canWrite) {
    console.warn("No write access: not syncing order");
    return false;
  }

  // use position map to sync
  const updates = positionedBlocksToUpdates(positionedBlocks);
  console.log("Syncing block order to Supabase via update:", updates);

  // step 1: update block order
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  for (let i = 0; i < updates.length; i += SYNC_BATCH_SIZE) {
    const batch = updates.slice(i, i + SYNC_BATCH_SIZE);
    const batchPromises = batch.map(({ block_id, ...rest }) =>
      supabase.from("blocks").update(rest).eq("block_id", block_id)
    );
    const results = await Promise.all(batchPromises);
    if (results.some((r) => r.error)) {
      console.error("Batch error:", results);
      return false;
    }

    // trottle requests
    await sleep(50);
  }

  // step 2: update number of default columns
  // await supabase
  //   .from("boards")
  //   .update({ saved_column_num: useUIStore.getState().numCols })
  //   .eq("board_id", board_id);

  console.log("Finished syncing block order to Supabase");

  return true;
}
