import { SectionColumns } from "@/types/board-types";

export function createBlockMap(
  sectionColumns: SectionColumns
): Map<string, { sectionId: string; colIndex: number; blockIndex: number }> {
  const map = new Map<
    string,
    { sectionId: string; colIndex: number; blockIndex: number }
  >();

  for (const [sectionId, columns] of Object.entries(sectionColumns)) {
    columns.forEach((col, colIndex) => {
      col.forEach((block, blockIndex) => {
        if (!block.deleted) {
          map.set(block.block_id, { sectionId, colIndex, blockIndex });
        }
      });
    });
  }

  return map;
}
