import { useCallback, useEffect, useRef } from "react";
import { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { Block } from "@/types/block-types";

type UseGalleryHandlersProps = {
  columns: Block[][];
  blockMap: Map<string, { colIndex: number; blockIndex: number }>;
  updateColumns: (fn: (prev: Block[][]) => Block[][]) => void;
  setDraggedBlock: (img: Block | null) => void;
  overId: string | null;
  setOverId: (id: string | null) => void;
  setSelectedBlocks: React.Dispatch<
    React.SetStateAction<Record<string, Block>>
  >;
  initialPointerYRef: React.RefObject<number | null>;
};

export function useGalleryHandlers({
  columns,
  blockMap,
  updateColumns,
  setDraggedBlock,
  overId,
  setOverId,
  setSelectedBlocks,
  initialPointerYRef,
}: UseGalleryHandlersProps) {
  // caching for handleDragMove
  const blockRectsRef = useRef<Map<string, DOMRect>>(new Map());
  const overIdRef = useRef<string | null>(null);

  useEffect(() => {
    overIdRef.current = overId;
  }, [overId]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      document.body.classList.add("cursor-grabbing");
      setSelectedBlocks({});

      // cache blockRefs map so move doesn't have to recompute
      blockRectsRef.current = new Map();
      document.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
        const id = el.dataset.id;
        if (id) {
          blockRectsRef.current.set(id, el.getBoundingClientRect());
        }
      });

      const { active, activatorEvent } = event;
      const pos = blockMap.get(active.id.toString());
      if (pos) {
        const activeImage = columns[pos.colIndex]?.[pos.blockIndex];
        if (activeImage) {
          setDraggedBlock(activeImage);
        }
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

      const rect = blockRectsRef.current.get(over.id.toString());
      if (!rect) return;

      const pos = blockMap.get(String(over.id));
      if (!pos) return;

      const startY = initialPointerYRef.current;
      if (startY == null) return;

      const currentPointerY = startY + delta.y;
      const middleY = rect.top + rect.height / 2;

      const dropId =
        currentPointerY < middleY
          ? `drop-${pos.colIndex}-${pos.blockIndex}`
          : `drop-${pos.colIndex}-${pos.blockIndex + 1}`;

      if (dropId !== overIdRef.current) {
        setOverId(dropId);
      }
    },
    [blockMap, setOverId]
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

      updateColumns((prev) => {
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
      });

      setOverId(null);
    },
    [blockMap, overId, updateColumns, setDraggedBlock]
  );

  const handleItemClick = useCallback(
    (block: Block, event: React.MouseEvent<Element, MouseEvent>) => {
      console.log("Clicked? ", event, block);

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
