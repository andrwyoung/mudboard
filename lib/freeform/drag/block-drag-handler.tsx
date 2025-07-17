import { useFreeformStore } from "@/store/freeform-store";
import { useSelectionStore } from "@/store/selection-store";
import { useUndoStore } from "@/store/undo-store";
import { Block } from "@/types/block-types";

const CLICK_THRESHOLD = 4;
export function useBlockDragHandler({
  selectedBlock,
  isSelected,
  sectionId,
  camera,
  editMode,
  spacebarDown,
}: {
  selectedBlock: Block;
  isSelected: boolean;
  sectionId: string;
  camera: { x: number; y: number; scale: number };
  editMode: boolean;
  spacebarDown: boolean;
}) {
  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return; // only respond to left-click
    if (!editMode || (editMode && spacebarDown)) return;

    const startMouse = { x: e.clientX, y: e.clientY };
    let isDragging = false;
    let internalMouseTracker = { ...startMouse };

    const isCtrlClick = e.ctrlKey || e.metaKey;
    const store = useSelectionStore.getState();

    // clicking behavior
    if (isCtrlClick) {
      const alreadySelected = !!store.selectedBlocks[selectedBlock.block_id];
      if (alreadySelected) {
        store.removeBlockFromSelection(selectedBlock);
      } else {
        store.addBlocksToSelection("main", [selectedBlock]);
      }
    } else if (!isSelected) {
      useSelectionStore.getState().selectOnlyThisBlock("main", selectedBlock);
      useFreeformStore
        .getState()
        .setPositionForBlock(sectionId, selectedBlock.block_id, () => ({
          z: useFreeformStore.getState().getAndIncrementZIndex(sectionId),
        }));
    }

    const selectedBlocks = useSelectionStore.getState().selectedBlocks;

    // track for undo behavior
    const originalPositions = Object.entries(selectedBlocks).map(([id]) => ({
      blockId: id,
      pos: {
        x: useFreeformStore.getState().getBlockPosition(sectionId, id).x ?? 0,
        y: useFreeformStore.getState().getBlockPosition(sectionId, id).y ?? 0,
      },
    }));

    function onMouseMove(e: MouseEvent) {
      // determine whether this is a drag or a click
      if (!isDragging) {
        const dxFromStart = e.clientX - startMouse.x;
        const dyFromStart = e.clientY - startMouse.y;

        const dist = Math.sqrt(
          dxFromStart * dxFromStart + dyFromStart * dyFromStart
        );
        if (dist > CLICK_THRESHOLD) {
          // toast.success("turned to drag now");
          isDragging = true;
        }

        return;
      }

      // past here: dragging behavior
      const dx = e.clientX - internalMouseTracker.x;
      const dy = e.clientY - internalMouseTracker.y;

      internalMouseTracker = { x: e.clientX, y: e.clientY };

      const selected = useSelectionStore.getState().selectedBlocks;
      for (const id in selected) {
        useFreeformStore
          .getState()
          .setPositionForBlock(sectionId, id, (prev) => ({
            x: (prev?.x ?? 0) + dx / camera.scale,
            y: (prev?.y ?? 0) + dy / camera.scale,
          }));
      }
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      if (!isDragging) {
        if (!isCtrlClick) {
          const selectedCount = Object.keys(store.selectedBlocks).length;

          // if more than 1 is selected, or it's not selected, then only select this one
          if (isSelected && selectedCount > 1) {
            store.selectOnlyThisBlock("main", selectedBlock);
            useFreeformStore
              .getState()
              .setPositionForBlock(sectionId, selectedBlock.block_id, () => ({
                z: useFreeformStore.getState().getAndIncrementZIndex(sectionId),
              }));
          }
        }
      } else {
        //
        // log it into the UNDO stack
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

        console.log(
          "adding to undo stack: ",
          originalPositions,
          "new: ",
          newPositions
        );

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
