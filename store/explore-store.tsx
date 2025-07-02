import { create } from "zustand";
import { BoardWithStats, SectionWithStats } from "@/types/stat-types";
import { getUserBoardsWithStats } from "@/lib/db-actions/explore/get-user-board-with-stats";
import fetchMudkits from "@/lib/db-actions/explore/get-mudkits";

export type ExploreMode = "search" | "focus";
export type MudkitType = "mine" | "others";

type ExploreStore = {
  exploreMode: ExploreMode;
  setExploreMode: (mode: ExploreMode) => void;

  currentSelectedMudkitType: MudkitType | null;
  setCurrentSelectedMudkitType: (type: MudkitType | null) => void;

  userBoards: BoardWithStats[];
  fetchUserBoards: (userId: string) => Promise<void>;

  userMudkits: SectionWithStats[];
  otherMudkits: SectionWithStats[];
  fetchMudkits: (userId?: string) => Promise<void>;

  reset: () => void;
};

export const useExploreStore = create<ExploreStore>((set) => ({
  exploreMode: "search",
  setExploreMode: (mode: ExploreMode) => set({ exploreMode: mode }),

  currentSelectedMudkitType: null,
  setCurrentSelectedMudkitType: (type: MudkitType | null) =>
    set({ currentSelectedMudkitType: type }),

  userBoards: [],
  fetchUserBoards: async (userId: string) => {
    const boards = await getUserBoardsWithStats(userId);
    set({ userBoards: boards });
  },

  userMudkits: [],
  otherMudkits: [],
  fetchMudkits: async (userId?: string) => {
    const { userMudkits, otherMudkits } = await fetchMudkits(userId);
    set({ userMudkits, otherMudkits });
  },

  reset: () =>
    set({
      userBoards: [],
      userMudkits: [],
      otherMudkits: [],
    }),
}));
