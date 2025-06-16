// this hook handles all the global keyboard shortcuts
// and also the listener that detects when to deselect an image

import { useEffect } from "react";
import { useSelectionStore } from "@/store/selection-store";
import { useOverlayStore } from "@/store/overlay-store";
import { useGetScope } from "../use-get-scope";
import { useUndoStore } from "@/store/undo-store";
import { deleteBlocksWithUndo } from "@/lib/undoable-actions/undoable-delete-blocks";

export function useBoardListeners() {
  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const deselectBlocks = useSelectionStore((s) => s.deselectBlocks);

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

      // // ZOOM IN/OUT
      // if (e.ctrlKey || e.metaKey) {
      //   if (e.key === "=" || e.key === "+") {
      //     setNumCols(Math.max(MIN_COLUMNS, numCols - 1));
      //     return;
      //   }

      //   if (e.key === "-" || e.key === "_") {
      //     setNumCols(Math.min(MAX_COLUMNS, numCols + 1));
      //     return;
      //   }
      // }

      // DELETES
      if (e.key === "Backspace" || e.key === "Delete") {
        const blocksToDelete = Object.values(selectedBlocks);
        if (blocksToDelete.length > 0) {
          deleteBlocksWithUndo(blocksToDelete);
        }
      }

      // UNDO
      const isUndo = (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "z";
      const isRedoMac = e.metaKey && e.shiftKey && e.key === "z";
      const isRedoWin = e.ctrlKey && e.key === "y";
      if (isUndo) {
        e.preventDefault();
        useUndoStore.getState().undo();
      } else if (isRedoMac || isRedoWin) {
        e.preventDefault();
        useUndoStore.getState().redo();
      }

      if (e.key === "Escape") {
        if (galleryIsOpen) return;
        deselectBlocks();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlocks, deselectBlocks]);

  // Click outside to deselect
  useEffect(() => {
    function handleGlobalClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const clickedId = target.closest("[data-id]")?.getAttribute("data-id");
      const rawId = clickedId?.split("::")[1];

      const isBlockItem = clickedId?.includes("::block-");
      const isContextMenu = clickedId === "context-menu";

      if (!isBlockItem && !isContextMenu) {
        deselectBlocks();
      }
    }

    document.body.addEventListener("click", handleGlobalClick);
    return () => document.body.removeEventListener("click", handleGlobalClick);
  }, [deselectBlocks]);
}
