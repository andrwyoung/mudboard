// KEY FILE: this is the file that generates the positioning
// and ordering map + array that we use to
// 1: figure out syncing
// 2: what "next image" and "prev image" mean
// 3: figure out the heights of each image for virtualization

import { SectionColumns } from "@/types/board-types";
import { PositionedBlock } from "@/types/sync-types";
import { CAPTION_HEIGHT } from "@/types/upload-settings";

export function generatePositionedBlocks(
  sectionColumns: SectionColumns,
  sortedSectionIds: { sectionId: string; columnWidth: number }[],
  spacingSize: number
): {
  orderedBlocks: Record<string, PositionedBlock[]>;
  positionedBlockMap: Map<string, PositionedBlock>;
} {
  const positionedBlocksBySection: Record<string, PositionedBlock[][]> = {};
  const map = new Map<string, PositionedBlock>();

  const orderedBlocks: Record<string, PositionedBlock[]> = {};

  for (const section of sortedSectionIds) {
    const sectionId = section.sectionId;
    const columnWidth = section.columnWidth;

    const columns = sectionColumns[sectionId];
    if (!columns) continue;

    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const col = columns[colIndex];
      let top = 0;
      const positionedCol: PositionedBlock[] = [];

      for (let rowIndex = 0; rowIndex < col.length; rowIndex++) {
        const block = col[rowIndex];
        if (block.deleted) continue;

        let height = block.height;
        if (block.block_type === "image" && block.width) {
          const aspect = block.height / block.width;
          height = columnWidth * aspect;

          // if it has a caption. need to add that
          if (block.caption) {
            height += CAPTION_HEIGHT;
          }
        }

        const positionedBlock: PositionedBlock = {
          block,
          top,
          height,
          sectionId,
          colIndex,
          rowIndex,
          orderIndex: 0, // will set in the next section
        };

        positionedCol.push(positionedBlock);
        map.set(block.block_id, positionedBlock);

        // get the height of the next block
        top += height + spacingSize;
      }

      // Add this column to the section
      if (!positionedBlocksBySection[sectionId]) {
        positionedBlocksBySection[sectionId] = [];
      }
      positionedBlocksBySection[sectionId].push(positionedCol);
    }

    // generate the master order map
    orderedBlocks[sectionId] = generateOrderedBlocksForSection(
      positionedBlocksBySection[sectionId],
      map
    );
  }

  return { orderedBlocks, positionedBlockMap: map };
}

// ordering the blocks by true value
function generateOrderedBlocksForSection(
  positionedBlockColumns: PositionedBlock[][],
  positionedBlockMap: Map<string, PositionedBlock>
): PositionedBlock[] {
  const ordered: PositionedBlock[] = [];
  const visited = new Set<string>();

  const pointers = Array(positionedBlockColumns.length).fill(0); // index within each column
  let hasUnvisited = true;

  while (hasUnvisited) {
    hasUnvisited = false;

    // Step 1: find the anchor block in the leftmost column
    let anchorBlock: PositionedBlock | null = null;
    let anchorCol = 0;

    for (let col = 0; col < positionedBlockColumns.length; col++) {
      while (
        pointers[col] < positionedBlockColumns[col].length &&
        visited.has(positionedBlockColumns[col][pointers[col]].block.block_id)
      ) {
        pointers[col]++;
      }

      if (pointers[col] < positionedBlockColumns[col].length) {
        anchorBlock = positionedBlockColumns[col][pointers[col]];
        anchorCol = col;
        break;
      }
    }

    if (!anchorBlock) break;

    const anchorMid = anchorBlock.top + anchorBlock.height / 2;

    // Step 2: sweep left-to-right across all columns
    for (let col = anchorCol; col < positionedBlockColumns.length; col++) {
      for (let i = pointers[col]; i < positionedBlockColumns[col].length; i++) {
        const block = positionedBlockColumns[col][i];
        const id = block.block.block_id;
        if (visited.has(id)) continue;

        if (block.top <= anchorMid) {
          // KEY SECITON: we push the block here
          ordered.push(block);
          // then we update it with the correct order_index
          const positioned = positionedBlockMap.get(block.block.block_id);
          if (positioned) {
            positioned.orderIndex = ordered.length - 1;
          }

          visited.add(id);
          pointers[col] = i + 1;
        } else {
          break;
        }
      }
    }

    hasUnvisited = pointers.some(
      (ptr, col) => ptr < positionedBlockColumns[col].length
    );
  }

  return ordered;
}
