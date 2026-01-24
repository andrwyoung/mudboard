// KEY SECTION: this is the file that generates and regeneraets block layouts
// positions and syncing
// it's basically the master file for how we are keeping the columns around

// sectionColumns is our source of truth
// we derive masterBlockOrder and positonedBlockMap from that to make it easier for us

// board, sections and user info is kept in metadata-store.tsx

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useMetadataStore } from "./metadata-store";
import { useMeasureStore, useUIStore } from "./ui-store";
import { syncSectionOrderToSupabase } from "@/store/layout-core/sync-order";
import { SectionColumns } from "@/types/board-types";
import { Block, VisualOverride } from "@/types/block-types";
import { PositionedBlock } from "@/types/sync-types";
import { generatePositionedBlocks } from "@/store/layout-core/positioning/generate-block-positions";
import { DEFAULT_COLUMNS, MOBILE_COLUMN_NUMBER } from "@/types/constants";
import { generateColumnsFromBlockLayout } from "@/lib/columns/generate-columns";
import { scheduleGridSync } from "@/lib/syncing/sync-schedulers";
import { getColumnWidth } from "./layout-core/positioning/get-column-width";

type LayoutStore = {
  // SECTION 1
  sectionColumns: SectionColumns; // source of truth
  setSectionColumns: (cols: SectionColumns) => void;
  updateColumnsInASection: (
    sectionId: string,
    fn: (prev: Block[][]) => Block[][]
  ) => void;
  regenerateSectionColumns: (sectionId: string, savedColumnNum: number) => void;
  regenerateAllSections: () => void;

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

  positionedBlockMap: Map<string, PositionedBlock>; // derived. position map blockId -> posBlock
  masterBlockOrder: Record<string, PositionedBlock[]>; // derived. sectionId -> posBlocks[]
  regenerateOrderingInternally: () => void;
  regenerateOrder: (
    sortedSectionIds: { sectionId: string; columnWidth: number }[]
  ) => void;

  getBlockPosition: (blockId: string) => PositionedBlock | undefined;

  // SECTION 3
  // TODO: per section dirty tracking
  layoutDirtyMap: Record<string, boolean>;
  setLayoutDirtyForSection: (sectionId: string) => void;
  isAnyLayoutDirty: () => boolean;

  syncLayout: () => Promise<boolean>;
  clearAll: () => void;
};

export const useLayoutStore = create<LayoutStore>()(
  subscribeWithSelector((set, get) => ({
    sectionColumns: {},
    setSectionColumns: (cols: SectionColumns) => set({ sectionColumns: cols }),
    updateColumnsInASection: (sectionId, fn) => {
      set((state) => {
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
        };
      });

      get().setLayoutDirtyForSection(sectionId);
    },
    regenerateSectionColumns: (sectionId: string, savedColumnNum: number) => {
      const currentColumns = get().sectionColumns[sectionId];
      const blocksInSection = currentColumns?.flat() ?? [];

      console.log("regenerating section");
      const trueNumCols = useUIStore.getState().isMobile
        ? MOBILE_COLUMN_NUMBER
        : get().getVisualNumColsForSection(sectionId);

      const useExplicitPositioning = trueNumCols === savedColumnNum;

      const newCols = generateColumnsFromBlockLayout(
        blocksInSection,
        trueNumCols,
        useExplicitPositioning
      );

      // get().setLayoutDirtyForSection(sectionId);
      set((state) => ({
        sectionColumns: {
          ...state.sectionColumns,
          [sectionId]: newCols,
        },
      }));
    },
    regenerateAllSections: () => {
      const { sectionColumns, regenerateSectionColumns } = get();
      for (const sectionId of Object.keys(sectionColumns)) {
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

        regenerateSectionColumns(sectionId, section.saved_column_num);
      }
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
        console.warn(`Missing visualNumColsMap entry for section ${sectionId}`);
        return DEFAULT_COLUMNS;
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
    masterBlockOrder: {},
    regenerateOrderingInternally: () => {
      const canvasWidth = useMeasureStore.getState().canvasWidth;
      const spacingSize = useUIStore.getState().spacingSize;
      const galleryPadding = useUIStore.getState().gallerySpacingSize;

      const boardSections = useMetadataStore.getState().boardSections;

      const sectionIdWithWidths = boardSections.map((bs) => {
        const sectionId = bs.section.section_id;
        const numCols = useLayoutStore
          .getState()
          .getVisualNumColsForSection(sectionId);

        const columnWidth = getColumnWidth(
          canvasWidth,
          spacingSize,
          numCols,
          galleryPadding
        );

        return {
          sectionId,
          columnWidth,
        };
      });
      get().regenerateOrder(sectionIdWithWidths);
    },
    regenerateOrder: (
      sortedSectionIds: { sectionId: string; columnWidth: number }[]
    ) => {
      console.log("regenerating layout");

      const { sectionColumns: columns } = get();
      const spacingSize = useUIStore.getState().spacingSize;

      const { orderedBlocks, positionedBlockMap } = generatePositionedBlocks(
        columns,
        sortedSectionIds,
        spacingSize
      );

      set({
        positionedBlockMap,
        masterBlockOrder: orderedBlocks,
      });
    },

    getBlockPosition: (blockId) => get().positionedBlockMap.get(blockId),

    // SECTION: sycing to database
    //
    //

    layoutDirtyMap: {},
    setLayoutDirtyForSection: (sectionId: string) =>
      set((state) => {
        scheduleGridSync(); // schedule sync
        return {
          layoutDirtyMap: {
            ...state.layoutDirtyMap,
            [sectionId]: true,
          },
        };
      }),
    isAnyLayoutDirty: () => {
      return Object.values(get().layoutDirtyMap).some((v) => v === true);
    },

    syncLayout: async () => {
      const layoutDirtyMap = get().layoutDirtyMap;
      const dirtySectionIds = Object.keys(layoutDirtyMap);
      const boardId = useMetadataStore.getState().board?.board_id;

      if (!boardId || dirtySectionIds.length === 0) return true;
      const blockOrders = get().masterBlockOrder;
      const updatedLayoutDirtyMap = { ...layoutDirtyMap };

      let allSucceeded = true;

      for (const sectionId of dirtySectionIds) {
        const success = await syncSectionOrderToSupabase(
          sectionId,
          blockOrders[sectionId]
        );

        if (success) {
          delete updatedLayoutDirtyMap[sectionId];
        } else {
          allSucceeded = false;
        }
      }

      set({ layoutDirtyMap: updatedLayoutDirtyMap });

      console.log(
        `Syncing ${dirtySectionIds.length} sections. Success: `,
        allSucceeded
      );
      return allSucceeded;
    },

    clearAll: () =>
      set({
        sectionColumns: {},
        positionedBlockMap: new Map(),
        masterBlockOrder: {},
        visualOverridesMap: new Map(),
        visualNumColsMap: {},
      }),
  }))
);
