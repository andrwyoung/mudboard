import { Block } from "@/types/block-types";
import { Section } from "@/types/board-types";
import { create } from "zustand";

export type ExtFileDropTarget = {
  section: Section;
  mirror: "main" | "mirror";
} | null;

type DragStore = {
  draggedBlocks: Block[] | null;
  setDraggedBlocks: (blocks: Block[] | null) => void;

  dropIndicatorId: string | null;
  setDropIndicatorId: (id: string | null) => void;

  isDraggingExtFile: boolean;
  setIsDraggingExtFile: (val: boolean) => void;

  extFileOverSection: ExtFileDropTarget;
  setExtFileOverSection: (val: ExtFileDropTarget) => void;
};

export const useDragStore = create<DragStore>()((set) => ({
  draggedBlocks: null,
  setDraggedBlocks: (blocks) => set({ draggedBlocks: blocks }),

  dropIndicatorId: null,
  setDropIndicatorId: (id) => set({ dropIndicatorId: id }),

  isDraggingExtFile: false,
  setIsDraggingExtFile: (val) => set({ isDraggingExtFile: val }),

  extFileOverSection: null,
  setExtFileOverSection: (val) => set({ extFileOverSection: val }),
}));
