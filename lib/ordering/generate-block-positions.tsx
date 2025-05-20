import { MudboardImage } from "@/types/block-types";
import { SectionColumns } from "@/types/board-types";
import { PositionedBlock } from "@/types/sync-types";

export function generatePositionedBlocks(
  sectionColumns: SectionColumns,
  spacingSize: number
): {
  positionedBlocksBySection: Record<string, PositionedBlock[]>;
  positionedBlockMap: Map<string, PositionedBlock>;
} {
  const positionedBlocksBySection: Record<string, PositionedBlock[]> = {};
  const map = new Map<string, PositionedBlock>();
  let globalOrderIndex = 0;

  for (const [sectionId, columns] of Object.entries(sectionColumns)) {
    const positioned: PositionedBlock[] = [];

    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const col = columns[colIndex];
      let top = 0;

      for (let rowIndex = 0; rowIndex < col.length; rowIndex++) {
        const block = col[rowIndex];
        if (block.deleted) continue;

        let height = block.height;
        if (block.block_type === "image" && block.data) {
          const imageBlock = block.data as MudboardImage;

          const aspect = block.height / imageBlock.width;
          height = Math.round(spacingSize * aspect);
        }

        const positionedBlock: PositionedBlock = {
          block,
          top,
          height,
          sectionId,
          colIndex,
          rowIndex,
          orderIndex: globalOrderIndex++,
        };

        positioned.push(positionedBlock);
        map.set(block.block_id, positionedBlock);
        top += height + spacingSize;
      }
    }

    positionedBlocksBySection[sectionId] = positioned;
  }

  return { positionedBlocksBySection, positionedBlockMap: map };
}
