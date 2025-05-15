import { Block, BlockInsert } from "@/types/block-types";
import { supabase } from "../supabase";
import { getVisuallySortedBlocksWithPasses } from "../columns/visual-sorting";

export async function syncOrderToSupabase(
  columns: Block[][],
  board_id: string,
  spacingSize: number
) {
  const sortedBlocks = getVisuallySortedBlocksWithPasses(columns, spacingSize);
  const updates: Partial<BlockInsert>[] = sortedBlocks
    .filter(({ block }) => !block.block_id.startsWith("temp-"))
    .map(({ block, colIndex, rowIndex, order_index }) => ({
      block_id: block.block_id,
      col_index: colIndex,
      row_index: rowIndex,
      order_index,
    }));

  console.log("Syncing block order to Supabase via update:", updates);

  const updatePromises = updates.map(
    ({ block_id, order_index, col_index, row_index }) =>
      supabase
        .from("blocks")
        .update({ order_index, col_index, row_index })
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
