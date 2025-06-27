// this hook handles
// - marque tool
// - undo key
// - delete image key

import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { useSelectionStore } from "@/store/selection-store";
import { useOverlayStore } from "@/store/overlay-store";
import { useGetScope } from "../use-get-scope";
import { useUndoStore } from "@/store/undo-store";
import { deleteBlocksWithUndo } from "@/lib/undoable-actions/undoable-delete-blocks";
import { canEditBlock } from "@/lib/auth/can-edit-block";
import { Block } from "@/types/block-types";
import { useLayoutStore } from "@/store/layout-store";

export function useGlobalListeners({
  setMarqueRect,
}: {
  setMarqueRect: Dispatch<
    SetStateAction<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>
  >;
}) {
  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const currentScope = useSelectionStore((s) => s.currentScope);
  const deselectBlocks = useSelectionStore((s) => s.deselectBlocks);

  const { isOpen: galleryIsOpen } = useOverlayStore(useGetScope());

  const blockRectsRef = useRef<Map<string, DOMRect>>(new Map());

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
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlocks, deselectBlocks]);

  // this is the marque tool
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    function handleMouseDown(e: MouseEvent) {
      if (e.button !== 0) return; // only do left click

      const clickedId = (e.target as HTMLElement)
        .closest("[data-id]")
        ?.getAttribute("data-id");
      if (
        clickedId?.includes("::block-") ||
        clickedId === "context-menu" ||
        clickedId === "pinned-panel-dropzone"
      )
        return;
      deselectBlocks();

      startX = e.clientX;
      startY = e.clientY;
      isDragging = true;

      blockRectsRef.current = new Map();
      document.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
        const id = el.dataset.id;
        if (id?.includes("main::block-")) {
          // only select main::blocks
          blockRectsRef.current.set(id, el.getBoundingClientRect());
        }
      });

      document.body.classList.add("select-none");
    }

    function handleMouseMove(e: MouseEvent) {
      if (!isDragging) return;

      const x = Math.min(e.clientX, startX);
      const y = Math.min(e.clientY, startY);
      const width = Math.abs(e.clientX - startX);
      const height = Math.abs(e.clientY - startY);

      setMarqueRect({ x, y, width, height });

      const marqueeBounds = new DOMRect(x, y, width, height);
      const blocksInBoundsMap: Record<string, Block> = {};
      for (const [id, rect] of blockRectsRef.current.entries()) {
        const intersects =
          rect.right > marqueeBounds.left &&
          rect.left < marqueeBounds.right &&
          rect.bottom > marqueeBounds.top &&
          rect.top < marqueeBounds.bottom;

        if (intersects) {
          const blockId = id.split("::block-")[1];
          const block = useLayoutStore
            .getState()
            .positionedBlockMap.get(blockId)?.block;
          if (block) {
            blocksInBoundsMap[blockId] = block;
          }
        }
      }

      // Then select these blocks
      useSelectionStore
        .getState()
        .setSelectedBlocks(
          "main",
          blocksInBoundsMap,
          Object.values(blocksInBoundsMap).at(-1) ?? null
        );
    }

    function handleMouseUp(e: MouseEvent) {
      if (!isDragging) return;
      isDragging = false;

      setMarqueRect(null);
      document.body.classList.remove("select-none");
    }

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [deselectBlocks]);
}
