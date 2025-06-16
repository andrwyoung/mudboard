// when we first grab all the data from the database, this is the function
// that organizes it and actually generates the columns

import { Block } from "@/types/block-types";

// Generate initial columns from blocks, handling both legacy and explicit layouts
export function generateInitColumnsFromBlocks(
  blocks: Block[] | undefined,
  numCols: number
): Block[][] {
  const newColumns: Block[][] = Array.from({ length: numCols }, () => []);

  if (!blocks || blocks.length === 0) return newColumns;

  // Check if we can use col_index/row_index
  let canUseExplicitIndices = !!numCols;
  if (canUseExplicitIndices) {
    for (const b of blocks) {
      if (
        b.col_index === undefined ||
        b.row_index === undefined ||
        b.col_index < 0 ||
        b.col_index >= numCols
      ) {
        canUseExplicitIndices = false;
        break;
      }
    }
  }

  if (canUseExplicitIndices) {
    // Sort by row_index to maintain vertical order
    const sorted = [...blocks].sort((a, b) => a.row_index! - b.row_index!);
    for (const block of sorted) {
      newColumns[block.col_index!].push(block);
    }
    return newColumns;
  }

  // Fallback to legacy order_index layout
  const sorted = [...blocks].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  sorted.forEach((block, i) => {
    const col = i % numCols;
    newColumns[col].push(block);
  });

  return newColumns;
}
