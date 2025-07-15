import { useFreeformStore } from "@/store/freeform-store";
import { useSelectionStore } from "@/store/selection-store";

const CLICK_THRESHOLD = 4;

export function useMultiBlockDragHandler({
  sectionId,
  camera,
  editMode,
  spacebarDown,
}: {
  sectionId: string;
  camera: { x: number; y: number; scale: number };
  editMode: boolean;
  spacebarDown: boolean;
}) {
  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0 || !editMode || spacebarDown) return;

    const startMouse = { x: e.clientX, y: e.clientY };
    let isDragging = false;
    let internalMouseTracker = { ...startMouse };

    function onMouseMove(e: MouseEvent) {
      const dxFromStart = e.clientX - startMouse.x;
      const dyFromStart = e.clientY - startMouse.y;
      const dist = Math.sqrt(dxFromStart ** 2 + dyFromStart ** 2);

      if (!isDragging && dist > CLICK_THRESHOLD) {
        isDragging = true;
      }

      if (!isDragging) return;

      const dx = (e.clientX - internalMouseTracker.x) / camera.scale;
      const dy = (e.clientY - internalMouseTracker.y) / camera.scale;
      internalMouseTracker = { x: e.clientX, y: e.clientY };

      const selected = useSelectionStore.getState().selectedBlocks;

      for (const id in selected) {
        useFreeformStore
          .getState()
          .setPositionForBlock(sectionId, id, (prev) => ({
            x: (prev?.x ?? 0) + dx,
            y: (prev?.y ?? 0) + dy,
          }));
      }
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      if (!isDragging) {
        useSelectionStore.getState().deselectBlocks();
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  return { handleMouseDown };
}
