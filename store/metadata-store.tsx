import { Board, Section } from "@/types/board-types";
import { create } from "zustand";

type MetadataStore = {
  board: Board | null;
  setBoard: (board: Board) => void;

  sections: Section[];
  setSections: (section: Section[]) => void;
};

export const useMetadataStore = create<MetadataStore>((set) => ({
  board: null,
  setBoard: (board: Board) => set({ board }),

  sections: [] as Section[],
  setSections: (sections: Section[]) => set({ sections }),
}));
