// KEY SECTION: this is the file that generates and regeneraets block layouts
// positions and syncing
// it's basically the master file for how we are keeping the columns around

// sectionColumns is our source of truth
// we derive masterBlockOrder and positonedBlockMap from that to make it easier for us

// board, sections and user info is kept in metadata-store.tsx

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useMetadataStore } from "./metadata-store";
import { useUIStore } from "./ui-store";
import { syncOrderToSupabase } from "@/store/layout-core/sync-order";
import { SectionColumns } from "@/types/board-types";
import { Block, VisualOverride } from "@/types/block-types";
import { PositionedBlock } from "@/types/sync-types";
import { generatePositionedBlocks } from "@/store/layout-core/positioning/generate-block-positions";
import { DEFAULT_COLUMNS, MOBILE_COLUMN_NUMBER } from "@/types/constants";
import { generateColumnsFromBlockLayout } from "@/lib/columns/generate-columns";

type LayoutStore = {
  // SECTION 1
  sectionColumns: SectionColumns; // source of truth
  setSectionColumns: (cols: SectionColumns) => void;
  updateColumnsInASection: (
    sectionId: string,
    fn: (prev: Block[][]) => Block[][]
  ) => void;
  regenerateSectionColumns: (sectionId: string) => void;
  regenerateAllSections: () => void;

  forceMobileColumns: boolean;
  toggleMobileColumns: () => void;

  visualNumColsMap: Record<string, number>;
  setVisualNumColsMap: (map: Record<string, number>) => void;
  setVisualNumColsForSection: (sectionId: string, numCols: number) => void;
  getVisualNumColsForSection: (sectionId: string) => number;

  visualOverridesMap: Map<string, VisualOverride>;
  setVisualOverride: (
    blockId: string,
    overrides: Partial<VisualOverride>
  ) => void;
  clearVisualOverride: (blockId: string) => void;

  // SECTION 2

  positionedBlockMap: Map<string, PositionedBlock>; // derived position map
  masterBlockOrder: PositionedBlock[]; // derived order
  regenerateOrderingInternally: () => void;
  regenerateOrder: (
    orderedSections: {
      sectionId: string;
      order_index: number;
    }[]
  ) => void;

  getBlockPosition: (blockId: string) => PositionedBlock | undefined;
  getNextImage: (currentId: string) => PositionedBlock | null;
  getPrevImage: (currentId: string) => PositionedBlock | null;

  // SECTION 3. measuring
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  windowWidth: number;
  setWindowWidth: (width: number) => void;

  // SECTION 4
  // TODO: per section dirty tracking
  layoutDirty: boolean;
  setLayoutDirty: (d: boolean) => void;

  syncLayout: () => Promise<boolean>;
  clearAll: () => void;
};

export const useLayoutStore = create<LayoutStore>()(
  subscribeWithSelector((set, get) => ({
    sectionColumns: {},
    setSectionColumns: (cols: SectionColumns) => set({ sectionColumns: cols }),
    updateColumnsInASection: (sectionId, fn) => {
      set((state) => {
        // these 2 variables are used to generate a fall back
        // in case sectionColumns[sectionId] doesn't exist
        const boardSections = useMetadataStore.getState().boardSections;
        const savedNumCols =
          get().getVisualNumColsForSection(sectionId) ?? DEFAULT_COLUMNS;

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
      const currentColumns = get().sectionColumns[sectionId];
      const blocksInSection = currentColumns?.flat() ?? [];

      const section = useMetadataStore
        .getState()
        .boardSections.find(
          (bs) => bs.section.section_id === sectionId
        )?.section;

      if (!section) {
        throw new Error(
          `regenerateSectionColumns: No section found with id ${sectionId}`
        );
      }

      const trueNumCols = get().forceMobileColumns
        ? MOBILE_COLUMN_NUMBER
        : get().getVisualNumColsForSection(sectionId);

      const useExplicitPositioning = trueNumCols === section.saved_column_num;

      const newCols = generateColumnsFromBlockLayout(
        blocksInSection,
        trueNumCols,
        useExplicitPositioning
      );

      set((state) => ({
        sectionColumns: {
          ...state.sectionColumns,
          [sectionId]: newCols,
        },
        layoutDirty: true,
      }));
    },
    regenerateAllSections: () => {
      const { sectionColumns, regenerateSectionColumns } = get();
      for (const sectionId of Object.keys(sectionColumns)) {
        regenerateSectionColumns(sectionId);
      }
    },

    forceMobileColumns: false,
    toggleMobileColumns: () => {
      const current = get().forceMobileColumns;
      set({ forceMobileColumns: !current });

      get().regenerateAllSections();
    },

    visualNumColsMap: {},
    setVisualNumColsMap: (map) => set({ visualNumColsMap: map }),
    setVisualNumColsForSection: (sectionId, numCols) =>
      set((state) => ({
        visualNumColsMap: {
          ...state.visualNumColsMap,
          [sectionId]: numCols,
        },
      })),

    getVisualNumColsForSection: (sectionId) => {
      const value = get().visualNumColsMap[sectionId];
      if (value === undefined) {
        throw new Error(
          `Missing visualNumColsMap entry for section ${sectionId}`
        );
      }
      return value;
    },

    visualOverridesMap: new Map<string, VisualOverride>(),
    setVisualOverride: (blockId: string, overrides: Partial<VisualOverride>) =>
      set((state) => {
        const current = state.visualOverridesMap.get(blockId) ?? {};
        const updated = { ...current, ...overrides };
        const newMap = new Map(state.visualOverridesMap);
        newMap.set(blockId, updated);
        return { visualOverridesMap: newMap };
      }),
    clearVisualOverride: (blockId: string) =>
      set((state) => {
        const newMap = new Map(state.visualOverridesMap);
        newMap.delete(blockId);
        return { visualOverridesMap: newMap };
      }),

    // SECTION: figuring out positions
    //
    //

    positionedBlockMap: new Map(),
    masterBlockOrder: [],
    regenerateOrderingInternally: () => {
      const boardSections = useMetadataStore.getState().boardSections;
      const sectionOrder = boardSections
        .slice() // avoid mutating original
        .sort((a, b) => a.order_index - b.order_index)
        .map((bs) => ({
          sectionId: bs.section.section_id,
          order_index: bs.order_index,
        }));

      get().regenerateOrder(sectionOrder);
    },
    regenerateOrder: (
      orderedSections: {
        sectionId: string;
        order_index: number;
      }[]
    ) => {
      console.log("regenerating layout");

      const { sectionColumns: columns, sidebarWidth, windowWidth } = get();
      const spacingSize = useUIStore.getState().spacingSize;

      const { orderedBlocks, positionedBlockMap } = generatePositionedBlocks(
        columns,
        orderedSections,
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
        visualOverridesMap: new Map(),
        visualNumColsMap: {},
      }),
  }))
);
