import { Block } from "@/types/image-type";

type VisualBlock = {
  block: Block;
  colIndex: number;
  rowIndex: number;
  order_index: number;
  visualTop: number;
  visualMid: number;
  visualBottom: number;
};

export function getVisuallySortedBlocksWithPasses(
  columns: Block[][],
  spacing: number
): VisualBlock[] {
  const taken = new Set<string>();
  const result: VisualBlock[] = [];

  const blockMetadata: Omit<VisualBlock, "order_index">[][] = columns.map(
    (col) => {
      let currentY = 0;
      return col.map((block, rowIndex) => {
        const padding = rowIndex > 0 ? spacing : 0;
        const top = currentY;
        const height = block.height ?? 0;
        const mid = top + height / 2;
        const bottom = top + height;
        currentY += height + padding;

        return {
          block,
          colIndex: -1, // to be filled in below
          rowIndex,
          visualTop: top,
          visualMid: mid,
          visualBottom: bottom,
        };
      });
    }
  );

  // keep track of colindex
  blockMetadata.forEach((col, colIndex) => {
    col.forEach((b) => {
      b.colIndex = colIndex;
    });
  });

  const numCols = columns.length;
  let order_index = 0;

  while (taken.size < columns.flat().length) {
    let startBlock: (typeof blockMetadata)[0][0] | null = null;
    for (let col = 0; col < numCols; col++) {
      const candidate = blockMetadata[col].find(
        (b) => !taken.has(b.block.block_id)
      );
      if (candidate) {
        startBlock = candidate;
        break;
      }
    }

    if (!startBlock) break;

    const passMidThreshold = startBlock.visualMid;
    result.push({ ...startBlock, order_index });
    taken.add(startBlock.block.block_id);
    order_index++;

    for (let col = startBlock.colIndex + 1; col < numCols; col++) {
      const eligibleBlocks = blockMetadata[col].filter(
        (b) => !taken.has(b.block.block_id) && b.visualTop <= passMidThreshold
      );

      for (const block of eligibleBlocks) {
        result.push({ ...block, order_index });
        taken.add(block.block.block_id);
        order_index++;
      }
    }
  }

  return result;
}
