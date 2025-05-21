import { Block } from "@/types/block-types";

export function generateColumnsFromBlocks(
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
