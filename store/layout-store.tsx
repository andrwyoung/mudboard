// KEY SECTION: this is the file that generates and regeneraets block layouts
// positions and syncing
// it's basically the master file for how we are keeping the columns around

// board, sections and user info is kept in metadata-store.tsx

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useMetadataStore } from "./metadata-store";
import { useUIStore } from "./ui-store";
import { syncOrderToSupabase } from "@/lib/db-actions/sync-order";
import { SectionColumns } from "@/types/board-types";
import { Block } from "@/types/block-types";
import { PositionedBlock } from "@/types/sync-types";
import { generatePositionedBlocks } from "@/lib/ordering/generate-block-positions";
import { DEFAULT_COLUMNS } from "@/types/constants";

type LayoutStore = {
  // SECTION 1
  sectionColumns: SectionColumns;
  setSectionColumns: (cols: SectionColumns) => void;
  updateColumnsInASection: (
    sectionId: string,
    fn: (prev: Block[][]) => Block[][]
  ) => void;
  regenerateSectionColumns: (sectionId: string) => void;

  // SECTION 2

  positionedBlockMap: Map<string, PositionedBlock>;
  masterBlockOrder: PositionedBlock[];
  regenerateOrdering: () => void;

  getBlockPosition: (blockId: string) => PositionedBlock | undefined;
  getNextImage: (currentId: string) => PositionedBlock | null;
  getPrevImage: (currentId: string) => PositionedBlock | null;

  // SECTION 3. measuring
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  windowWidth: number;
  setWindowWidth: (width: number) => void;

  // SECTION 4

  layoutDirty: boolean;
  setLayoutDirty: (d: boolean) => void;

  syncLayout: () => Promise<boolean>;
  clearAll: () => void;
};

export const useLayoutStore = create<LayoutStore>()(
  subscribeWithSelector((set, get) => ({
    // SECTION: the columns themselves

    sectionColumns: {},
    setSectionColumns: (cols: SectionColumns) => set({ sectionColumns: cols }),
    updateColumnsInASection: (sectionId, fn) => {
      set((state) => {
        // these 2 variables are used to generate a fall back
        // in case sectionColumns[sectionId] doesn't exist
        const boardSections = useMetadataStore.getState().boardSections;
        const savedNumCols =
          boardSections.find((bs) => bs.section.section_id === sectionId)
            ?.section.saved_column_num ?? DEFAULT_COLUMNS;

        const current =
          state.sectionColumns[sectionId] ??
          Array.from({ length: savedNumCols }, () => []);
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
    regenerateSectionColumns: (sectionId: string) => {
      const masterBlockOrder = get().masterBlockOrder;
      const boardSections = useMetadataStore.getState().boardSections;
      const blocksInSection = masterBlockOrder
        .filter((b) => b.block.section_id === sectionId)
        .map((b) => b.block);

      const savedColNum =
        boardSections.find((bs) => bs.section.section_id === sectionId)?.section
          .saved_column_num ?? DEFAULT_COLUMNS;

      const newCols: Block[][] = Array.from({ length: savedColNum }, () => []);
      blocksInSection.forEach((block, i) => {
        newCols[i % savedColNum].push(block);
      });

      set((state) => ({
        sectionColumns: {
          ...state.sectionColumns,
          [sectionId]: newCols,
        },
        layoutDirty: true,
      }));
    },

    // SECTION: figuring out positions
    //
    //

    positionedBlockMap: new Map(),
    masterBlockOrder: [],
    regenerateOrdering: () => {
      console.log("regenerating layout");
      const { sectionColumns: columns, sidebarWidth, windowWidth } = get();
      const spacingSize = useUIStore.getState().spacingSize;

      const boardSections = useMetadataStore.getState().boardSections;
      const sectionOrder = boardSections
        .slice() // avoid mutating original
        .sort((a, b) => a.order_index - b.order_index)
        .map((bs) => ({
          sectionId: bs.section.section_id,
          order_index: bs.order_index,
        }));

      const { orderedBlocks, positionedBlockMap } = generatePositionedBlocks(
        columns,
        sectionOrder,
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
      const currentIndex = flat.findIndex(
        (b) => b.block.block_id === currentId
      );
      return (
        flat
          .slice(currentIndex + 1)
          .find((b) => b.block.block_type === "image") ?? null
      );
    },
    getPrevImage: (currentId) => {
      const flat = get().masterBlockOrder;
      const currentIndex = flat.findIndex(
        (b) => b.block.block_id === currentId
      );
      return (
        [...flat.slice(0, currentIndex)]
          .reverse()
          .find((b) => b.block.block_type === "image") ?? null
      );
    },

    // SECTION: measuring
    sidebarWidth: 0,
    setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
    windowWidth: 0,
    setWindowWidth: (width: number) => set({ windowWidth: width }),

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
        const success = await syncOrderToSupabase(flat);
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
        positionedBlockMap: new Map(),
        masterBlockOrder: [],
      }),
  }))
);
