import { BlockInsert } from "@/types/block-types";
import { supabase } from "../../utils/supabase";
import { PositionedBlock } from "@/types/sync-types";

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
  // use position map to sync
  const updates = positionedBlocksToUpdates(positionedBlocks);
  console.log("Syncing block order to Supabase via update:", updates);

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

  console.log("Finished syncing block order to Supabase");

  return true;
}
