import { create } from "zustand";
import { BoardWithStats, SectionWithStats } from "@/types/stat-types";
import { getUserBoardsWithStats } from "@/lib/db-actions/explore/get-user-board-with-stats";
import fetchMudkits from "@/lib/db-actions/explore/get-mudkits";
import { Section, SectionColumns } from "@/types/board-types";
import { Block } from "@/types/block-types";

type ExploreStore = {
  userBoards: BoardWithStats[];
  fetchUserBoards: (userId: string) => Promise<void>;

  userMudkits: SectionWithStats[];
  otherMudkits: SectionWithStats[];
  fetchMudkits: (userId: string) => Promise<void>;

  selectedSection: Section | null;
  setSelectedSection: (section: Section) => void;
  sectionColumns: Block[][]; // source of truth
  setSectionColumns: (cols: Block[][]) => void;

  reset: () => void;
};

export const useExploreStore = create<ExploreStore>((set, get) => ({
  userBoards: [],
  fetchUserBoards: async (userId: string) => {
    const boards = await getUserBoardsWithStats(userId);
    set({ userBoards: boards });
  },

  userMudkits: [],
  otherMudkits: [],
  fetchMudkits: async (userId: string) => {
    const mudkits = await fetchMudkits();

    const userMudkits: SectionWithStats[] = [];
    const otherMudkits: SectionWithStats[] = [];

    for (const kit of mudkits) {
      if (kit.owned_by === userId) {
        userMudkits.push(kit);
      } else {
        otherMudkits.push(kit);
      }
    }

    set({ userMudkits, otherMudkits });
  },

  selectedSection: null,
  setSelectedSection: (section: Section | null) =>
    set({ selectedSection: section }),
  sectionColumns: [],
  setSectionColumns: (cols: Block[][]) => set({ sectionColumns: cols }),

  reset: () => set({ userBoards: [] }),
}));
