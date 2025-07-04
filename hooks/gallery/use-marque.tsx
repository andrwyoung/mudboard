import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { useSelectionStore } from "@/store/selection-store";
import { Block } from "@/types/block-types";
import { useLayoutStore } from "@/store/layout-store";

export function useMarque({
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
  const blockRectsRef = useRef<Map<string, DOMRect>>(new Map());
  const deselectBlocks = useSelectionStore((s) => s.deselectBlocks);

  // this is the marque tool
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    function handleMouseDown(e: MouseEvent) {
      if (e.button !== 0) return; // only do left click

      const target = e.target as HTMLElement;

      if (target.closest("textarea, input")) return;

      const clickedId = target.closest("[data-id]")?.getAttribute("data-id");
      if (clickedId?.includes("::block-") || clickedId === "context-menu")
        return;
      deselectBlocks();

      if (
        !clickedId ||
        (clickedId !== "canvas" && !clickedId.includes("::col-"))
      )
        return;

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
