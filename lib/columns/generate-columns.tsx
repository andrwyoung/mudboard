import { Block } from "@/types/block-types";

export function generateColumnsFromBlocks(
  blocks: Block[],
  numCols: number
): Block[][] {
  const newColumns: Block[][] = Array.from({ length: numCols }, () => []);

  const maxSavedCol = blocks.reduce(
    (max, b) => Math.max(max, b.col_index ?? 0),
    0
  );

  const useSavedOrder =
    maxSavedCol !== numCols || blocks.some((b) => b.col_index == null);

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
      const col = Math.min(block.col_index ?? 0, numCols - 1);
      newColumns[col].push(block);
    });

    newColumns.forEach((col) =>
      col.sort((a, b) => (a.row_index ?? 0) - (b.row_index ?? 0))
    );
  }

  return newColumns;
}
