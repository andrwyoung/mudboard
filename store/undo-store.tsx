import { UndoableAction } from "@/types/undo-types";
import { create } from "zustand";

// Define the shape of a reversible action

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
    if (!action) return;

    action.undo();
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, action],
    });
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    const action = redoStack[redoStack.length - 1];
    if (!action) return;

    action.do();
    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, action],
    });
  },

  clearHistory: () => {
    set({
      undoStack: [],
      redoStack: [],
    });
  },
}));
