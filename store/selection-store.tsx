import { Block } from "@/types/block-types";
import { Section } from "@/types/board-types";
import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";

type SelectionStore = {
  overlayGalleryIsOpen: boolean;
  openOverlayGallery: (block: Block) => void;
  closeOverlayGallery: () => void;

  // selected stuff
  overlayGalleryShowing: Block | null;
  setOverlayGalleryShowing: (b: Block | null) => void;

  selectedSection: Section | null;
  setSelectedSection: (s: Section) => void;

  selectedBlocks: Record<string, Block>;
  setSelectedBlocks: Dispatch<SetStateAction<Record<string, Block>>>;
};

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  overlayGalleryIsOpen: false,
  openOverlayGallery: (block: Block) =>
    set({ overlayGalleryIsOpen: true, overlayGalleryShowing: block }),
  closeOverlayGallery: () =>
    set({ overlayGalleryIsOpen: false, overlayGalleryShowing: null }),

  // selected stuff
  overlayGalleryShowing: null,
  setOverlayGalleryShowing: (b: Block | null) =>
    set({ overlayGalleryShowing: b }),

  selectedSection: null,
  setSelectedSection: (s: Section) => set({ selectedSection: s }),

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
