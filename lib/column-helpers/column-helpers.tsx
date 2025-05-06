import { INDEX_MULTIPLIER } from "@/types/constants";
import { Block } from "@/types/image-type";

export function findShortestColumn(columns: Block[][]): number {
  let minIndex = 0;
  let minLength = columns[0]?.length || 0;

  for (let i = 1; i < columns.length; i++) {
    if (columns[i].length < minLength) {
      minLength = columns[i].length;
      minIndex = i;
    }
  }

  return minIndex;
}

export function getNextRowIndex(column: Block[]): number {
  if (column.length === 0) return 0;
  const lastIndex =
    column[column.length - 1].row_index ??
    (column.length - 1) * INDEX_MULTIPLIER;
  return lastIndex + INDEX_MULTIPLIER;
}
