import { create } from "zustand";

type SidebarStore = {
  isCollapsed: boolean;
  setIsCollapsed: (isOpen: boolean) => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  isCollapsed: false,
  setIsCollapsed: (isOpen: boolean) => set({ isCollapsed: isOpen }),
}));
