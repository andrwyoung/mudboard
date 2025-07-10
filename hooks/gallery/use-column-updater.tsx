// DEPRECATED. in favor of layout-store.tsx

// this hook's only job is to setLayoutDirty whenever we change the columns
// it exist because I don't want to have to remember to setLayoutDirty
// whenever I call setColumns, so this hook just simplifies that

import { useLayoutStore } from "@/store/layout-store";
import { Block } from "@/types/block-types";
import { SectionColumns } from "@/types/board-types";

export function useColumnUpdater(
  setter: React.Dispatch<React.SetStateAction<SectionColumns>>
) {
  return (sectionId: string, fn: (prev: Block[][]) => Block[][]) => {
    useLayoutStore.getState().setLayoutDirtyForSection(sectionId);

    setter((prev) => ({
      ...prev,
      [sectionId]: fn(prev[sectionId] ?? [[]]),
    }));
  };
}
