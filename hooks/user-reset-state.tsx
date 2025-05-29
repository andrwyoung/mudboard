import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";

export function useResetState() {
  return () => {
    useLayoutStore.getState().clearAll();
    useMetadataStore.getState().clearAll();
  };
}
