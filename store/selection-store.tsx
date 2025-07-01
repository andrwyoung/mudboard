// here's where we keep track of what is selected
// note that we have only 1 selecteion store (we don't keep 2 around for the mirror),

import { Block } from "@/types/block-types";
import { BoardSection, CanvasScope } from "@/types/board-types";
import { create } from "zustand";

type SelectionStore = {
  currentScope: CanvasScope;

  selectedSection: BoardSection | null;
  setSelectedSection: (section: BoardSection) => void;

  selectedBlocks: Record<string, Block>;
  lastSelectedBlock: Block | null;
  selectOnlyThisBlock: (scope: CanvasScope, block: Block) => void;
  addBlocksToSelection: (scope: CanvasScope, blocks: Block[]) => void;
  removeBlockFromSelection: (block: Block) => void;

  setSelectedBlocks: (
    scope: CanvasScope,
    blocks: Record<string, Block>,
    lastSelected: Block | null
  ) => void;
  deselectBlocks: () => void;
};

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  currentScope: "main",

  selectedSection: null,
  setSelectedSection: (s: BoardSection) => set({ selectedSection: s }),

  selectedBlocks: {},
  lastSelectedBlock: null,
  selectOnlyThisBlock: (scope: CanvasScope, block: Block) =>
    set({
      currentScope: scope,
      selectedBlocks: { [block.block_id]: block },
      lastSelectedBlock: block,
    }),
  addBlocksToSelection: (scope: CanvasScope, blocks: Block[]) => {
    const { currentScope, selectOnlyThisBlock } = get();
    console.log("current scope", currentScope, "new scope: ", scope);

    if (scope !== currentScope) {
      if (blocks.length > 0) {
        selectOnlyThisBlock(scope, blocks[blocks.length - 1]);
      }
      return;
    }

    set((state) => {
      const updated = { ...state.selectedBlocks };
      blocks.forEach((block) => {
        updated[block.block_id] = block;
      });

      return {
        selectedBlocks: updated,
        lastSelectedBlock: blocks[blocks.length - 1] ?? null,
      };
    });
  },
  removeBlockFromSelection: (block: Block) => {
    const { selectedBlocks, lastSelectedBlock } = get();

    // Create a shallow copy and remove the given block
    const updated = { ...selectedBlocks };
    delete updated[block.block_id];

    // If the block being removed is the last selected, null it
    const updatedLast =
      lastSelectedBlock?.block_id === block.block_id ? null : lastSelectedBlock;

    set({
      selectedBlocks: updated,
      lastSelectedBlock: updatedLast,
    });
  },

  setSelectedBlocks: (scope, blocks, lastSelected) =>
    set({
      currentScope: scope,
      selectedBlocks: blocks,
      lastSelectedBlock: lastSelected,
    }),

  deselectBlocks: () => set({ selectedBlocks: {}, lastSelectedBlock: null }),
}));
