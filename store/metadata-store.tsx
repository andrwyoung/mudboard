// here is where we keep info about the board, sections and user
// the blocks and columns (the more important stuff) are kept in layout-store.tsx

import { Board, BoardSection } from "@/types/board-types";
import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/types/supabase";
import { SetStateAction } from "react";

export type UserProfile = Tables<"users">;

export const sectionRefs: React.RefObject<
  Record<string, HTMLDivElement | null>
> = {
  current: {},
};

type MetadataStore = {
  board: Board | null;
  setBoard: (board: Board) => void;

  user: User | null | undefined;
  setUser: (user: User | null) => void;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;

  boardSections: BoardSection[];
  setBoardSections: (bs: SetStateAction<BoardSection[]>) => void;
  updateBoardSection: (
    sectionId: string,
    updates: Partial<BoardSection["section"]>
  ) => void;

  boardSectionMap: Record<string, BoardSection>; // section_id -> boardSection
  regenerateBoardSectionMap: () => void;

  clearAll: () => void;
};

export const useMetadataStore = create<MetadataStore>((set, get) => ({
  board: null,
  setBoard: (board: Board) => set({ board }),

  user: undefined,
  setUser: (user) => set({ user }),
  profile: null,
  setProfile: (profile) => set({ profile }),

  boardSections: [] as BoardSection[],
  setBoardSections: (action) => {
    set((state) => {
      const boardSections =
        typeof action === "function" ? action(state.boardSections) : action;
      return { boardSections };
    });
    get().regenerateBoardSectionMap();
  },
  updateBoardSection: (
    sectionId: string,
    updates: Partial<BoardSection["section"]>
  ) => {
    const { boardSections } = get();

    const newBoardSections = boardSections.map((bs) =>
      bs.section.section_id === sectionId
        ? {
            ...bs,
            section: {
              ...bs.section,
              ...updates,
            },
          }
        : bs
    );

    set({ boardSections: newBoardSections });
    get().regenerateBoardSectionMap();
  },

  boardSectionMap: {},
  regenerateBoardSectionMap: () => {
    const boardSections = get().boardSections;
    const boardSectionMap: Record<string, BoardSection> = {};
    for (const bs of boardSections) {
      boardSectionMap[bs.section.section_id] = bs;
    }

    set({ boardSectionMap });
  },

  clearAll: () => set({ boardSections: [] as BoardSection[], board: null }),
}));
