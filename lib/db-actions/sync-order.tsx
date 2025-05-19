import { BlockInsert } from "@/types/block-types";
import { supabase } from "../../utils/supabase";
import { getVisuallySortedBlocksWithPasses } from "../columns/visual-sorting";
import { SectionColumns } from "@/types/board-types";

export async function syncOrderToSupabase(
  columns: SectionColumns,
  board_id: string,
  spacingSize: number
) {
  // first loop through all the section and get each of their orders
  let sortedBlocks: ReturnType<typeof getVisuallySortedBlocksWithPasses> = [];
  for (const sectionCols of Object.values(columns)) {
    const sectionSorted = getVisuallySortedBlocksWithPasses(
      sectionCols,
      spacingSize
    );
    sortedBlocks = sortedBlocks.concat(sectionSorted);
  }

  const updates: Partial<BlockInsert>[] = sortedBlocks
    .filter(({ block }) => !block.block_id.startsWith("temp-"))
    .map(({ block, colIndex, rowIndex, order_index }) => ({
      block_id: block.block_id,
      section_id: block.section_id,
      col_index: colIndex,
      row_index: rowIndex,
      order_index,
    }));

  console.log("Syncing block order to Supabase via update:", updates);

  const updatePromises = updates.map(
    ({ block_id, section_id, order_index, col_index, row_index }) =>
      supabase
        .from("blocks")
        .update({ order_index, section_id, col_index, row_index })
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
