// /hooks/use-board-listeners.ts
import { useEffect } from "react";
import { softDeleteBlocks } from "@/lib/db-actions/soft-delete-blocks";
import { useSelectionStore } from "@/store/selection-store";
import { useUIStore } from "@/store/ui-store";
import { useOverlayStore } from "@/store/overlay-store";
import { useIsMirror } from "@/app/b/[boardId]/board";
import { useGetScope } from "./use-get-scope";

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
  }, [selectedBlocks, deselectBlocks]);

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
