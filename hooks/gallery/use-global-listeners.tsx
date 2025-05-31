// this hook handles all the global keyboard shortcuts
// and also the listener that detects when to deselect an image

import { useEffect } from "react";
import { softDeleteBlocks } from "@/lib/db-actions/soft-delete-blocks";
import { useSelectionStore } from "@/store/selection-store";
import { useOverlayStore } from "@/store/overlay-store";
import { useGetScope } from "../use-get-scope";
import { useUIStore } from "@/store/ui-store";
import { MAX_COLUMNS, MIN_COLUMNS } from "@/types/constants";

export function useBoardListeners() {
  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const deselectBlocks = useSelectionStore((s) => s.deselectBlocks);

  const setNumCols = useUIStore((s) => s.setNumCols);
  const numCols = useUIStore((s) => s.numCols);
  const { isOpen: galleryIsOpen } = useOverlayStore(useGetScope());

  // Keyboard controls
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable);

      if (isTyping) return;

      // Early intercept Ctrl/Meta + Plus/Minus
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "-" || e.key === "=" || e.key === "_")
      ) {
        e.preventDefault();
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          setNumCols(Math.max(MIN_COLUMNS, numCols - 1));
          return;
        }

        if (e.key === "-" || e.key === "_") {
          setNumCols(Math.min(MAX_COLUMNS, numCols + 1));
          return;
        }
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        const blocksToDelete = Object.values(selectedBlocks);
        if (blocksToDelete.length > 0) {
          softDeleteBlocks(blocksToDelete);
        }
      }

      if (e.key === "Escape") {
        if (galleryIsOpen) return;
        deselectBlocks();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlocks, deselectBlocks, setNumCols, numCols]);

  // Click outside to deselect
  useEffect(() => {
    function handleGlobalClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const clickedId = target.closest("[data-id]")?.getAttribute("data-id");
      const rawId = clickedId?.split("::")[1];

      if (
        !rawId ||
        rawId.startsWith("drop-") ||
        rawId.startsWith("col-") ||
        rawId.startsWith("section-")
      ) {
        deselectBlocks();
      }
    }

    document.body.addEventListener("click", handleGlobalClick);
    return () => document.body.removeEventListener("click", handleGlobalClick);
  }, [deselectBlocks]);
}
