import { create } from "zustand";
import { useMetadataStore } from "./metadata-store";
import { useUIStore } from "./ui-store";
import { syncOrderToSupabase } from "@/lib/db-actions/sync-order";
import { SectionColumns } from "@/types/board-types";
import { Block } from "@/types/block-types";
import { PositionedBlock } from "@/types/sync-types";
import { generatePositionedBlocks } from "@/lib/ordering/generate-block-positions";

type LayoutStore = {
  // SECTION 1
  sectionColumns: SectionColumns;
  setSectionColumns: (cols: SectionColumns) => void;
  updateColumnsInASection: (
    sectionId: string,
    fn: (prev: Block[][]) => Block[][]
  ) => void;

  // SECTION 2

  positionedBlockMap: Map<string, PositionedBlock>;
  masterBlockOrder: PositionedBlock[];
  regenerateLayout: (
    sidebarWidth: number,
    windowWidth: number,
    spacingSize: number
  ) => void;

  getBlockPosition: (blockId: string) => PositionedBlock | undefined;
  getNextImage: (currentId: string) => PositionedBlock | null;
  getPrevImage: (currentId: string) => PositionedBlock | null;

  // SECTION 3

  layoutDirty: boolean;
  setLayoutDirty: (d: boolean) => void;

  syncLayout: () => Promise<boolean>;
  clearAll: () => void;
};

export const useLayoutStore = create<LayoutStore>((set, get) => ({
  // SECTION: the columns themselves

  sectionColumns: {},
  setSectionColumns: (cols: SectionColumns) => set({ sectionColumns: cols }),
  updateColumnsInASection: (sectionId, fn) => {
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

  // SECTION: figuring out positions
  //
  //

  positionedBlockMap: new Map(),
  masterBlockOrder: [],
  regenerateLayout: (
    sidebarWidth: number,
    windowWidth: number,
    spacingSize: number
  ) => {
    console.log("regenerating layout");
    const columns = get().sectionColumns;
    const { orderedBlocks, positionedBlockMap } = generatePositionedBlocks(
      columns,
      sidebarWidth,
      windowWidth,
      spacingSize
    );

    set({
      positionedBlockMap,
      masterBlockOrder: orderedBlocks,
    });
  },

  getBlockPosition: (blockId) => get().positionedBlockMap.get(blockId),
  //  regenerateSectionLayout: (sectionId: string) => {const columns = get().sectionColumns;
  //   generatePositionedBlocks(columns)},

  getNextImage: (currentId) => {
    const flat = get().masterBlockOrder;
    const currentIndex = flat.findIndex((b) => b.block.block_id === currentId);
    return (
      flat
        .slice(currentIndex + 1)
        .find((b) => b.block.block_type === "image") ?? null
    );
  },
  getPrevImage: (currentId) => {
    const flat = get().masterBlockOrder;
    const currentIndex = flat.findIndex((b) => b.block.block_id === currentId);
    return (
      [...flat.slice(0, currentIndex)]
        .reverse()
        .find((b) => b.block.block_type === "image") ?? null
    );
  },

  // SECTION: sycing to database
  //
  //

  layoutDirty: false,
  setLayoutDirty: (d) => set({ layoutDirty: d }),

  syncLayout: async () => {
    const { layoutDirty } = get();
    const boardId = useMetadataStore.getState().board?.board_id;

    if (layoutDirty && boardId) {
      const flat = get().masterBlockOrder;
      const success = await syncOrderToSupabase(flat, boardId);
      if (success) {
        set({ layoutDirty: false });
      }
      console.log("Syncing success?? ", success);
      return success;
    }
    return true;
  },

  clearAll: () =>
    set({
      sectionColumns: {},
    }),
}));
