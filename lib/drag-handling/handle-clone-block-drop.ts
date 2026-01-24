import { Block } from "@/types/block-types";
import { cloneBlocks } from "../db-actions/cloning/clone-blocks";

export async function handleClonedBlockDrop({
  block,
  toSectionId,
  toColumnIndex,
  insertIndex,
  updateSections,
}: {
  block: Block;
  toSectionId: string;
  toColumnIndex: number;
  insertIndex: number;
  updateSections: (
    updates: Record<string, (prev: Block[][]) => Block[][]>
  ) => void;
}) {
  const clonedBlockIdMap = await cloneBlocks([block], toSectionId);
  const clonedBlockId = clonedBlockIdMap[block.block_id];

  const newBlock: Block = {
    ...block,
    block_id: clonedBlockId,
    section_id: toSectionId,
  };

  updateSections({
    [toSectionId]: (prev) => {
      const cols = [...prev];
      const toCol = [...cols[toColumnIndex]];
      const insertAt = Math.min(insertIndex, toCol.length);

      toCol.splice(insertAt, 0, newBlock);
      cols[toColumnIndex] = toCol;
      return cols;
    },
  });

  // toastClonedBlocks(1);
}
