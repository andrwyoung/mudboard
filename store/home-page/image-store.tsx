// Shared store for managing images across different pages
// Can be used by /processing, /colors, and other pages that need image handling

import { create } from "zustand";

export type ProcessedImage = {
  id: string;
  originalFile: File;
  preview: string;
  width: number;
  height: number;
};

interface ImageStore {
  images: ProcessedImage[];
  selectedImageId: string | null;

  // Actions
  setImages: (images: ProcessedImage[]) => void;
  addImages: (images: ProcessedImage[]) => void;
  removeImage: (imageId: string) => void;
  setSelectedImageId: (imageId: string | null) => void;
  clearImages: () => void;

  // Getters
  getSelectedImage: () => ProcessedImage | undefined;
  getImageById: (imageId: string) => ProcessedImage | undefined;
}

export const useImageStore = create<ImageStore>((set, get) => ({
  images: [],
  selectedImageId: null,

  setImages: (images) => set({ images }),

  addImages: (newImages) =>
    set((state) => ({
      images: [...state.images, ...newImages],
      selectedImageId:
        state.selectedImageId ||
        (newImages.length > 0 ? newImages[0].id : null),
    })),

  removeImage: (imageId) =>
    set((state) => {
      const newImages = state.images.filter((img) => img.id !== imageId);
      const newSelectedId =
        state.selectedImageId === imageId
          ? newImages.length > 0
            ? newImages[0].id
            : null
          : state.selectedImageId;

      return {
        images: newImages,
        selectedImageId: newSelectedId,
      };
    }),

  setSelectedImageId: (imageId) => set({ selectedImageId: imageId }),

  clearImages: () => set({ images: [], selectedImageId: null }),

  getSelectedImage: () => {
    const state = get();
    return state.images.find((img) => img.id === state.selectedImageId);
  },

  getImageById: (imageId) => {
    const state = get();
    return state.images.find((img) => img.id === imageId);
  },
}));
