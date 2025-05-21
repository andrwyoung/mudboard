import { Block } from "@/types/block-types";

export function generateColumnsFromBlocks(
  blocks: Block[] | undefined,
  numCols: number
): Block[][] {
  console.log("generating blocks from this array: ", blocks);
  const newColumns: Block[][] = Array.from({ length: numCols }, () => []);
  console.log("here's how many columns we have: ", newColumns);

  if (!blocks) return newColumns;

  const maxSavedCol = blocks.reduce(
    (max, b) => Math.max(max, b.saved_col_index ?? 0),
    0
  );

  const useSavedOrder =
    maxSavedCol !== numCols || blocks.some((b) => b.saved_col_index == null);

  if (useSavedOrder) {
    const sorted = [...blocks].sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
    );

    sorted.forEach((block, i) => {
      const col = i % numCols;
      newColumns[col].push(block);
    });
  } else {
    blocks.forEach((block) => {
      const col = Math.min(block.saved_col_index ?? 0, numCols - 1);
      newColumns[col].push(block);
    });

    newColumns.forEach((col) =>
      col.sort((a, b) => (a.saved_row_index ?? 0) - (b.saved_row_index ?? 0))
    );
  }

  return newColumns;
}
