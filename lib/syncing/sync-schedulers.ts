import { useFreeformStore } from "@/store/freeform-store";
import { useLayoutStore } from "@/store/layout-store";
import { AUTOSYNC_DELAY } from "@/types/upload-settings";

let freeformSyncTimeout: NodeJS.Timeout | null = null;
let gridSyncTimeout: NodeJS.Timeout | null = null;

export const scheduleFreeformSync = () => {
  if (freeformSyncTimeout) {
    clearTimeout(freeformSyncTimeout);
  }
  freeformSyncTimeout = setTimeout(() => {
    useFreeformStore.getState().syncFreeform();
  }, AUTOSYNC_DELAY);
};

export const scheduleGridSync = () => {
  if (gridSyncTimeout) {
    clearTimeout(gridSyncTimeout);
  }
  gridSyncTimeout = setTimeout(() => {
    useLayoutStore.getState().syncLayout();
  }, AUTOSYNC_DELAY);
};
