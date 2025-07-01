import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useSelectionStore } from "@/store/selection-store";
import { Block } from "@/types/block-types";
import { useLayoutStore } from "@/store/layout-store";

export function useTextMarque({
  setMarqueRect,
  getMarqueTargets,
}: {
  setMarqueRect: Dispatch<
    SetStateAction<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>
  >;
  getMarqueTargets: () => HTMLElement[];
}): { highlightedIndexes: string[] } {
  const blockRectsRef = useRef<Map<string, DOMRect>>(new Map());

  const [highlightedIndexes, setHighlightedIndexes] = useState<string[]>([]);

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

      startX = e.clientX;
      startY = e.clientY;
      isDragging = true;

      blockRectsRef.current = new Map();
      getMarqueTargets().forEach((el, i) => {
        const id =
          el.dataset.id || el.getAttribute("data-marque-id") || `marque-${i}`;
        blockRectsRef.current.set(id, el.getBoundingClientRect());
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
      const active: string[] = [];

      for (const [id, rect] of blockRectsRef.current.entries()) {
        const intersects =
          rect.right > marqueeBounds.left &&
          rect.left < marqueeBounds.right &&
          rect.bottom > marqueeBounds.top &&
          rect.top < marqueeBounds.bottom;

        if (intersects) active.push(id);
      }

      setHighlightedIndexes([]);
    }

    function handleMouseUp(e: MouseEvent) {
      if (!isDragging) return;
      isDragging = false;

      setMarqueRect(null);
      setHighlightedIndexes([]);
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
  }, []);

  return { highlightedIndexes };
}
