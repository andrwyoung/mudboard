import { create } from "zustand";
import { useMetadataStore, UserProfile } from "./metadata-store";
import { supabase } from "@/lib/supabase/supabase-client";
import { toast } from "sonner";

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

type UserPreferenceStore = {
  minimalBorders: boolean | null;
  setMinimalBorders: (border: boolean | null) => void;

  viewBgColor: string | null;
  setViewBgColor: (color: string | null) => void;

  arrangeBgColor: string | null;
  setArrangeBgColor: (color: string | null) => void;

  bulkSetPreferences: (profile: UserProfile) => void;
  syncPreferences: () => void;

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
    syncPreferences: (delay = 1000) => {
      if (syncTimeout) clearTimeout(syncTimeout);

      syncTimeout = setTimeout(() => {
        const { minimalBorders, viewBgColor, arrangeBgColor } = get();
        const user = useMetadataStore.getState().user;

        if (!user?.id) {
          console.warn("No user found for preference update.");
          return;
        }

        supabase
          .from("users")
          .update({
            freeform_border_off: minimalBorders,
            freeform_view_color: viewBgColor,
            freeform_arrange_color: arrangeBgColor,
          })
          .eq("user_id", user.id)
          .then(({ error }) => {
            if (error) {
              console.warn("Error updating user preferences: ", error);
            } else {
              toast("Freeform Preference Synced!");
            }
          });
      }, delay);
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
