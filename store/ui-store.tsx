import {
  DEFAULT_COLUMNS,
  DEFAULT_GALLERY_SPACING,
  DEFAULT_SPACING,
} from "@/types/constants";
import { create } from "zustand";

type UIStore = {
  numCols: number;
  spacingSize: number;
  gallerySpacingSize: number;

  setNumCols: (cols: number) => void;
  setSpacingSize: (spacing: number) => void;
  setGallerySpacingSize: (spacing: number) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  numCols: DEFAULT_COLUMNS,
  spacingSize: DEFAULT_SPACING,
  gallerySpacingSize: DEFAULT_GALLERY_SPACING,

  setNumCols: (cols) => set({ numCols: cols }),
  setSpacingSize: (spacing) => set({ spacingSize: spacing }),
  setGallerySpacingSize: (spacing) => set({ gallerySpacingSize: spacing }),
}));
