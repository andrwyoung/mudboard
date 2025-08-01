import { create } from "zustand";

type ModalStore = {
  loginModalOpen: boolean;
  setLoginModalOpen: (d: boolean) => void;

  shareModalIsOpen: boolean;
  shareModalSectionId: string | null;
  openShareModal: (sectionId: string) => void;
  closeShareModal: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  loginModalOpen: false,
  setLoginModalOpen: (d) => set({ loginModalOpen: d }),

  shareModalIsOpen: false,
  shareModalSectionId: null,
  openShareModal: (sectionId: string) =>
    set({ shareModalIsOpen: true, shareModalSectionId: sectionId }),
  closeShareModal: () =>
    set({ shareModalIsOpen: false, shareModalSectionId: null }),
}));
