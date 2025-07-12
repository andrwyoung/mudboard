import { useFreeformStore } from "@/store/freeform-store";
import { mainCanvasRef } from "@/store/ui-store";
import {
  MAX_ZOOM,
  MIN_ZOOM,
  SCROLL_ZOOM_FACTOR,
  ZOOM_FACTOR,
} from "@/types/constants";

export function useCanvasZoom(sectionId: string) {
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const camera = useFreeformStore.getState().getCamera(sectionId);
    const setCameraForSection = useFreeformStore.getState().setCameraForSection;

    const rect = mainCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - camera.x) / camera.scale;
    const worldY = (mouseY - camera.y) / camera.scale;

    const zoomFactor =
      e.deltaY < 0 ? SCROLL_ZOOM_FACTOR : 1 / SCROLL_ZOOM_FACTOR;
    const newScale = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, camera.scale * zoomFactor)
    );

    const newCameraX = mouseX - worldX * newScale;
    const newCameraY = mouseY - worldY * newScale;

    setCameraForSection(sectionId, {
      x: newCameraX,
      y: newCameraY,
      scale: newScale,
    });
  }

  function zoomCameraCentered(direction: "in" | "out") {
    const camera = useFreeformStore.getState().getCamera(sectionId);
    const setCameraForSection = useFreeformStore.getState().setCameraForSection;

    const rect = mainCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const { width, height } = rect;
    const centerX = width / 2;
    const centerY = height / 2;

    const worldX = (centerX - camera.x) / camera.scale;
    const worldY = (centerY - camera.y) / camera.scale;

    const factor = direction === "in" ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    const newScale = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, camera.scale * factor)
    );

    const newX = centerX - worldX * newScale;
    const newY = centerY - worldY * newScale;

    setCameraForSection(sectionId, { x: newX, y: newY, scale: newScale });
  }

  return { onWheel, zoomCameraCentered };
}
