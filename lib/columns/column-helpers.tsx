import { Block } from "@/types/block-types";

export function getColumnHeights(
  columns: Block[][],
  spacing: number
): number[] {
  return columns.map((col) => {
    return col.reduce((sum, block, index) => {
      const height = block.height ?? 0;
      const padding = index > 0 ? spacing : 0;
      return sum + height + padding;
    }, 0);
  });
}

export function findShortestColumn(
  columns: Block[][],
  spacing: number
): number {
  const heights = getColumnHeights(columns, spacing);
  return heights.indexOf(Math.min(...heights));
}

export function getNextRowIndex(col: Block[], spacing: number): number {
  if (col.length === 0) return 0;

  const lastBlock = col[col.length - 1];
  const height = lastBlock.height ?? 0;
  const rowIndex = lastBlock.row_index ?? 0;

  return rowIndex + height + spacing;
}
