import { DEFAULT_COLUMNS, DEFAULT_SPACING } from "@/types/constants";
import { create } from "zustand";

type UIStore = {
  columnCount: number;
  spacingSize: number;

  setColumnCount: (cols: number) => void;
  setSpacingSize: (spacing: number) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  columnCount: DEFAULT_COLUMNS,
  spacingSize: DEFAULT_SPACING,

  setColumnCount: (cols) => set({ columnCount: cols }),
  setSpacingSize: (spacing) => set({ spacingSize: spacing }),
}));
