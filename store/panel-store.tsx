import { Block } from "@/types/block-types";
import { create } from "zustand";

export type PanelMode = "none" | "explore" | "focus";

type PanelStore = {
  panelMode: PanelMode;
  setPanelMode: (mode: PanelMode) => void;
  closePanel: () => void;

  // pinned panel
  openPinnedPanel: () => void;
  openPinnedPanelWithBlock: (block: Block) => void;
  pinnedBlock: Block | null;
  setPinnedBlock: (b: Block | null) => void;

  // sidebar
  isCollapsed: boolean;
  setIsCollapsed: (isOpen: boolean) => void;

  reset: () => void;
};

export const usePanelStore = create<PanelStore>((set) => ({
  panelMode: "none",
  setPanelMode: (mode: PanelMode) => set({ panelMode: mode }),
  closePanel: () => set({ panelMode: "none" as PanelMode, pinnedBlock: null }),

  // pinned panel
  openPinnedPanel: () => set({ panelMode: "focus" }),
  openPinnedPanelWithBlock: (block: Block) =>
    set({ panelMode: "focus", pinnedBlock: block }),
  pinnedBlock: null,
  setPinnedBlock: (b: Block | null) => {
    if (b?.block_type === "image") {
      set({ pinnedBlock: b });
    } else {
      set({ pinnedBlock: null });
    }
  },

  // sidebar
  isCollapsed: false,
  setIsCollapsed: (isOpen: boolean) => set({ isCollapsed: isOpen }),

  reset: () =>
    set({ panelMode: "none", pinnedBlock: null, isCollapsed: false }),
}));
