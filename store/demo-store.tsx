import { create } from "zustand";

export type ModalType = "welcome" | "greenhouse";

type DemoStore = {
  showGreenhousePopup: boolean;

  isDemoBoard: boolean;
  setDemoBoardYes: () => void;

  mode: ModalType | null;
  openModal: (modal: ModalType | null) => void;
  closeModal: () => void;
};

export const useDemoStore = create<DemoStore>((set, get) => ({
  showGreenhousePopup: false,

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
