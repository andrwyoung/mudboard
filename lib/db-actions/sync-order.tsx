import { Block, BlockInsert } from "@/types/image-type";
import { supabase } from "../supabase";

export async function syncOrderToSupabase(
  columns: Block[][],
  board_id: string
) {
  // first build out the order
  const updates: Partial<BlockInsert>[] = [];
  columns.forEach((column, colIndex) => {
    column.forEach((block, rowIndex) => {
      if (!block.block_id.startsWith("temp-")) {
        updates.push({
          block_id: block.block_id,
          board_id: block.board_id,
          col_index: colIndex,
          row_index: rowIndex,
          order_index: updates.length, // linear visual order if still needed
        });
      }
    });
  });

  console.log("Syncing block order to Supabase via update:", updates);

  const updatePromises = updates.map(
    ({ block_id, board_id, order_index, col_index, row_index }) =>
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
