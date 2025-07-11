import { syncFreeformToSupabase } from "@/lib/syncing/sync-freeform";
import { scheduleFreeformSync } from "@/lib/syncing/sync-schedulers";
import { toast } from "sonner";
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

  // SECTION: syncing
  freeformDirtyMap: Record<string, boolean>;
  setFreeformDirtyForSection: (sectionId: string) => void;
  clearFreeformDirtyForSection: (sectionId: string) => void;
  isFreeformDirty: (sectionId: string) => boolean;
  isAnyFreeformDirty: () => boolean;

  syncFreeform: () => Promise<boolean>;

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
  setEditMode: (edit: boolean) => {
    // if (edit) {
    //   toast("Arrange Mode");
    // } else {
    //   toast("View Mode");
    // }

    set({ editMode: edit });
  },
  positionMap: {},
  setPositionForBlock: (sectionId, blockId, posOrFn) => {
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
    });

    get().setFreeformDirtyForSection(sectionId);
  },
  bulkSetPositions: (map) =>
    set(() => ({
      positionMap: map,
    })),

  // SECTION: syncing;
  freeformDirtyMap: {},
  setFreeformDirtyForSection: (sectionId) =>
    set((state) => {
      scheduleFreeformSync();
      return {
        freeformDirtyMap: {
          ...state.freeformDirtyMap,
          [sectionId]: true,
        },
      };
    }),

  clearFreeformDirtyForSection: (sectionId) =>
    set((state) => {
      const map = { ...state.freeformDirtyMap };
      delete map[sectionId];
      return { freeformDirtyMap: map };
    }),
  isFreeformDirty: (sectionId) => {
    return get().freeformDirtyMap[sectionId] === true;
  },
  isAnyFreeformDirty: () => {
    return Object.values(get().freeformDirtyMap).some((v) => v);
  },

  syncFreeform: async () => {
    const { positionMap, freeformDirtyMap, clearFreeformDirtyForSection } =
      get();

    let allSuccessful = true;
    for (const [sectionId, isDirty] of Object.entries(freeformDirtyMap)) {
      if (!isDirty) continue;

      const positions = positionMap[sectionId];
      if (!positions) continue;

      const success = await syncFreeformToSupabase(sectionId, positions);
      if (success) {
        clearFreeformDirtyForSection(sectionId);
      } else {
        allSuccessful = false;
      }
    }
    return allSuccessful;
  },

  reset: () =>
    set(() => ({
      cameraMap: {},
      positionMap: {},
      editMode: false,
    })),
}));
