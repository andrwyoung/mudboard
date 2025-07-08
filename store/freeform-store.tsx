import { create } from "zustand";

export type CameraType = {
  x: number; // pan offset x
  y: number; // pan offset y
  scale: number; // zoom level
};

type CameraStore = {
  camera: CameraType;
  setCamera: (profile: CameraType) => void;
};

export const useCameraStore = create<CameraStore>((set) => ({
  camera: { x: 0, y: 0, scale: 1 },
  setCamera: (profile: CameraType) => set({ camera: profile }),
}));
