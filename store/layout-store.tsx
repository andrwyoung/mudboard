import { create } from "zustand";

type LayoutStore = {
  layoutDirty: boolean;
  setLayoutDirty: (d: boolean) => void;

  showLowRes: boolean;
  setShowLowRes: (d: boolean) => void;
};

export const useLayoutStore = create<LayoutStore>((set) => ({
  layoutDirty: false,
  setLayoutDirty: (d) => set({ layoutDirty: d }),

  showLowRes: true,
  setShowLowRes: (d) => set({ showLowRes: d }),
}));
