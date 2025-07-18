import { PositionedBlock } from "@/types/sync-types";
import { create } from "zustand";
import { useUIStore } from "./ui-store";

// Define the shape of a reversible action
export type UndoableAction = {
  do: () => void;
  undo: () => void;
  label: string;
  payload?: UndoPayload; // optional
  scope: "grid" | "freeform" | "shared";
};

export type UndoPayload = {
  positionedBlocks: PositionedBlock[];
};

// Zustand store
type UndoStore = {
  undoStack: UndoableAction[];
  redoStack: UndoableAction[];

  execute: (action: UndoableAction) => void;
  undo: () => void;
  redo: () => void;

  clearHistory: () => void;
};

export const useUndoStore = create<UndoStore>((set, get) => ({
  undoStack: [],
  redoStack: [],

  execute: (action) => {
    action.do();
    set((state) => ({
      undoStack: [...state.undoStack, action],
      redoStack: [], // Clear redo history on new action
    }));
  },

  undo: () => {
    const { undoStack, redoStack } = get();
    const action = undoStack[undoStack.length - 1];
    if (!action) return; // if no more

    const freeformMode = useUIStore.getState().freeformMode;

    // if we're supposed to undo something in another mode, switch to that mode instead
    if (
      action.scope === "shared" ||
      (freeformMode && action.scope === "freeform") ||
      (!freeformMode && action.scope === "grid")
    ) {
      action.undo();
      set({
        undoStack: undoStack.slice(0, -1),
        redoStack: [...redoStack, action],
      });
    } else {
      const shouldBeFreeform = action.scope === "freeform";
      useUIStore.getState().setFreeformMode(shouldBeFreeform);
    }
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    const action = redoStack[redoStack.length - 1];
    if (!action) return;

    const freeformMode = useUIStore.getState().freeformMode;

    if (
      action.scope === "shared" ||
      (freeformMode && action.scope === "freeform") ||
      (!freeformMode && action.scope === "grid")
    ) {
      action.do();
      set({
        redoStack: redoStack.slice(0, -1),
        undoStack: [...undoStack, action],
      });
    } else {
      const shouldBeFreeform = action.scope === "freeform";
      useUIStore.getState().setFreeformMode(shouldBeFreeform);
    }
  },

  clearHistory: () => {
    set({
      undoStack: [],
      redoStack: [],
    });
  },
}));
