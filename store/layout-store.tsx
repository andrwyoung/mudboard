import { create } from "zustand";
import { useMetadataStore } from "./metadata-store";
import { useUIStore } from "./ui-store";
import { syncOrderToSupabase } from "@/lib/db-actions/sync-order";
import { SectionColumns } from "@/types/board-types";
import { Block } from "@/types/block-types";
import { toast } from "sonner";

type LayoutStore = {
  sectionColumns: SectionColumns;
  setSectionColumns: (cols: SectionColumns) => void;
  updateSectionColumns: (
    sectionId: string,
    fn: (prev: Block[][]) => Block[][]
  ) => void;

  layoutDirty: boolean;
  setLayoutDirty: (d: boolean) => void;

  showBlurImg: boolean;
  setShowBlurImg: (d: boolean) => void;

  prettyMode: boolean;
  setPrettyMode: (d: boolean) => void;

  syncLayout: () => Promise<boolean>;
};

export const useLayoutStore = create<LayoutStore>((set, get) => ({
  sectionColumns: {},
  setSectionColumns: (cols: SectionColumns) => set({ sectionColumns: cols }),
  updateSectionColumns: (sectionId, fn) => {
    set((state) => {
      const numCols = useUIStore.getState().numCols;
      const current =
        state.sectionColumns[sectionId] ??
        Array.from({ length: numCols }, () => []);
      const updated = fn(current);
      return {
        sectionColumns: {
          ...state.sectionColumns,
          [sectionId]: updated,
        },
        layoutDirty: true,
      };
    });
  },

  layoutDirty: false,
  setLayoutDirty: (d) => set({ layoutDirty: d }),

  showBlurImg: false,
  setShowBlurImg: (d) => set({ showBlurImg: d }),

  prettyMode: true,
  setPrettyMode: (d) => set({ prettyMode: d }),

  syncLayout: async () => {
    const { layoutDirty, sectionColumns } = get();
    const spacingSize = useUIStore.getState().spacingSize;
    const boardId = useMetadataStore.getState().board?.board_id;

    if (layoutDirty && boardId) {
      const success = await syncOrderToSupabase(
        sectionColumns,
        boardId,
        spacingSize
      );
      if (success) {
        set({ layoutDirty: false });
      }
      console.log("Syncing success?? ", success);
      return success;
    }
    return true;
  },
}));
