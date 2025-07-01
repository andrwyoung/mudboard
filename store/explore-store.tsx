import { create } from "zustand";
import { BoardWithStats, SectionWithStats } from "@/types/stat-types";
import { getUserBoardsWithStats } from "@/lib/db-actions/explore/get-user-board-with-stats";
import fetchMudkits from "@/lib/db-actions/explore/get-mudkits";

type ExploreStore = {
  userBoards: BoardWithStats[];
  fetchUserBoards: (userId: string) => Promise<void>;

  allMudkits: SectionWithStats[];
  fetchMudkits: (userId: string) => Promise<void>;

  reset: () => void;
};

export const useExploreStore = create<ExploreStore>((set) => ({
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

  reset: () => set({ userBoards: [] }),
}));
