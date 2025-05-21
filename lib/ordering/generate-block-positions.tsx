import { MudboardImage } from "@/types/block-types";
import { SectionColumns } from "@/types/board-types";
import { PositionedBlock } from "@/types/sync-types";
import { getColumnWidth } from "./get-column-width";
import { CAPTION_HEIGHT } from "@/types/upload-settings";

export function generatePositionedBlocks(
  sectionColumns: SectionColumns,
  sidebarWidth: number,
  windowWidth: number,
  spacingSize: number
): {
  orderedBlocks: PositionedBlock[];
  positionedBlockMap: Map<string, PositionedBlock>;
} {
  const positionedBlocksBySection: Record<string, PositionedBlock[][]> = {};
  const map = new Map<string, PositionedBlock>();
  const columnWidth = getColumnWidth(sidebarWidth, windowWidth, spacingSize);

  for (const [sectionId, columns] of Object.entries(sectionColumns)) {
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const col = columns[colIndex];
      let top = 0;
      const positionedCol: PositionedBlock[] = [];

      for (let rowIndex = 0; rowIndex < col.length; rowIndex++) {
        const block = col[rowIndex];
        if (block.deleted) continue;

        let height = block.height;
        if (block.block_type === "image" && block.data) {
          const imageBlock = block.data as MudboardImage;
          const aspect = block.height / imageBlock.width;
          height = columnWidth * aspect;

          // if it has a caption. need to add that
          if (imageBlock.caption) {
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
  }

  const orderedBlocks = generateOrderedBlocks(positionedBlocksBySection, map);

  return { orderedBlocks, positionedBlockMap: map };
}

// ordering the blocks by true value
function generateOrderedBlocks(
  positionedBlocksBySection: Record<string, PositionedBlock[][]>,
  positionedBlockMap: Map<string, PositionedBlock>
): PositionedBlock[] {
  const ordered: PositionedBlock[] = [];
  const visited = new Set<string>();

  for (const columns of Object.values(positionedBlocksBySection)) {
    const pointers = Array(columns.length).fill(0); // index within each column
    let hasUnvisited = true;

    while (hasUnvisited) {
      hasUnvisited = false;

      // Step 1: find the anchor block in the leftmost column
      let anchorBlock: PositionedBlock | null = null;
      let anchorCol = 0;

      for (let col = 0; col < columns.length; col++) {
        while (
          pointers[col] < columns[col].length &&
          visited.has(columns[col][pointers[col]].block.block_id)
        ) {
          pointers[col]++;
        }

        if (pointers[col] < columns[col].length) {
          anchorBlock = columns[col][pointers[col]];
          anchorCol = col;
          break;
        }
      }

      if (!anchorBlock) break;

      const anchorMid = anchorBlock.top + anchorBlock.height / 2;

      // Step 2: sweep left-to-right across all columns
      for (let col = anchorCol; col < columns.length; col++) {
        for (let i = pointers[col]; i < columns[col].length; i++) {
          const block = columns[col][i];
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

      hasUnvisited = pointers.some((ptr, col) => ptr < columns[col].length);
    }
  }

  return ordered;
}
