import { create } from "zustand";
import {
  BoardWithStats,
  SectionWithStats,
  SectionWithStatsAndBoardInfo,
} from "@/types/stat-types";
import { fetchUserBoardsWithStats } from "@/lib/db-actions/explore/fetch-user-board-with-stats";
import fetchMudkits from "@/lib/db-actions/explore/fetch-mudkits";
import { useMetadataStore } from "./metadata-store";
import fetchGroupedSections from "@/lib/db-actions/explore/fetch-grouped-sections";

export type ExploreMode = "search" | "focus";
export type MudkitType = "mine" | "others" | "temp";

type GroupedBoardInfo = {
  boardId: string;
  title?: string | null;
  section_count: number;
  mudkit_count: number;
};

type ExploreStore = {
  exploreMode: ExploreMode;
  setExploreMode: (mode: ExploreMode) => void;

  currentSelectedMudkitType: MudkitType | null;
  setCurrentSelectedMudkitType: (type: MudkitType | null) => void;

  // unused
  userBoards: BoardWithStats[];
  fetchUserBoards: (userId: string) => Promise<void>;

  userMudkits: SectionWithStats[];
  otherMudkits: SectionWithStats[];

  groupedUserSections: [GroupedBoardInfo, SectionWithStats[]][];

  fetchMudkits: (userId?: string) => Promise<void>;
  fetchAndGroupUserBoards: (userId: string) => Promise<void>;

  setUserMudkits: (kits: SectionWithStats[]) => void;

  tempMudkits: SectionWithStats[];
  setTempMudkits: (kits: SectionWithStats[]) => void;

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
    const boards = await fetchUserBoardsWithStats(userId);
    set({ userBoards: boards });
  },

  userMudkits: [],
  otherMudkits: [],
  groupedUserSections: [],
  fetchMudkits: async (userId?: string) => {
    const { userMudkits } = await fetchMudkits(userId);
    set({ userMudkits });
  },
  fetchAndGroupUserBoards: async (userId: string) => {
    try {
      const currentSectionIds = new Set(
        useMetadataStore
          .getState()
          .boardSections.map((bs) => bs.section.section_id)
      );

      const fetched = await fetchGroupedSections(userId); // new fetch

      const groupedMap = new Map<
        string,
        { title: string | null; sections: SectionWithStatsAndBoardInfo[] }
      >();

      for (const row of fetched) {
        if (currentSectionIds.has(row.section_id)) continue;

        const existing = groupedMap.get(row.board_id);
        if (existing) {
          existing.sections.push(row);
        } else {
          groupedMap.set(row.board_id, {
            title: row.board_title ?? null,
            sections: [row],
          });
        }
      }

      const groupedUserSections = Array.from(groupedMap.entries()).map(
        ([boardId, { title, sections }]) =>
          [
            {
              boardId,
              title: title ?? undefined,
              section_count: sections[0].section_count,
              mudkit_count: sections[0].mudkit_count,
            },
            sections.sort((a, b) => a.order_index - b.order_index),
          ] as [
            {
              boardId: string;
              title?: string | null;
              section_count: number;
              mudkit_count: number;
            },
            SectionWithStatsAndBoardInfo[]
          ]
      );

      // Sort by board_created_at using first section as a proxy
      groupedUserSections.sort(([, aSections], [, bSections]) => {
        const aCreated = new Date(aSections[0].board_created_at).getTime();
        const bCreated = new Date(bSections[0].board_created_at).getTime();
        return bCreated - aCreated; // newest boards first
      });

      set({ groupedUserSections });
    } catch (err) {
      console.error("Failed to fetch grouped board sections", err);
    }
  },

  setUserMudkits: (kits: SectionWithStats[]) => set({ userMudkits: kits }),

  tempMudkits: [],
  setTempMudkits: (kits: SectionWithStats[]) => set({ tempMudkits: kits }),

  reset: () =>
    set({
      exploreMode: "search",
      currentSelectedMudkitType: null,

      userBoards: [],
      userMudkits: [],
      otherMudkits: [],
      tempMudkits: [],
    }),
}));
