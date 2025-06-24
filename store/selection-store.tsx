// here's where we keep track of what is selected
// note that we have only 1 selecteion store (we don't keep 2 around for the mirror),

import { Block } from "@/types/block-types";
import { BoardSection, CanvasScope } from "@/types/board-types";
import { create } from "zustand";

type SelectionStore = {
  selectionScope: CanvasScope;

  selectedSection: BoardSection | null;
  setSelectedSection: (section: BoardSection) => void;

  selectedBlocks: Record<string, Block>;
  lastSelectedBlock: Block | null;
  setSelectedBlocks: (
    scope: CanvasScope,
    blocks: Record<string, Block>,
    lastSelected: Block
  ) => void;
  deselectBlocks: () => void;
};

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectionScope: "main",

  selectedSection: null,
  setSelectedSection: (s: BoardSection) => set({ selectedSection: s }),

  selectedBlocks: {},
  lastSelectedBlock: null,
  setSelectedBlocks: (scope, blocks, lastSelected) =>
    set({
      selectionScope: scope,
      selectedBlocks: blocks,
      lastSelectedBlock: lastSelected,
    }),

  deselectBlocks: () => set({ selectedBlocks: {}, lastSelectedBlock: null }),
}));
