// here is where we keep info about the board, sections and user
// the blocks and columns (the more important stuff) are kept in layout-store.tsx

import { Board, Section } from "@/types/board-types";
import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/types/supabase";

export type UserProfile = Tables<"users">;

type MetadataStore = {
  board: Board | null;
  setBoard: (board: Board) => void;

  user: User | null | undefined;
  setUser: (user: User | null) => void;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;

  sections: Section[];
  setSections: (section: Section[]) => void;

  clearAll: () => void;
};

export const useMetadataStore = create<MetadataStore>((set, get) => ({
  board: null,
  setBoard: (board: Board) => set({ board }),

  user: undefined,
  setUser: (user) => set({ user }),
  profile: null,
  setProfile: (profile) => set({ profile }),

  sections: [] as Section[],
  setSections: (sections: Section[]) => set({ sections }),

  clearAll: () => set({ sections: [] as Section[], board: null }),
}));
