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
  initialPointerYRef: React.MutableRefObject<number | null>;
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
}: UseGalleryHandlersProps) {
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      document.body.classList.add("cursor-grabbing");
      setSelectedBlocks({});

      const { active, activatorEvent } = event;
      const activeImage = columns
        .flat()
        .find((block) => block.id === active.id);
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

      console.log("drag ended. overId: ", overId);

      setDraggedBlock(null);
      initialPointerYRef.current = null;

      const { active } = event;

      const activeId = active.id;
      if (activeId === overId) return;

      // we always rely on overId to figure out where we drop it
      const dropMatch = String(overId).match(/^drop-(\d+)-(\d+)$/);
      if (!dropMatch) return;

      const toColumnIndex = Number(dropMatch[1]);
      const insertIndex = Number(dropMatch[2]);

      const fromColumnIndex = columns.findIndex((col) =>
        col.some((block) => block.id === activeId)
      );
      if (fromColumnIndex === -1 || toColumnIndex === -1) return;

      setColumns((prev) => {
        const updated = [...prev];
        const fromCol = [...updated[fromColumnIndex]];
        const toCol = [...updated[toColumnIndex]];

        const movingItemIndex = fromCol.findIndex(
          (block) => block.id === activeId
        );
        if (movingItemIndex === -1) return prev;

        const [movingItem] = fromCol.splice(movingItemIndex, 1);

        toCol.splice(insertIndex, 0, movingItem);

        updated[fromColumnIndex] = fromCol;
        updated[toColumnIndex] = toCol;

        return updated;
      });
      setOverId(null);
    },
    [columns, overId]
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
          if (newSelected[block.id]) {
            delete newSelected[block.id];
          } else {
            newSelected[block.id] = block;
          }
          return newSelected;
        } else {
          if (
            newSelected[block.id] &&
            Object.entries(newSelected).length === 1
          ) {
            return {};
          }
          return { [block.id]: block };
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
