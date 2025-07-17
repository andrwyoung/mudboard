import { useFreeformStore } from "@/store/freeform-store";
import { useSelectionStore } from "@/store/selection-store";
import { useUndoStore } from "@/store/undo-store";

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

    // UNDO stack
    const selectedBlocks = useSelectionStore.getState().selectedBlocks;
    const originalPositions = Object.entries(selectedBlocks).map(([id]) => ({
      blockId: id,
      pos: {
        x: useFreeformStore.getState().getBlockPosition(sectionId, id).x ?? 0,
        y: useFreeformStore.getState().getBlockPosition(sectionId, id).y ?? 0,
      },
    }));

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
      } else {
        //
        // UNDO behavior

        const newPositions = originalPositions.map(({ blockId }) => ({
          blockId,
          pos: {
            x:
              useFreeformStore.getState().getBlockPosition(sectionId, blockId)
                .x ?? 0,
            y:
              useFreeformStore.getState().getBlockPosition(sectionId, blockId)
                .y ?? 0,
          },
        }));

        useUndoStore.getState().execute({
          label: "Move Blocks",
          do: () => {
            useFreeformStore
              .getState()
              .updateMultipleBlockPositions(sectionId, newPositions);
          },
          undo: () => {
            useFreeformStore
              .getState()
              .updateMultipleBlockPositions(sectionId, originalPositions);
          },
        });
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  return { handleMouseDown };
}
