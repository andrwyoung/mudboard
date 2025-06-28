// LOCAL only

// update the positions and block order locally
// (only used by sync-order.tsx)

import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";
import { PositionedBlock } from "@/types/sync-types";
import { shouldSyncSectionLayout } from "../columns/should-sync-indexes";
import { Section } from "@/types/board-types";

export function commitToSectionColumns(
  positionedBlocks: PositionedBlock[],
  forceMobileColumns: boolean
) {
  const sectionMap = useMetadataStore
    .getState()
    .boardSections.reduce((acc, bs) => {
      acc[bs.section.section_id] = bs.section;
      return acc;
    }, {} as Record<string, Section>);

  const layoutStore = useLayoutStore.getState();

  const groupedBySection = new Map<string, PositionedBlock[]>();
  for (const pb of positionedBlocks) {
    const sid = pb.block.section_id;
    if (!groupedBySection.has(sid)) groupedBySection.set(sid, []);
    groupedBySection.get(sid)!.push(pb);
  }

  for (const [sectionId, blocks] of groupedBySection.entries()) {
    const section = sectionMap[sectionId];
    const shouldCommit = shouldSyncSectionLayout(section, forceMobileColumns);
    if (!shouldCommit) continue;

    layoutStore.updateColumnsInASection(sectionId, (prevCols) => {
      const newCols = [...prevCols.map((col) => [...col])]; // shallow clone

      for (const { block, colIndex, rowIndex } of blocks) {
        const target = newCols[colIndex]?.[rowIndex];
        if (target?.block_id === block.block_id) {
          newCols[colIndex][rowIndex] = {
            ...target,
            saved_col_index: colIndex,
            saved_row_index: rowIndex,
          };
        }
      }

      return newCols;
    });
  }
}
