import { useLayoutStore } from "@/store/layout-store";
import { useSecondaryLayoutStore } from "@/store/secondary-layout-store";
import { CanvasScope } from "@/types/board-types";

export function setVisualNumCols(
  sectionId: string,
  savedColumnNum: number,
  newNum: number,
  scope: CanvasScope
) {
  if (scope === "mirror") {
    useSecondaryLayoutStore.getState().setVisualColumnNum(newNum);
    useSecondaryLayoutStore.getState().regenerateColumns();
  } else {
    useLayoutStore.getState().setVisualNumColsForSection(sectionId, newNum);
    useLayoutStore
      .getState()
      .regenerateSectionColumns(sectionId, savedColumnNum);
  }
}
