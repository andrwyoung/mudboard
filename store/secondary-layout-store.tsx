import { Section } from "@/types/board-types";
import { Block } from "@/types/block-types";
import { DEFAULT_COLUMNS, MOBILE_COLUMN_NUMBER } from "@/types/constants";
import { PositionedBlock } from "@/types/sync-types";
import { create } from "zustand";
import { useMeasureStore, useUIStore } from "./ui-store";
import { generateColumnsFromBlockLayout } from "@/lib/columns/generate-columns";
import { generatePositionedBlocks } from "./layout-core/positioning/generate-block-positions";
import { SectionWithStats } from "@/types/stat-types";

type SecondaryLayoutStore = {
  selectedSection: SectionWithStats | null;
  setSelectedSection: (section: SectionWithStats) => void;

  columns: Block[][]; // source of truth
  setColumns: (cols: Block[][]) => void;
  regenerateColumns: () => void;

  visualColumnNum: number;
  setVisualColumnNum: (colNum: number) => void;
  positionedBlockMap: Map<string, PositionedBlock>; // derived position map
  masterBlockOrder: PositionedBlock[]; // derived order
  regenerateOrder: () => void;

  getBlockPosition: (blockId: string) => PositionedBlock | undefined;

  getBlocks: (id: string[]) => Block[];

  reset: () => void;
};

export const useSecondaryLayoutStore = create<SecondaryLayoutStore>(
  (set, get) => ({
    selectedSection: null,
    setSelectedSection: (section: SectionWithStats | null) =>
      set({ selectedSection: section }),

    columns: [],
    setColumns: (cols: Block[][]) => set({ columns: cols }),
    regenerateColumns: () => {
      const currentColumns = get().columns;
      const blocksInSection = currentColumns?.flat() ?? [];

      const trueNumCols = useUIStore.getState().forceMobileColumns
        ? MOBILE_COLUMN_NUMBER
        : get().visualColumnNum;

      const useExplicitPositioning =
        trueNumCols === get().selectedSection?.saved_column_num;

      const newCols = generateColumnsFromBlockLayout(
        blocksInSection,
        trueNumCols,
        useExplicitPositioning
      );

      set({ columns: newCols });
    },

    visualColumnNum: DEFAULT_COLUMNS,
    setVisualColumnNum: (colNum: number) => set({ visualColumnNum: colNum }),
    positionedBlockMap: new Map(),
    masterBlockOrder: [],
    regenerateOrder: () => {
      console.log("regenerating layout");

      const { sidebarWidth, windowWidth } = useMeasureStore.getState();
      const spacingSize = useUIStore.getState().spacingSize;

      const sectionId = get().selectedSection?.section_id ?? "__FAKE_ID__";

      const { orderedBlocks, positionedBlockMap } = generatePositionedBlocks(
        { [sectionId]: get().columns },
        [sectionId],
        sidebarWidth,
        windowWidth,
        spacingSize
      );

      set({
        positionedBlockMap,
        masterBlockOrder: orderedBlocks,
      });
    },

    getBlockPosition: (blockId) => {
      return get().positionedBlockMap.get(blockId);
    },

    getBlocks: (ids: string[]) => {
      const map = get().positionedBlockMap;
      return ids
        .map((id) => map.get(id)?.block)
        .filter((block): block is Block => !!block);
    },

    reset: () =>
      set({
        selectedSection: null,
        columns: [],
        visualColumnNum: DEFAULT_COLUMNS,
        positionedBlockMap: new Map(),
        masterBlockOrder: [],
      }),
  })
);
