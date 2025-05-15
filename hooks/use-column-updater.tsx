import { useLayoutStore } from "@/store/layout-store";
import { Block } from "@/types/block-types";

export function useColumnUpdater(
  setter: React.Dispatch<React.SetStateAction<Block[][]>>
) {
  return (fn: (prev: Block[][]) => Block[][]) => {
    useLayoutStore.getState().setLayoutDirty(true);
    setter(fn);
  };
}
