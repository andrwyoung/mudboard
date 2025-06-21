// reset all info. used whenever we want to go to a new board

import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";
import { usePinnedStore } from "@/store/use-pinned-store";

export function useResetState() {
  return () => {
    useLayoutStore.getState().clearAll();
    useMetadataStore.getState().clearAll();
    usePinnedStore.getState().reset();
  };
}
