import { useLayoutStore } from "@/store/layout-store";

export function setVisualNumCols(sectionId: string, newNum: number) {
  useLayoutStore.getState().setVisualNumColsForSection(sectionId, newNum);
  useLayoutStore.getState().regenerateSectionColumns(sectionId);
}
