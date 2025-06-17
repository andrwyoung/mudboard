// this is mostly ui stuff. half of it is not used anyways lol

import { DEFAULT_COLUMNS } from "@/types/constants";
import { create } from "zustand";

type LoadingStore = {
  boardInitialized: boolean;
  setBoardInitialized: (b: boolean) => void;

  // unused right now
  isUploading: boolean;
  setIsUploading: (d: boolean) => void;

  // not working right now
  // used for focusing on the title when makign new section
  editingSectionId: string | null;
  setEditingSectionId: (id: string | null) => void;

  showBlurImg: boolean;
  setShowBlurImg: (d: boolean) => void;

  // for fading out gallery
  sliderVal: number;
  setSliderVal: (d: number) => void;
  fadeGallery: boolean;
  setFadeGallery: (d: boolean) => void;
  showLoading: boolean;
  setShowLoading: (d: boolean) => void;
};

export const useLoadingStore = create<LoadingStore>((set) => ({
  boardInitialized: false,
  setBoardInitialized: (b: boolean) => set({ boardInitialized: b }),

  isUploading: false,
  setIsUploading: (d) => set({ isUploading: d }),

  editingSectionId: null,
  setEditingSectionId: (id: string | null) => set({ editingSectionId: id }),

  showBlurImg: false,
  setShowBlurImg: (d) => set({ showBlurImg: d }),

  sliderVal: DEFAULT_COLUMNS,
  setSliderVal: (d: number) => set({ sliderVal: d }),
  fadeGallery: false,
  setFadeGallery: (d: boolean) => set({ fadeGallery: d }),
  showLoading: false,
  setShowLoading: (d: boolean) => set({ showLoading: d }),
}));
