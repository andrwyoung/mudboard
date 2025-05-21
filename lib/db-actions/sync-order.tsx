import { BlockInsert } from "@/types/block-types";
import { supabase } from "../../utils/supabase";
import { PositionedBlock } from "@/types/sync-types";
import { hasWriteAccess } from "./check-write-access";
import { useUIStore } from "@/store/ui-store";

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
  positionedBlocks: PositionedBlock[],
  board_id: string
): Promise<boolean> {
  // check for access
  const canWrite = await hasWriteAccess();
  if (!canWrite) {
    console.warn("No write access: not syncing order");
    return false;
  }

  // use position map to sync
  const updates = positionedBlocksToUpdates(positionedBlocks);
  console.log("Syncing block order to Supabase via update:", updates);

  // step 1: update block order
  const updatePromises = updates.map(({ block_id, ...rest }) =>
    supabase
      .from("blocks")
      .update(rest)
      .eq("block_id", block_id)
      .eq("board_id", board_id)
  );
  const results = await Promise.all(updatePromises);
  const hasErrors = results.some((res) => res.error);

  if (hasErrors) {
    console.error("Error syncing block order:", results);
    return false;
  }

  // update number of default columns
  await supabase
    .from("boards")
    .update({ saved_column_num: useUIStore.getState().numCols })
    .eq("board_id", board_id);

  console.log("Finished syncing block order to Supabase");

  return true;
}
