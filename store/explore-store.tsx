import { create } from "zustand";
import { BoardWithStats, SectionWithStats } from "@/types/stat-types";
import { getUserBoardsWithStats } from "@/lib/db-actions/explore/get-user-board-with-stats";
import fetchMudkits from "@/lib/db-actions/explore/get-mudkits";
import { Section } from "@/types/board-types";
import { Block } from "@/types/block-types";

type ExploreStore = {
  userBoards: BoardWithStats[];
  fetchUserBoards: (userId: string) => Promise<void>;

  allMudkits: SectionWithStats[];
  fetchMudkits: (userId: string) => Promise<void>;

  selectedSection: Section | null;
  setSelectedSection: (section: Section) => void;
  sectionColumns: Block[][]; // source of truth
  setSectionColumns: (cols: Block[][]) => void;

  getBlocks: (id: string[]) => Block[];

  reset: () => void;
};

export const useExploreStore = create<ExploreStore>((set, get) => ({
  userBoards: [],
  fetchUserBoards: async (userId: string) => {
    const boards = await getUserBoardsWithStats(userId);
    set({ userBoards: boards });
  },

  allMudkits: [],
  fetchMudkits: async () => {
    const mudkits = await fetchMudkits();
    set({ allMudkits: mudkits });
  },

  selectedSection: null,
  setSelectedSection: (section: Section | null) =>
    set({ selectedSection: section }),
  sectionColumns: [],
  setSectionColumns: (cols: Block[][]) => set({ sectionColumns: cols }),

  getBlocks: (ids: string[]) => {
    const { sectionColumns } = get();
    const foundBlocks: Block[] = [];

    const idSet = new Set(ids);
    for (const column of sectionColumns) {
      for (const block of column) {
        if (idSet.has(block.block_id)) {
          foundBlocks.push(block);
          idSet.delete(block.block_id); // optional: short-circuit if all found
          if (idSet.size === 0) break;
        }
      }
      if (idSet.size === 0) break;
    }

    return foundBlocks;
  },

  reset: () => set({ userBoards: [] }),
}));
