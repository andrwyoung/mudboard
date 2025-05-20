import { Block } from "@/types/block-types";
import { CanvasScope, Section } from "@/types/board-types";
import { create } from "zustand";

type SelectionStore = {
  selectionScope: CanvasScope;

  selectedSection: Section | null;
  setSelectedSection: (section: Section) => void;

  selectedBlocks: Record<string, Block>;
  setSelectedBlocks: (
    scope: CanvasScope,
    blocks: Record<string, Block>
  ) => void;
  deselectBlocks: () => void;
};

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectionScope: "main",

  selectedSection: null,
  setSelectedSection: (s: Section) => set({ selectedSection: s }),

  selectedBlocks: {},
  setSelectedBlocks: (scope, blocks) =>
    set({
      selectionScope: scope,
      selectedBlocks: blocks,
    }),

  deselectBlocks: () => set({ selectedBlocks: {} }),
}));
