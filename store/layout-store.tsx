import { create } from "zustand";
import { useMetadataStore } from "./metadata-store";
import { useUIStore } from "./ui-store";
import { syncOrderToSupabase } from "@/lib/db-actions/sync-order";
import { SectionColumns } from "@/types/board-types";
import { Block } from "@/types/block-types";
import { toast } from "sonner";
import { PositionedBlock } from "@/types/sync-types";
import { generatePositionedBlocks } from "@/lib/ordering/generate-block-positions";

type LayoutStore = {
  sectionColumns: SectionColumns;
  setSectionColumns: (cols: SectionColumns) => void;
  updateColumnsInASection: (
    sectionId: string,
    fn: (prev: Block[][]) => Block[][]
  ) => void;

  layoutDirty: boolean;
  setLayoutDirty: (d: boolean) => void;

  prettyMode: boolean;
  setPrettyMode: (d: boolean) => void;

  // SECTION: layout stuff

  positionedBlocksBySection: Record<string, PositionedBlock[]>;
  regenerateLayout: (
    sectionColumns: SectionColumns,
    spacingSize: number
  ) => void;
  // regenerateSectionLayout: (sectionId: string) => void;

  positionedBlockMap: Map<string, PositionedBlock>;
  getBlockPosition: (blockId: string) => PositionedBlock | undefined;

  getOrderedFlatList: () => PositionedBlock[];
  getNextBlock: (currentId: string) => PositionedBlock | null;
  getPrevBlock: (currentId: string) => PositionedBlock | null;

  syncLayout: () => Promise<boolean>;
};

export const useLayoutStore = create<LayoutStore>((set, get) => ({
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

  layoutDirty: false,
  setLayoutDirty: (d) => set({ layoutDirty: d }),

  prettyMode: true,
  setPrettyMode: (d) => set({ prettyMode: d }),

  positionedBlocksBySection: {},
  regenerateLayout: (sectionColumns: SectionColumns, spacingSize: number) => {
    const columns = get().sectionColumns;
    const { positionedBlocksBySection, positionedBlockMap } =
      generatePositionedBlocks(columns, spacingSize);
    set({ positionedBlocksBySection, positionedBlockMap });
  },

  positionedBlockMap: new Map(),
  getBlockPosition: (blockId) => get().positionedBlockMap.get(blockId),
  //  regenerateSectionLayout: (sectionId: string) => {const columns = get().sectionColumns;
  //   generatePositionedBlocks(columns)},
  getOrderedFlatList: () => {
    const all = Object.values(get().positionedBlocksBySection);
    return all.flat().sort((a, b) => a.orderIndex - b.orderIndex);
  },
  getNextBlock: (currentId) => {
    const flat = get().getOrderedFlatList();
    const index = flat.findIndex((b) => b.block.block_id === currentId);
    return flat[index + 1] ?? null;
  },
  getPrevBlock: (currentId) => {
    const flat = get().getOrderedFlatList();
    const index = flat.findIndex((b) => b.block.block_id === currentId);
    return flat[index - 1] ?? null;
  },

  syncLayout: async () => {
    const { layoutDirty } = get();
    const boardId = useMetadataStore.getState().board?.board_id;

    if (layoutDirty && boardId) {
      const flat = get().getOrderedFlatList();
      const success = await syncOrderToSupabase(flat, boardId);
      if (success) {
        set({ layoutDirty: false });
      }
      console.log("Syncing success?? ", success);
      return success;
    }
    return true;
  },
}));
