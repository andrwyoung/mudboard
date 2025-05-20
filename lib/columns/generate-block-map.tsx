import { SectionColumns } from "@/types/board-types";
import { PositionedBlock } from "@/types/sync-types";

// close to being DEPRECATED
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

export function createPositionedBlockMap(
  positionedBlocksBySection: Record<string, PositionedBlock[]>
): Map<string, PositionedBlock> {
  const map = new Map<string, PositionedBlock>();

  for (const sectionBlocks of Object.values(positionedBlocksBySection)) {
    for (const positioned of sectionBlocks) {
      map.set(positioned.block.block_id, positioned);
    }
  }

  return map;
}
