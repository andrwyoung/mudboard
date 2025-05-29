import { create } from "zustand";

type AlertModalStore = {
  alertModalOpen: boolean;
  setAlertModalOpen: (s: boolean) => void;
};

export const useAlertModalStore = create<AlertModalStore>((set) => ({
  alertModalOpen: false,
  setAlertModalOpen: (s: boolean) => set({ alertModalOpen: s }),
}));
