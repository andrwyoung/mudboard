// when we first grab all the data from the database, this is the function
// that organizes it and actually generates the columns

import { Block } from "@/types/block-types";
import { generateColumnsFromBlockLayout } from "./generate-columns";

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
        b.saved_col_index === undefined ||
        b.saved_row_index === undefined ||
        b.saved_col_index < 0 ||
        b.saved_col_index >= numCols
      ) {
        canUseExplicitIndices = false;
        break;
      }
    }
  }

  return generateColumnsFromBlockLayout(blocks, numCols, canUseExplicitIndices);
}
