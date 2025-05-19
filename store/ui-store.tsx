import {
  DEFAULT_COLUMNS,
  DEFAULT_GALLERY_SPACING,
  DEFAULT_SPACING,
} from "@/types/constants";
import { create } from "zustand";

type UIStore = {
  galleryIsOpen: boolean;
  setGalleryIsOpen: (g: boolean) => void;

  numCols: number;
  setNumCols: (cols: number) => void;
  mirrorNumCols: number;
  setMirrorNumCols: (cols: number) => void;

  spacingSize: number;
  setSpacingSize: (spacing: number) => void;

  gallerySpacingSize: number;
  setGallerySpacingSize: (spacing: number) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  galleryIsOpen: false,
  setGalleryIsOpen: (g: boolean) => set({ galleryIsOpen: g }),

  numCols: DEFAULT_COLUMNS,
  setNumCols: (cols) => set({ numCols: cols }),
  mirrorNumCols: DEFAULT_COLUMNS,
  setMirrorNumCols: (cols) => set({ numCols: cols }),

  spacingSize: DEFAULT_SPACING,
  setSpacingSize: (spacing) => set({ spacingSize: spacing }),

  gallerySpacingSize: DEFAULT_GALLERY_SPACING,
  setGallerySpacingSize: (spacing) => set({ gallerySpacingSize: spacing }),
}));
