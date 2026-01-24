// this is mostly just how the gallery looks, but it's also very
// very important because we need these numbers to measure the columns widths
// for virtualization

import {
  DEFAULT_GALLERY_SPACING,
  DEFAULT_SIDEBAR_WIDTH,
  DEFAULT_SPACING,
} from "@/types/constants";
import { createRef } from "react";
import { create } from "zustand";

type UIStore = {
  mirrorMode: boolean;
  toggleMirrorMode: () => void;

  // numCols: number;
  // setNumCols: (cols: number) => void;

  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;

  spacingSize: number;
  setSpacingSize: (spacing: number) => void;

  gallerySpacingSize: number;
  setGallerySpacingSize: (spacing: number) => void;

  prettyMode: boolean;
  setPrettyMode: (d: boolean) => void;

  isMobile: boolean;
  setIsMobile: (m: boolean) => void;

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

  darkMode: false,
  setDarkMode: (mode: boolean) => set({ darkMode: mode }),

  // numCols: DEFAULT_COLUMNS,
  // setNumCols: (cols) => set({ numCols: cols }),

  spacingSize: DEFAULT_SPACING,
  setSpacingSize: (spacing) => set({ spacingSize: spacing }),

  gallerySpacingSize: DEFAULT_GALLERY_SPACING,
  setGallerySpacingSize: (spacing) => set({ gallerySpacingSize: spacing }),

  prettyMode: true,
  setPrettyMode: (d) => set({ prettyMode: d }),

  isMobile: false,
  setIsMobile: (m: boolean) => set({ isMobile: m }),

  freeformMode: false,
  setFreeformMode: (mode: boolean) => set({ freeformMode: mode }),
  toggleFreeformMode: () =>
    set((state) => ({
      freeformMode: !state.freeformMode,
    })),
}));

export const mainCanvasRef = createRef<HTMLDivElement>();

type MeasureStore = {
  windowWidth: number;
  setWindowWidth: (width: number) => void;

  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;

  scroll: number;
  setScroll: (scroll: number) => void;

  canvasWidth: number;
  canvasHeight: number;
};

export const useMeasureStore = create<MeasureStore>((set) => ({
  windowWidth: 0,
  setWindowWidth: (width: number) => set({ windowWidth: width }),

  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  setSidebarWidth: (width) => set({ sidebarWidth: width }),

  scroll: 0,
  setScroll: (scroll: number) => set({ scroll }),

  canvasWidth: 0,
  canvasHeight: 0,
}));
