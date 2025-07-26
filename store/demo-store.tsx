import { fireConfetti } from "@/utils/fire-confetti";
import { create } from "zustand";
import { useExploreStore } from "./explore-store";

export type ModalType = "welcome" | "greenhouse";
export type MissionType =
  | "drag"
  | "greenhouse"
  | "mudkit"
  | "mudkit2"
  | "upload"
  | "spotlight"
  | "export";

type DemoStore = {
  showGreenhousePopup: boolean;
  hasFiredConfetti: boolean;
  fireConfetti: () => void;

  isTempMudkitSelected: boolean;
  setIsTempMudkitSelected: (temp: boolean) => void;

  missionsCompleted: Record<MissionType, boolean>;
  markMissionComplete: (mission: MissionType) => void;
  markTempMudkitComplete: () => void;
  resetMissions: () => void;

  isDemoBoard: boolean;
  setDemoBoardYes: () => void;

  mode: ModalType | null;
  openModal: (modal: ModalType | null) => void;
  closeModal: () => void;
};

export const useDemoStore = create<DemoStore>((set, get) => ({
  showGreenhousePopup: false,

  hasFiredConfetti: false,
  fireConfetti: () => {
    if (!get().hasFiredConfetti) {
      fireConfetti();
      set({ hasFiredConfetti: true });
    }
  },

  isTempMudkitSelected: false,
  setIsTempMudkitSelected: (temp: boolean) =>
    set({ isTempMudkitSelected: temp }),

  missionsCompleted: {
    drag: false,
    greenhouse: false,
    mudkit: false,
    mudkit2: false,
    upload: false,
    spotlight: false,
    export: false,
  },

  markMissionComplete: (mission) =>
    set((state) => ({
      missionsCompleted: { ...state.missionsCompleted, [mission]: true },
    })),

  markTempMudkitComplete: () => {
    if (useExploreStore.getState().currentSelectedMudkitType === "temp") {
      set((state) => ({
        missionsCompleted: { ...state.missionsCompleted, mudkit2: true },
      }));
    }
  },

  resetMissions: () =>
    set(() => ({
      missionsCompleted: {
        drag: false,
        greenhouse: false,
        mudkit: false,
        mudkit2: false,
        upload: false,
        spotlight: false,
        export: false,
      },
    })),

  isDemoBoard: false,
  setDemoBoardYes: () =>
    set(() => ({
      isDemoBoard: true,
      showGreenhousePopup: true,
    })),

  mode: null,
  openModal: (modal) => {
    if (!get().isDemoBoard) return;

    if (modal === "greenhouse") {
      const { showGreenhousePopup } = get();
      if (!showGreenhousePopup) return;

      set({ mode: modal, showGreenhousePopup: false });
    } else {
      set({ mode: modal });
    }
  },
  closeModal: () => set({ mode: null }),
}));
