import { fireConfetti } from "@/utils/fire-confetti";
import { create } from "zustand";
import { useExploreStore } from "./explore-store";
import {
  extraTutorialItems,
  mainTutorialItems,
  MissionType,
  ModalType,
} from "@/types/demo-types";

type DemoStore = {
  showGreenhousePopup: boolean;
  hasFiredConfetti: boolean;
  fireConfetti: () => void;

  isTempMudkitSelected: boolean;
  setIsTempMudkitSelected: (temp: boolean) => void;

  missionsCompleted: Record<MissionType, boolean>;
  markMissionComplete: (mission: MissionType) => void;
  markTempMudkitComplete: () => void;

  hasInitalPopupRun: boolean;
  hasFinalPopupRun: boolean;
  decideToRunPopup: () => void;

  // help modal
  currentHelpMission: MissionType | "complete" | "complete2" | null;
  openHelp: (mission: MissionType) => void;
  closeHelp: () => void;

  isDemoBoard: boolean;
  setDemoBoardYes: () => void;

  mode: ModalType | null;
  openModal: (modal: ModalType | null) => void;
  closeModal: () => void;

  resetDemo: () => void;
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
    freeform: false,
    section: false,
    expand: false,
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
      const alreadyCompleted = get().missionsCompleted.mudkit2;

      set((state) => ({
        missionsCompleted: { ...state.missionsCompleted, mudkit2: true },
      }));

      if (!alreadyCompleted) {
        setTimeout(() => {
          fireConfetti();
          set({ currentHelpMission: "complete" });
        }, 500);
      }
    }
  },

  hasInitalPopupRun: false,
  hasFinalPopupRun: false,
  decideToRunPopup: () => {
    const isEssentialFlowComplete = mainTutorialItems.every(
      (mission) => get().missionsCompleted[mission]
    );
    const isTutorialComplete =
      isEssentialFlowComplete &&
      extraTutorialItems.every((mission) => get().missionsCompleted[mission]);

    if (isEssentialFlowComplete && !get().hasInitalPopupRun) {
      fireConfetti();
      set({ currentHelpMission: "complete", hasInitalPopupRun: true });
    }

    if (isTutorialComplete && !get().hasFinalPopupRun) {
      set({ currentHelpMission: "complete2", hasFinalPopupRun: true });
    }
  },

  isDemoBoard: false,
  setDemoBoardYes: () =>
    set(() => ({
      isDemoBoard: true,
      showGreenhousePopup: true,
    })),

  currentHelpMission: null,
  openHelp: (mission: MissionType) => set({ currentHelpMission: mission }),
  closeHelp: () => set({ currentHelpMission: null }),

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

  resetDemo: () =>
    set(() => ({
      showGreenhousePopup: false,
      hasFiredConfetti: false,
      isTempMudkitSelected: false,
      missionsCompleted: {
        drag: false,
        freeform: false,
        expand: false,
        section: false,
        greenhouse: false,
        mudkit: false,
        mudkit2: false,
        upload: false,
        spotlight: false,
        export: false,
      },
      currentHelpMission: null,
      isDemoBoard: false,
      mode: null,
    })),
}));
