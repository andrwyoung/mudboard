import { useLayoutStore } from "@/store/layout-store";
import { PositionedBlock } from "@/types/sync-types";

export function commitToSectionColumns(
  sectionId: string,
  positionedBlocks: PositionedBlock[]
) {
  const layoutStore = useLayoutStore.getState();

  layoutStore.updateColumnsInASection(sectionId, (prevCols) => {
    const newCols = [...prevCols.map((col) => [...col])]; // shallow clone

    for (const { block, colIndex, rowIndex, orderIndex } of positionedBlocks) {
      const target = newCols[colIndex]?.[rowIndex];
      if (target?.block_id === block.block_id) {
        newCols[colIndex][rowIndex] = {
          ...target,
          saved_col_index: colIndex,
          saved_row_index: rowIndex,
          saved_order_index: orderIndex, // idk if this matters
        };
      }
    }

    return newCols;
  });
}
