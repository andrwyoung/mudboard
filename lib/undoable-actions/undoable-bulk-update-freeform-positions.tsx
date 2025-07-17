import { useFreeformStore } from "@/store/freeform-store";
import { useUndoStore } from "@/store/undo-store";

type Update = {
  blockId: string;
  pos: { x: number; y: number };
};

export function bulkUpdateFreeformBlockPositionsWithUndo(
  sectionId: string,
  updates: Update[],
  label = "Move Blocks"
) {
  const store = useFreeformStore.getState();
  const prevPositions = updates.map(({ blockId }) => ({
    blockId,
    pos: {
      x: store.getBlockPosition(sectionId, blockId).x ?? 0,
      y: store.getBlockPosition(sectionId, blockId).y ?? 0,
    },
  }));

  // don't add if nothing changed
  const hasChanged = updates.some(({ blockId, pos }) => {
    const prev = store.getBlockPosition(sectionId, blockId);
    return (
      Math.round(prev?.x ?? 0) !== Math.round(pos.x) ||
      Math.round(prev?.y ?? 0) !== Math.round(pos.y)
    );
  });
  if (!hasChanged) return;

  // add to undo stack
  useUndoStore.getState().execute({
    label,
    do: () => {
      store.updateMultipleBlockPositions(sectionId, updates);
    },
    undo: () => {
      store.updateMultipleBlockPositions(sectionId, prevPositions);
    },
  });
}
