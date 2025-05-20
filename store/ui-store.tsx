import {
  DEFAULT_COLUMNS,
  DEFAULT_GALLERY_SPACING,
  DEFAULT_SPACING,
} from "@/types/constants";
import { create } from "zustand";

type UIStore = {
  numCols: number;
  setNumCols: (cols: number) => void;
  mirrorNumCols: number;
  setMirrorNumCols: (cols: number) => void;

  spacingSize: number;
  setSpacingSize: (spacing: number) => void;

  gallerySpacingSize: number;
  setGallerySpacingSize: (spacing: number) => void;

  prettyMode: boolean;
  setPrettyMode: (d: boolean) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  numCols: DEFAULT_COLUMNS,
  setNumCols: (cols) => set({ numCols: cols }),
  mirrorNumCols: DEFAULT_COLUMNS,
  setMirrorNumCols: (cols) => set({ numCols: cols }),

  spacingSize: DEFAULT_SPACING,
  setSpacingSize: (spacing) => set({ spacingSize: spacing }),

  gallerySpacingSize: DEFAULT_GALLERY_SPACING,
  setGallerySpacingSize: (spacing) => set({ gallerySpacingSize: spacing }),

  prettyMode: true,
  setPrettyMode: (d) => set({ prettyMode: d }),
}));
