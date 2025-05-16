import { useLayoutStore } from "@/store/layout-store";
import { Block } from "@/types/block-types";
import { SectionColumns } from "@/types/board-types";

export function useColumnUpdater(
  setter: React.Dispatch<React.SetStateAction<SectionColumns>>
) {
  return (sectionId: string, fn: (prev: Block[][]) => Block[][]) => {
    useLayoutStore.getState().setLayoutDirty(true);

    setter((prev) => ({
      ...prev,
      [sectionId]: fn(prev[sectionId] ?? [[]]),
    }));
  };
}
