import { Block } from "@/types/block-types";

export function createBlockMap(
  columns: Block[][]
): Map<string, { colIndex: number; blockIndex: number }> {
  const map = new Map<string, { colIndex: number; blockIndex: number }>();

  columns.forEach((col, colIndex) => {
    col.forEach((block, blockIndex) => {
      if (!block.deleted) {
        map.set(block.block_id, { colIndex, blockIndex });
      }
    });
  });

  return map;
}
