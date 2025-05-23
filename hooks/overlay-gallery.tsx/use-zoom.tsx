import { useCallback, useEffect } from "react";

export function useCenteredZoom(
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
  initialSize: { width: number; height: number } | null,
  zoomLevel: number,
  setZoomLevel: (z: number) => void
) {
  const zoomAtCenter = useCallback(
    (zoomFn: (prev: number) => number) => {
      const container = scrollContainerRef.current;
      if (!container || !initialSize) return;

      const prevZoom = zoomLevel;
      const newZoom = zoomFn(prevZoom);
      if (newZoom === prevZoom) return;

      const rect = container.getBoundingClientRect();
      const centerX = container.scrollLeft + rect.width / 2;
      const centerY = container.scrollTop + rect.height / 2;
      const ratio = newZoom / prevZoom;

      setZoomLevel(newZoom);

      // Adjust scroll so center stays in view
      requestAnimationFrame(() => {
        container.scrollLeft = centerX * ratio - rect.width / 2;
        container.scrollTop = centerY * ratio - rect.height / 2;
      });
    },
    [zoomLevel, initialSize]
  );

  const zoomIn = useCallback(() => {
    zoomAtCenter((z) => Math.min(z + 0.1, 3));
  }, [zoomAtCenter]);

  const zoomOut = useCallback(() => {
    zoomAtCenter((z) => Math.max(z - 0.1, 0.1));
  }, [zoomAtCenter]);
  const resetZoom = () => setZoomLevel(1);

  // scroll wheel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? -1 : 1; // up = zoom in, down = zoom out

        if (direction > 0) zoomIn();
        else zoomOut();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [zoomIn, zoomOut]);

  return { zoomIn, zoomOut, resetZoom };
}
