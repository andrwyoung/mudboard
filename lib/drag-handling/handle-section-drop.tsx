import { Block } from "@/types/block-types";
import { Section, SectionColumns } from "@/types/board-types";
import { PositionedBlock } from "@/types/sync-types";
import { toast } from "sonner";
import { cloneBlocks } from "../db-actions/cloning/clone-blocks";
import { toastClonedBlocks } from "@/utils/toast-clone-blocks";

export async function handleSectionDrop({
  activeBlocksWithPos,
  sectionColumns,
  updateSections,
  targetSection,
  cloneBlock,
}: {
  activeBlocksWithPos: PositionedBlock[];
  sectionColumns: SectionColumns;
  updateSections: (
    updates: Record<string, (prev: Block[][]) => Block[][]>
  ) => void;
  targetSection: Section;
  cloneBlock: boolean;
}) {
  if (!targetSection || !activeBlocksWithPos?.length) {
    return;
  }

  // if everything is from the same section,
  // and it's dropped on the same section, do nothing
  const allFromSameSection = activeBlocksWithPos.every(
    (b) => b.sectionId === activeBlocksWithPos[0].sectionId
  );
  const isSameTargetSection =
    activeBlocksWithPos[0].sectionId === targetSection.section_id;
  if (allFromSameSection && isSameTargetSection) {
    toast("Blocks moved to bottom of Section");
  }

  // Step 1: prep a map. initialize all involved sections with a copy of current columns
  const sectionMutations = new Map<string, Block[][]>();
  for (const { sectionId } of activeBlocksWithPos) {
    if (!sectionMutations.has(sectionId)) {
      sectionMutations.set(sectionId, [
        ...sectionColumns[sectionId].map((col) => [...col]),
      ]);
    }
  }

  if (!sectionMutations.has(targetSection.section_id)) {
    sectionMutations.set(targetSection.section_id, [
      ...sectionColumns[targetSection.section_id].map((col) => [...col]),
    ]);
  }

  // Step 2: Remove each block from its source
  // UNLESS we're cloning
  if (!cloneBlock) {
    for (const { sectionId, colIndex, rowIndex } of activeBlocksWithPos) {
      const sectionCols = sectionMutations.get(sectionId);
      if (!sectionCols) continue;

      const col = sectionCols[colIndex];
      col.splice(rowIndex, 1); // remove the block
    }
  }

  // Step 2.5: if we're cloning, then we want to create a new copy of each of the blocks
  // then update using that
  let finalBlocks = activeBlocksWithPos;
  if (cloneBlock) {
    console.log("cloning blocks", finalBlocks);
    const blockIdMap = await cloneBlocks(
      activeBlocksWithPos.map((b) => b.block),
      targetSection.section_id
    );

    finalBlocks = activeBlocksWithPos.map((b) => {
      const newId = blockIdMap[b.block.block_id];
      return {
        ...b,
        block: {
          ...b.block,
          block_id: newId,
          section_id: targetSection.section_id, // important!
        },
        sectionId: targetSection.section_id,
      };
    });
  }

  // Step 3: insert each into the shortest column in the target section
  const targetCols = sectionMutations.get(targetSection.section_id)!;
  for (const { block } of finalBlocks) {
    const shortestIndex = targetCols.reduce(
      (minIndex, col, i, arr) =>
        col.length < arr[minIndex].length ? i : minIndex,
      0
    );
    targetCols[shortestIndex].push({
      ...block,
      section_id: targetSection.section_id,
    });
  }

  // Step 4: convert then update
  const updates: Record<string, (prev: Block[][]) => Block[][]> = {};
  for (const [sectionId, newCols] of sectionMutations) {
    updates[sectionId] = () => newCols;
  }

  updateSections(updates);

  if (cloneBlock) {
    toastClonedBlocks(activeBlocksWithPos.length);
  }
}
