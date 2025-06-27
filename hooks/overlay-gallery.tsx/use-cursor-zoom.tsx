// the better use-center-zoom.tsx

import { MAX_FOCUS_ZOOM, PINNED_IMAGE_PADDING } from "@/types/constants";
import { useCallback, useEffect } from "react";

export function useCursorZoom(
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
  zoomLevel: number,
  setZoomLevel: (z: number) => void
) {
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
    };

    container.addEventListener("wheel", preventScroll, { passive: false });
    return () => container.removeEventListener("wheel", preventScroll);
  }, []);

  const zoomAtCursor = useCallback(
    (delta: number, clientX: number, clientY: number) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollLeft = container.scrollLeft;
      const scrollTop = container.scrollTop;

      // Cursor position relative to scroll content
      const cursorX = clientX + scrollLeft;
      const cursorY = clientY + scrollTop;

      console.log("📌 Zoom Debug:");
      console.log("clientX, clientY →", clientX, clientY);
      console.log("rect.left, rect.top →", rect.left, rect.top);
      console.log("scrollLeft, scrollTop →", scrollLeft, scrollTop);
      console.log("→ cursorX, cursorY (content coords)", cursorX, cursorY);

      const nextZoom = Math.max(
        0.1,
        Math.min(zoomLevel + delta, MAX_FOCUS_ZOOM)
      );
      if (nextZoom === zoomLevel) return;

      const zoomRatio = nextZoom / zoomLevel;
      setZoomLevel(nextZoom);

      requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const containerX = clientX - rect.left;
        const containerY = clientY - rect.top;

        // Adjust for known fixed padding
        const relativeX =
          containerX + container.scrollLeft - PINNED_IMAGE_PADDING;
        const relativeY =
          containerY + container.scrollTop - PINNED_IMAGE_PADDING;

        const dx = relativeX * (zoomRatio - 1);
        const dy = relativeY * (zoomRatio - 1);

        container.scrollLeft += dx;
        container.scrollTop += dy;
      });
    },
    [zoomLevel]
  );

  const resetZoom = () => setZoomLevel(1);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Control zoom sensitivity
      const delta = -e.deltaY * 0.001; // You can tweak this constant
      zoomAtCursor(delta, e.clientX, e.clientY);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [zoomAtCursor]);

  return { resetZoom };
}
