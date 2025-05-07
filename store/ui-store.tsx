import {
  DEFAULT_COLUMNS,
  DEFAULT_GALLERY_SPACING,
  DEFAULT_SPACING,
} from "@/types/constants";
import { create } from "zustand";

type UIStore = {
  numCols: number;
  spacingSize: number;
  galleySpacingSize: number;

  setNumCols: (cols: number) => void;
  setSpacingSize: (spacing: number) => void;
  setGalleySpacingSize: (spacing: number) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  numCols: DEFAULT_COLUMNS,
  spacingSize: DEFAULT_SPACING,
  galleySpacingSize: DEFAULT_GALLERY_SPACING,

  setNumCols: (cols) => set({ numCols: cols }),
  setSpacingSize: (spacing) => set({ spacingSize: spacing }),
  setGalleySpacingSize: (spacing) => set({ galleySpacingSize: spacing }),
}));
