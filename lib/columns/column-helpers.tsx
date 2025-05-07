import { Block } from "@/types/image-type";

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
  return col.reduce((acc, block, index) => {
    const blockHeight = block.height ?? 0;
    const padding = index > 0 ? spacing : 0;
    return acc + blockHeight + padding;
  }, 0);
}
