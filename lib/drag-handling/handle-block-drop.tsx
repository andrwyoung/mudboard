import { getMovingItem } from "@/hooks/use-drag-handlers";
import { Block } from "@/types/block-types";
import { SectionColumns } from "@/types/board-types";

export function handleBlockDrop({
  activeId,
  blockMap,
  sectionColumns,
  updateSections,
  insertIndex,
  toColumnIndex,
  toSectionId,
}: {
  activeId: string;
  blockMap: Map<
    string,
    { sectionId: string; colIndex: number; blockIndex: number }
  >;
  sectionColumns: SectionColumns;
  updateSections: (
    updates: Record<string, (prev: Block[][]) => Block[][]>
  ) => void;
  insertIndex: number;
  toColumnIndex: number;
  toSectionId: string;
}) {
  console.log("toColumnIndex: ", toColumnIndex, " insertIndex: ", insertIndex);

  const result = getMovingItem(activeId, blockMap, sectionColumns);
  if (!result) return;

  const {
    item: movingItem,
    fromSectionId,
    fromColumnIndex,
    movingItemIndex,
  } = result;

  // No movement
  if (
    fromSectionId === toSectionId &&
    fromColumnIndex === toColumnIndex &&
    (movingItemIndex === insertIndex || movingItemIndex === insertIndex - 1)
  ) {
    return;
  }

  if (fromSectionId === toSectionId) {
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
      [fromSectionId]: (prev) => {
        const cols = [...prev];
        const fromCol = [...cols[fromColumnIndex]];

        fromCol.splice(movingItemIndex, 1);
        cols[fromColumnIndex] = fromCol;
        return cols;
      },
      [toSectionId]: (prev) => {
        const cols = [...prev];
        const toCol = [...cols[toColumnIndex]];
        const insertAt = Math.min(insertIndex, toCol.length);

        toCol.splice(insertAt, 0, {
          ...movingItem,
          section_id: toSectionId,
        });
        cols[toColumnIndex] = toCol;
        return cols;
      },
    });
  }
}
