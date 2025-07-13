import { create } from "zustand";
import { UserProfile } from "./metadata-store";

type UserPreferenceStore = {
  minimalBorders: boolean | null;
  setMinimalBorders: (border: boolean | null) => void;

  viewBgColor: string | null;
  setViewBgColor: (color: string | null) => void;

  arrangeBgColor: string | null;
  setArrangeBgColor: (color: string | null) => void;

  bulkSetPreferences: (profile: UserProfile) => void;

  initialized: boolean;
  logout: () => void;
  clear: () => void;
};

export const useUserPreferenceStore = create<UserPreferenceStore>(
  (set, get) => ({
    minimalBorders: null,
    setMinimalBorders: (border: boolean | null) =>
      set({ minimalBorders: border }),

    viewBgColor: null,
    setViewBgColor: (color: string | null) => set({ viewBgColor: color }),

    arrangeBgColor: null,
    setArrangeBgColor: (color: string | null) => set({ arrangeBgColor: color }),

    bulkSetPreferences: (profile: UserProfile) => {
      if (get().initialized) return;

      set({
        minimalBorders: profile.freeform_border_off,
        viewBgColor: profile.freeform_view_color,
        arrangeBgColor: profile.freeform_arrange_color,
        initialized: true,
      });
    },

    initialized: false,

    logout: () => set({ initialized: false }),
    clear: () => {
      set({
        minimalBorders: null,
        viewBgColor: null,
        arrangeBgColor: null,

        initialized: false,
      });
    },
  })
);
