import { create } from "zustand";

export type CameraType = {
  x: number; // pan offset x
  y: number; // pan offset y
  scale: number; // zoom level
};

type CameraStore = Record<string, CameraType>; // sectionId -> camera

export type FreeformPosition = {
  x: number | null;
  y: number | null;
  z: number;
  scale: number;
};

type FreeformStore = {
  cameraMap: CameraStore;
  getCamera: (sectionId: string) => CameraType;
  setCameraForSection: (
    sectionId: string,
    cameraOrFn: CameraType | ((prev: CameraType) => CameraType)
  ) => void;

  editMode: boolean;
  setEditMode: (edit: boolean) => void;

  positionMap: Record<string, Record<string, FreeformPosition>>;
  setPositionForBlock: (
    sectionId: string,
    blockId: string,
    posOrFn:
      | Partial<FreeformPosition>
      | ((prev: FreeformPosition) => Partial<FreeformPosition>)
  ) => void;
  bulkSetPositions: (
    map: Record<string, Record<string, FreeformPosition>>
  ) => void;

  reset: () => void;
};

export const useFreeformStore = create<FreeformStore>((set, get) => ({
  cameraMap: {},
  getCamera: (sectionId) => {
    const cam = get().cameraMap[sectionId];

    if (cam) return cam;

    // if doesn't exist, then generate a fallback
    const fallback = { x: 0, y: 0, scale: 1 };
    get().setCameraForSection(sectionId, fallback);
    return fallback;
  },
  setCameraForSection: (sectionId, cameraOrFn) =>
    set((state) => {
      const prev = state.cameraMap[sectionId] ?? { x: 0, y: 0, scale: 1 };
      const newCam =
        typeof cameraOrFn === "function" ? cameraOrFn(prev) : cameraOrFn;

      return {
        cameraMap: {
          ...state.cameraMap,
          [sectionId]: newCam,
        },
      };
    }),

  editMode: false,
  setEditMode: (edit: boolean) => set({ editMode: edit }),

  positionMap: {},
  setPositionForBlock: (sectionId, blockId, posOrFn) =>
    set((state) => {
      const section = state.positionMap[sectionId] ?? {};
      const prev = section[blockId] ?? {
        x: 0,
        y: 0,
        z: 0,
        scale: 1,
      };

      const updates = typeof posOrFn === "function" ? posOrFn(prev) : posOrFn;

      const newPos: FreeformPosition = {
        x: updates.x ?? prev.x ?? 0,
        y: updates.y ?? prev.y ?? 0,
        z: updates.z ?? prev.z,
        scale: updates.scale ?? prev.scale ?? 1,
      };

      return {
        positionMap: {
          ...state.positionMap,
          [sectionId]: {
            ...section,
            [blockId]: newPos,
          },
        },
      };
    }),
  bulkSetPositions: (map) =>
    set(() => ({
      positionMap: map,
    })),

  reset: () =>
    set(() => ({
      cameraMap: {},
      positionMap: {},
      editMode: false,
    })),
}));
