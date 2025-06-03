// this is mostly just how the gallery looks, but it's also very
// very important because we need these numbers to measure the columns widths
// for virtualization

import {
  DEFAULT_COLUMNS,
  DEFAULT_GALLERY_SPACING,
  DEFAULT_SPACING,
} from "@/types/constants";
import { create } from "zustand";

type UIStore = {
  mirrorMode: boolean;
  toggleMirrorMode: () => void;

  numCols: number;
  setNumCols: (cols: number) => void;

  spacingSize: number;
  setSpacingSize: (spacing: number) => void;

  gallerySpacingSize: number;
  setGallerySpacingSize: (spacing: number) => void;

  prettyMode: boolean;
  setPrettyMode: (d: boolean) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  mirrorMode: false,
  toggleMirrorMode: () =>
    set((state) => ({
      mirrorMode: !state.mirrorMode,
    })),

  numCols: DEFAULT_COLUMNS,
  setNumCols: (cols) => set({ numCols: cols }),

  spacingSize: DEFAULT_SPACING,
  setSpacingSize: (spacing) => set({ spacingSize: spacing }),

  gallerySpacingSize: DEFAULT_GALLERY_SPACING,
  setGallerySpacingSize: (spacing) => set({ gallerySpacingSize: spacing }),

  prettyMode: true,
  setPrettyMode: (d) => set({ prettyMode: d }),
}));
