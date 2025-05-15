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
        const cols = [...prev];
        const fromCol = [...cols[fromColumnIndex]];
        const movingItem = fromCol[movingItemIndex];

        // Remove the item first
        fromCol.splice(movingItemIndex, 1);

        // Adjust insert index if necessary
        let adjustedInsertIndex = insertIndex;
        if (
          fromColumnIndex === toColumnIndex &&
          insertIndex > movingItemIndex
        ) {
          adjustedInsertIndex -= 1;
        }

        // Insert into correct place
        const toCol = [...cols[toColumnIndex]];
        const insertAt = Math.min(adjustedInsertIndex, toCol.length);
        toCol.splice(insertAt, 0, movingItem);

        cols[fromColumnIndex] = fromCol;
        cols[toColumnIndex] = toCol;

        return cols;
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
