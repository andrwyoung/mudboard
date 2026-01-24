// this is a helper function used by use-drag-handlers.tsx
// when you drop a block over a block
// it's mainly just all the math needed for recalculating a block's position

import { Block } from "@/types/block-types";
import { PositionedBlock } from "@/types/sync-types";

export async function handleBlockDrop({
  activeBlockWithPos,
  updateSections,
  insertIndex,
  toColumnIndex,
  toSectionId,
}: {
  activeBlockWithPos: PositionedBlock;
  updateSections: (
    updates: Record<string, (prev: Block[][]) => Block[][]>
  ) => void;
  insertIndex: number;
  toColumnIndex: number;
  toSectionId: string;
}) {
  console.log("toColumnIndex: ", toColumnIndex, " insertIndex: ", insertIndex);

  const {
    block: movingBlock,
    sectionId: fromSectionId,
    colIndex: fromColumnIndex,
    rowIndex: movingItemIndex,
  } = activeBlockWithPos;

  // No movement
  if (
    fromSectionId === toSectionId &&
    fromColumnIndex === toColumnIndex &&
    (movingItemIndex === insertIndex || movingItemIndex === insertIndex - 1)
  ) {
    return;
  }

  if (fromSectionId === toSectionId) {
    // note that we don't need to worry about clones yet (might implement later)

    updateSections({
      [fromSectionId]: (prev) => {
        const fromCol = [...prev[fromColumnIndex]];
        const [movingItem] = fromCol.splice(movingItemIndex, 1); // remove the item

        // if dragged to same column
        if (fromColumnIndex === toColumnIndex) {
          let adjustedInsertIndex = insertIndex;

          // if it's moved downward, then offset the index to account for deletion
          if (insertIndex > movingItemIndex) {
            adjustedInsertIndex -= 1;
          }

          fromCol.splice(adjustedInsertIndex, 0, movingItem);

          // return the new array only with modified column changed
          return prev.map((col, i) => (i === fromColumnIndex ? fromCol : col));
        }

        // different column behavior
        const toCol = [...prev[toColumnIndex]];
        const insertAt = Math.min(insertIndex, toCol.length);
        toCol.splice(insertAt, 0, movingItem);

        return prev.map((col, i) => {
          if (i === fromColumnIndex) return fromCol;
          if (i === toColumnIndex) return toCol;
          return col;
        });
      },
    });
  } else {
    updateSections({
      // STEP 1: remove from the current section
      [fromSectionId]: (prev) => {
        const cols = [...prev];
        const fromCol = [...cols[fromColumnIndex]];

        fromCol.splice(movingItemIndex, 1);
        cols[fromColumnIndex] = fromCol;
        return cols;
      },

      // STEP 2: then add to the real section
      [toSectionId]: (prev) => {
        const cols = [...prev];
        const toCol = [...cols[toColumnIndex]];
        const insertAt = Math.min(insertIndex, toCol.length);

        toCol.splice(insertAt, 0, {
          ...movingBlock,
          section_id: toSectionId,
        });
        cols[toColumnIndex] = toCol;
        return cols;
      },
    });
  }
}
