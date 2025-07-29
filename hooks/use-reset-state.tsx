// reset all info. used whenever we want to go to a new board

import { useDemoStore } from "@/store/demo-store";
import { useExploreStore } from "@/store/explore-store";
import { useFreeformStore } from "@/store/freeform-store";
import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";
import { usePanelStore } from "@/store/panel-store";
import { useUIStore } from "@/store/ui-store";

export function useResetState() {
  return () => {
    useLayoutStore.getState().clearAll();
    useMetadataStore.getState().clearAll();
    usePanelStore.getState().reset();

    useExploreStore.getState().reset();
    useFreeformStore.getState().reset();

    useDemoStore.getState().resetDemo();

    useUIStore.getState().setFreeformMode(false);
  };
}
