import { useFreeformStore } from "@/store/freeform-store";
import { canvasRef } from "@/store/ui-store";

export function useCanvasZoom(sectionId: string) {
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const camera = useFreeformStore.getState().getCamera(sectionId);
    const setCameraForSection = useFreeformStore.getState().setCameraForSection;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - camera.x) / camera.scale;
    const worldY = (mouseY - camera.y) / camera.scale;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const newScale = Math.max(0.01, Math.min(6, camera.scale * zoomFactor));

    const newCameraX = mouseX - worldX * newScale;
    const newCameraY = mouseY - worldY * newScale;

    setCameraForSection(sectionId, {
      x: newCameraX,
      y: newCameraY,
      scale: newScale,
    });
  }

  return { onWheel };
}
