import { create } from "zustand";

type LayoutStore = {
  layoutDirty: boolean;
  setLayoutDirty: (d: boolean) => void;

  showBlurImg: boolean;
  setShowBlurImg: (d: boolean) => void;
};

export const useLayoutStore = create<LayoutStore>((set) => ({
  layoutDirty: false,
  setLayoutDirty: (d) => set({ layoutDirty: d }),

  showBlurImg: false,
  setShowBlurImg: (d) => set({ showBlurImg: d }),
}));
