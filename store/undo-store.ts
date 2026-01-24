import { PositionedBlock } from "@/types/sync-types";
import { create } from "zustand";
import { useUIStore } from "./ui-store";
import { useSelectionStore } from "./selection-store";
import { useMetadataStore } from "./metadata-store";

// Define the shape of a reversible action
export type UndoableAction = {
  do: () => void;
  undo: () => void;
  label: string;
  payload?: UndoPayload; // optional
  scope: "grid" | "freeform" | "shared";
  sectionId?: string;
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
    const currentSectionId =
      useSelectionStore.getState().selectedSection?.section.section_id;

    const isSameMode = // are in the correct mode?
      action.scope === "shared" ||
      (freeformMode && action.scope === "freeform") ||
      (!freeformMode && action.scope === "grid");

    const isSameSection = // are we in the correct section?
      action.scope !== "freeform" || action.sectionId === currentSectionId;

    if (isSameMode && isSameSection) {
      action.undo();
      set({
        undoStack: undoStack.slice(0, -1),
        redoStack: [...redoStack, action],
      });
    } else {
      if (action.scope === "freeform") {
        if (action.sectionId && action.sectionId !== currentSectionId) {
          const boardSection =
            useMetadataStore.getState().boardSectionMap[action.sectionId];
          useSelectionStore.getState().setSelectedSection(boardSection);
        }
        useUIStore.getState().setFreeformMode(true);
      } else if (action.scope === "grid") {
        useUIStore.getState().setFreeformMode(false);
      }
    }
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    const action = redoStack[redoStack.length - 1];
    if (!action) return;

    const freeformMode = useUIStore.getState().freeformMode;
    const currentSectionId =
      useSelectionStore.getState().selectedSection?.section.section_id;

    const isSameMode =
      action.scope === "shared" ||
      (freeformMode && action.scope === "freeform") ||
      (!freeformMode && action.scope === "grid");

    const isSameSection =
      action.scope !== "freeform" || action.sectionId === currentSectionId;

    if (isSameMode && isSameSection) {
      action.do();
      set({
        redoStack: redoStack.slice(0, -1),
        undoStack: [...undoStack, action],
      });
    } else {
      if (action.scope === "freeform") {
        if (action.sectionId && action.sectionId !== currentSectionId) {
          const boardSection =
            useMetadataStore.getState().boardSectionMap[action.sectionId];
          useSelectionStore.getState().setSelectedSection(boardSection);
        }
        useUIStore.getState().setFreeformMode(true);
      } else if (action.scope === "grid") {
        useUIStore.getState().setFreeformMode(false);
      }
    }
  },

  clearHistory: () => {
    set({
      undoStack: [],
      redoStack: [],
    });
  },
}));
