import { Block } from "@/types/block-types";
import { create } from "zustand";

type PinnedStore = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;

  pinnedBlock: Block | null;
  setPinnedBlock: (b: Block | null) => void;

  reset: () => void;
};

export const usePinnedStore = create<PinnedStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  toggleOpen: () =>
    set((state) => ({
      isOpen: !state.isOpen,
    })),

  pinnedBlock: null,
  setPinnedBlock: (b: Block | null) => {
    if (b?.block_type === "image") {
      set({ pinnedBlock: b });
    } else {
      set({ pinnedBlock: null });
    }
  },

  reset: () => set({ isOpen: false, pinnedBlock: null }),
}));
