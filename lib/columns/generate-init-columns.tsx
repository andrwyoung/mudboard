// this is the function that orders the blocks into columns on initialization
// in other words, this is the function that takes the order we have in the
// database and puts it into practice

import { Block } from "@/types/block-types";

// TODO: we needa redo this to generate the columns using colIndex and rowIndex
export function generateInitColumnsFromBlocks(
  blocks: Block[] | undefined,
  numCols: number
): Block[][] {
  const newColumns: Block[][] = Array.from({ length: numCols }, () => []);

  if (!blocks || blocks.length === 0) return newColumns;

  // Sort by the universal layout truth
  const sorted = [...blocks].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  // Distribute across columns in order
  sorted.forEach((block, i) => {
    const col = i % numCols;
    newColumns[col].push(block);
  });

  return newColumns;
}
