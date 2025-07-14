// this is mostly just how the gallery looks, but it's also very
// very important because we need these numbers to measure the columns widths
// for virtualization

import { DEFAULT_GALLERY_SPACING, DEFAULT_SPACING } from "@/types/constants";
import { createRef } from "react";
import { create } from "zustand";

type UIStore = {
  mirrorMode: boolean;
  toggleMirrorMode: () => void;

  // numCols: number;
  // setNumCols: (cols: number) => void;

  spacingSize: number;
  setSpacingSize: (spacing: number) => void;

  gallerySpacingSize: number;
  setGallerySpacingSize: (spacing: number) => void;

  prettyMode: boolean;
  setPrettyMode: (d: boolean) => void;

  forceMobileColumns: boolean;
  toggleMobileColumns: () => void;

  freeformMode: boolean;
  setFreeformMode: (mode: boolean) => void;
  toggleFreeformMode: () => void;
};

export const useUIStore = create<UIStore>((set, get) => ({
  mirrorMode: false,
  toggleMirrorMode: () =>
    set((state) => ({
      mirrorMode: !state.mirrorMode,
    })),

  // numCols: DEFAULT_COLUMNS,
  // setNumCols: (cols) => set({ numCols: cols }),

  spacingSize: DEFAULT_SPACING,
  setSpacingSize: (spacing) => set({ spacingSize: spacing }),

  gallerySpacingSize: DEFAULT_GALLERY_SPACING,
  setGallerySpacingSize: (spacing) => set({ gallerySpacingSize: spacing }),

  prettyMode: true,
  setPrettyMode: (d) => set({ prettyMode: d }),

  forceMobileColumns: false,
  toggleMobileColumns: () => {
    const current = get().forceMobileColumns;
    set({ forceMobileColumns: !current });
  },

  freeformMode: false,
  setFreeformMode: (mode: boolean) => set({ freeformMode: mode }),
  toggleFreeformMode: () =>
    set((state) => ({
      freeformMode: !state.freeformMode,
    })),
}));

export const mainCanvasRef = createRef<HTMLDivElement>();

type MeasureStore = {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  windowWidth: number;
  setWindowWidth: (width: number) => void;

  scroll: number;
  setScroll: (scroll: number) => void;
};

export const useMeasureStore = create<MeasureStore>((set) => ({
  sidebarWidth: 0,
  setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
  windowWidth: 0,
  setWindowWidth: (width: number) => set({ windowWidth: width }),

  scroll: 0,
  setScroll: (scroll: number) => set({ scroll }),
}));
