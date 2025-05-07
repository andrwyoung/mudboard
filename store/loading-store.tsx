import { create } from "zustand";

type LoadingStore = {
  uploading: boolean;
  setUploading: (d: boolean) => void;
};

export const useLoadingStore = create<LoadingStore>((set) => ({
  uploading: false,
  setUploading: (d) => set({ uploading: d }),
}));
