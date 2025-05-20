import { Block } from "@/types/block-types";
import { create, StateCreator } from "zustand";

type OverlayScope = "main" | "mirror";

export function useOverlayStore(scope: OverlayScope): OverlayState {
  return scope === "main" ? useMainOverlayStore() : useMirrorOverlayStore();
}
type OverlayState = {
  isOpen: boolean;
  openOverlay: (block: Block) => void;
  closeOverlay: () => void;

  overlayBlock: Block | null;
  setOverlayBlock: (b: Block | null) => void;
};

function createOverlayStoreInitializer(): StateCreator<OverlayState> {
  return (set) => ({
    isOpen: false,
    openOverlay: (block) => set({ isOpen: true, overlayBlock: block }),
    closeOverlay: () => set({ isOpen: false, overlayBlock: null }),

    overlayBlock: null,
    setOverlayBlock: (b: Block | null) => set({ overlayBlock: b }),
  });
}

export const useMainOverlayStore = create<OverlayState>(
  createOverlayStoreInitializer()
);

export const useMirrorOverlayStore = create<OverlayState>(
  createOverlayStoreInitializer()
);
