import { Block } from "@/types/block-types";

export function generateColumnsFromBlockLayout(
  blocks: Block[],
  numCols: number,
  useExplicitPositioning: boolean
): Block[][] {
  const newColumns: Block[][] = Array.from({ length: numCols }, () => []);
  if (!blocks.length) return newColumns;

  if (useExplicitPositioning) {
    const sorted = [...blocks].sort(
      (a, b) => a.saved_row_index! - b.saved_row_index!
    );
    for (const block of sorted) {
      if (
        block.saved_col_index != null &&
        block.saved_col_index >= 0 &&
        block.saved_col_index < numCols
      ) {
        newColumns[block.saved_col_index].push(block);
      }
    }
    return newColumns;
  }

  // Fallback to legacy order_index
  const sorted = [...blocks].sort(
    (a, b) => (a.saved_order_index ?? 0) - (b.saved_order_index ?? 0)
  );
  sorted.forEach((block, i) => {
    newColumns[i % numCols].push(block);
  });

  return newColumns;
}
