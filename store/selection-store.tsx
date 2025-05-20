import { Block } from "@/types/block-types";
import { Section } from "@/types/board-types";
import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";

type SelectionStore = {
  selectedSection: Section | null;
  setSelectedSection: (s: Section) => void;

  isMirrorSelected: boolean;
  selectedBlocks: Record<string, Block>;
  setSelectedBlocks: Dispatch<SetStateAction<Record<string, Block>>>;
};

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectedSection: null,
  setSelectedSection: (s: Section) => set({ selectedSection: s }),

  isMirrorSelected: false,
  selectedBlocks: {},
  setSelectedBlocks: (
    update:
      | Record<string, Block>
      | ((prev: Record<string, Block>) => Record<string, Block>)
  ) =>
    set((state) => ({
      selectedBlocks:
        typeof update === "function" ? update(state.selectedBlocks) : update,
    })),
}));
