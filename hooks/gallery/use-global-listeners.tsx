// this hook handles
// - marque tool
// - undo key
// - delete image key

import { useEffect } from "react";
import { useSelectionStore } from "@/store/selection-store";
import { useOverlayStore } from "@/store/overlay-store";
import { useGetScope } from "../use-get-scope";
import { useUndoStore } from "@/store/undo-store";
import { deleteBlocksWithUndo } from "@/lib/undoable-actions/undoable-delete-blocks";
import { canEditBlock } from "@/lib/auth/can-edit-block";
import { Block, MudboardImage } from "@/types/block-types";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/get-image-url";
import { copyImageToClipboard } from "@/lib/local-helpers/copy-image-to-clipboard";

export function useGlobalListeners() {
  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const currentScope = useSelectionStore((s) => s.currentScope);
  const deselectBlocks = useSelectionStore((s) => s.deselectBlocks);

  const { isOpen: galleryIsOpen } = useOverlayStore(useGetScope());

  // Keyboard controls
  useEffect(() => {
    async function handleKeyDown(e: KeyboardEvent) {
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
      if (currentScope === "main") {
        if (e.key === "Backspace" || e.key === "Delete") {
          const blocksToDelete = Object.values(selectedBlocks).filter((block) =>
            canEditBlock(block)
          );
          if (blocksToDelete.length > 0) {
            deleteBlocksWithUndo(blocksToDelete);
          }
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

      // COPY image
      const isCopy = (e.metaKey || e.ctrlKey) && e.key === "c";
      if (isCopy) {
        const selected: Block[] = Object.values(selectedBlocks).filter(
          (b) => b.block_type === "image" && b.data
        );

        if (selected.length === 0) {
          // Let default copy behavior run (e.g. copying text)
          return;
        }

        if (selected.length > 1) {
          toast.error("Only copying one image at a time is supported.");
          return;
        }

        const firstImageBlock = selected[0];
        const image = firstImageBlock.data as MudboardImage;
        const url = getImageUrl(image.image_id, image.file_ext, "full");
        await copyImageToClipboard(url);

        e.preventDefault(); // prevent default copy behavior if we handled it
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlocks, deselectBlocks]);
}
