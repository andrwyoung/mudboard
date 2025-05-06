import { useCallback, useState } from "react";
import { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { Block, MudboardImage } from "@/types/image-type";

type UseGalleryHandlersProps = {
  columns: Block[][];
  blockMap: Map<string, { colIndex: number; blockIndex: number }>;
  setColumns: React.Dispatch<React.SetStateAction<Block[][]>>;
  setDraggedBlock: (img: Block | null) => void;
  overId: string | null;
  setOverId: (id: string | null) => void;
  setSelectedBlocks: React.Dispatch<
    React.SetStateAction<Record<string, Block>>
  >;
  initialPointerYRef: React.RefObject<number | null>;
  layoutDirtyRef: React.RefObject<boolean>;
};

export function useGalleryHandlers({
  columns,
  blockMap,
  setColumns,
  setDraggedBlock,
  overId,
  setOverId,
  setSelectedBlocks,
  initialPointerYRef,
  layoutDirtyRef,
}: UseGalleryHandlersProps) {
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      document.body.classList.add("cursor-grabbing");
      setSelectedBlocks({});

      const { active, activatorEvent } = event;
      const activeImage = columns
        .flat()
        .find((block) => block.block_id === active.id);
      if (activeImage) {
        console.log("activeImage: ", activeImage);
        setDraggedBlock(activeImage);
      }

      if (activatorEvent instanceof MouseEvent) {
        initialPointerYRef.current = activatorEvent.clientY;
      } else if (activatorEvent instanceof TouchEvent) {
        initialPointerYRef.current = activatorEvent.touches[0]?.clientY ?? null;
      }
    },
    [columns]
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const { delta, over } = event;

      if (!over) {
        setOverId(null);
        return;
      }

      if (initialPointerYRef.current !== null) {
        const currentPointerY = initialPointerYRef.current + delta.y;

        const overIdStr = String(over.id);

        const overElement = document.querySelector(`[data-id="${over.id}"]`);
        // console.log("over: ", overIdStr);
        if (overElement) {
          // determine which drag indicator to show

          // look up position
          const pos = blockMap.get(String(over.id));
          if (pos && overElement) {
            const { colIndex, blockIndex } = pos;

            const rect = overElement.getBoundingClientRect();
            const middleY = rect.top + rect.height / 2;
            const currentPointerY = initialPointerYRef.current + delta.y;

            const dropId =
              currentPointerY < middleY
                ? `drop-${colIndex}-${blockIndex}`
                : `drop-${colIndex}-${blockIndex + 1}`;

            setOverId(dropId);
            return;
          }

          // fallback
          setOverId(String(over.id));
        }
      }
    },
    [blockMap]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      document.body.classList.remove("cursor-grabbing");

      setDraggedBlock(null);
      initialPointerYRef.current = null;

      const { active } = event;
      const activeId = active.id.toString();

      const dropMatch = String(overId).match(/^drop-(\d+)-(\d+)$/);
      if (!dropMatch) return;

      const toColumnIndex = Number(dropMatch[1]);
      const insertIndex = Number(dropMatch[2]);
      console.log(
        "toColumnIndex: ",
        toColumnIndex,
        " insertIndex: ",
        insertIndex
      );

      const fromPos = blockMap.get(activeId);
      if (!fromPos) return;

      const fromColumnIndex = fromPos.colIndex;
      const movingItemIndex = fromPos.blockIndex;

      // No movement
      if (
        fromColumnIndex === toColumnIndex &&
        (movingItemIndex === insertIndex || movingItemIndex === insertIndex - 1)
      ) {
        setOverId(null);
        return;
      }

      setColumns((prev) => {
        const updated = [...prev];
        const fromCol = [...updated[fromColumnIndex]];

        // remove the item
        const [movingItem] = fromCol.splice(movingItemIndex, 1);

        // if dragged to same column
        if (fromColumnIndex === toColumnIndex) {
          let adjustedInsertIndex = insertIndex;

          // if it's moved downward, then offset the index to account for deletion
          if (insertIndex > movingItemIndex) {
            adjustedInsertIndex -= 1;
          }

          fromCol.splice(adjustedInsertIndex, 0, movingItem);
          updated[fromColumnIndex] = fromCol;
          return updated;
        }

        // different column behavior
        const toCol = [...updated[toColumnIndex]];
        const insertAt = Math.min(insertIndex, toCol.length);
        toCol.splice(insertAt, 0, movingItem);

        updated[fromColumnIndex] = fromCol;
        updated[toColumnIndex] = toCol;

        return updated;
      });

      layoutDirtyRef.current = true; // trigger a sync
      setOverId(null);
    },
    [blockMap, overId, setColumns, setDraggedBlock]
  );

  const handleItemClick = useCallback(
    (block: Block, event: React.MouseEvent<Element, MouseEvent>) => {
      if (event.detail === 2) {
        console.log("Double clicked:", block);
        return;
      }

      setSelectedBlocks((prevSelected) => {
        const newSelected = { ...prevSelected };

        if (event.metaKey || event.ctrlKey) {
          if (newSelected[block.block_id]) {
            delete newSelected[block.block_id];
          } else {
            newSelected[block.block_id] = block;
          }
          return newSelected;
        } else {
          if (
            newSelected[block.block_id] &&
            Object.entries(newSelected).length === 1
          ) {
            return {};
          }
          return { [block.block_id]: block };
        }
      });
    },
    []
  );

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleItemClick,
  };
}
