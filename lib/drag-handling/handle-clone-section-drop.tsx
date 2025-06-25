import { Block } from "@/types/block-types";
import { Section, SectionColumns } from "@/types/board-types";
import { cloneBlocks } from "../db-actions/cloning/clone-blocks";
import { toastClonedBlocks } from "@/utils/toast-clone-blocks";

export async function cloneBlocksToSection({
  blocks,
  targetSection,
  sectionColumns,
  updateSections,
}: {
  blocks: Block[];
  targetSection: Section;
  sectionColumns: SectionColumns;
  updateSections: (
    updates: Record<string, (prev: Block[][]) => Block[][]>
  ) => void;
}) {
  const blockIdMap = await cloneBlocks(blocks, targetSection.section_id);

  const clonedBlocks: Block[] = blocks.map((b) => ({
    ...b,
    block_id: blockIdMap[b.block_id],
    section_id: targetSection.section_id,
  }));

  const targetCols = [
    ...sectionColumns[targetSection.section_id].map((col) => [...col]),
  ];

  for (const block of clonedBlocks) {
    const shortest = targetCols.reduce(
      (min, col, i, arr) => (col.length < arr[min].length ? i : min),
      0
    );
    targetCols[shortest].push(block);
  }

  updateSections({
    [targetSection.section_id]: () => targetCols,
  });

  toastClonedBlocks(blocks.length);
}
