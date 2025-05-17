import { useLayoutStore } from "@/store/layout-store";
import { useUIStore } from "@/store/ui-store";

export function initializeSectionColumns(sectionId: string) {
  useLayoutStore.setState((s) => ({
    sectionColumns: {
      ...s.sectionColumns,
      [sectionId]: Array.from(
        { length: useUIStore.getState().numCols },
        () => []
      ),
    },
  }));
}
