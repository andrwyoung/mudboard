import { create } from "zustand";

type ModalStore = {
  loginModalOpen: boolean;
  setLoginModalOpen: (d: boolean) => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  loginModalOpen: false,
  setLoginModalOpen: (d) => set({ loginModalOpen: d }),
}));
