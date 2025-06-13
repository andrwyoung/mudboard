import { useLayoutStore } from "@/store/layout-store";
import { PositionedBlock } from "@/types/sync-types";

export function putBackBlocks(positionedBlocks: PositionedBlock[]) {
  useLayoutStore.setState((state) => {
    const newColumns = { ...state.sectionColumns };

    for (const { block, sectionId, colIndex, rowIndex } of positionedBlocks) {
      const cols = newColumns[sectionId];
      if (!cols) continue;

      const updatedCol = [...cols[colIndex]];
      updatedCol.splice(rowIndex, 0, block);
      cols[colIndex] = updatedCol;
    }

    return {
      sectionColumns: newColumns,
      layoutDirty: true,
    };
  });
}
