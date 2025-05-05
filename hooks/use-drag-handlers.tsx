import { useCallback } from "react";
import { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { Block, MudboardImage } from "@/types/image-type";

type UseGalleryHandlersProps = {
  columns: Block[][];
  setColumns: React.Dispatch<React.SetStateAction<Block[][]>>;
  setDraggedBlock: (img: Block | null) => void;
  setOverId: (id: string | null) => void;
  setPlacement: (val: "above" | "below") => void;
  setSelectedBlocks: React.Dispatch<
    React.SetStateAction<Record<string, Block>>
  >;
  initialPointerYRef: React.MutableRefObject<number | null>;
};

export function useGalleryHandlers({
  columns,
  setColumns,
  setDraggedBlock,
  setOverId,
  setPlacement,
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

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { delta, over } = event;

    if (!over) {
      setOverId(null);
      return;
    }

    if (initialPointerYRef.current !== null) {
      const currentPointerY = initialPointerYRef.current + delta.y;

      const overElement = document.querySelector(`[data-id="${over.id}"]`);
      if (overElement) {
        // determine which drag indicator to show
        const rect = overElement.getBoundingClientRect();
        const middleY = rect.top + rect.height / 2;

        setPlacement(currentPointerY < middleY ? "above" : "below");
      }
      setOverId(String(over.id));
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      document.body.classList.remove("cursor-grabbing");

      setDraggedBlock(null);
      initialPointerYRef.current = null;
      setOverId(null);

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id;
      const overId = over.id;
      if (activeId === overId) return;

      const fromColumnIndex = columns.findIndex((col) =>
        col.some((block) => block.id === activeId)
      );

      // where's it being dropped to
      // extra logic for dropping into columns itself
      let toColumnIndex = -1;
      if (String(overId).startsWith("col-")) {
        toColumnIndex = Number(String(overId).replace("col-", ""));
      } else {
        toColumnIndex = columns.findIndex((col) =>
          col.some((block) => block.id === overId)
        );
      }
      if (fromColumnIndex === -1 || toColumnIndex === -1) return;

      // KEY SECTION: actually updating the columns
      //
      // update only the columns that changed
      setColumns((prev) => {
        const updated = [...prev];

        const fromCol = [...updated[fromColumnIndex]];
        const toCol = [...updated[toColumnIndex]];

        const movingItemIndex = fromCol.findIndex(
          (block) => block.id === activeId
        );
        const [movingItem] = fromCol.splice(movingItemIndex, 1);
        const overIndex = toCol.findIndex((block) => block.id === overId);

        // if you're dragging into the same column
        if (fromColumnIndex === toColumnIndex) {
          let insertIndex = overIndex === -1 ? fromCol.length : overIndex;
          fromCol.splice(insertIndex, 0, movingItem);
          updated[fromColumnIndex] = fromCol;
        } else {
          // if you're dragging to a column itself, add to the bottom
          if (String(overId).startsWith("col-") || overIndex === -1) {
            toCol.push(movingItem);
          } else {
            // if you're dragging between 2 objects in a different column
            const place = initialPointerYRef.current ? "below" : "above";
            toCol.splice(
              place === "below" ? overIndex + 1 : overIndex,
              0,
              movingItem
            );
          }

          // update the new columns
          updated[fromColumnIndex] = fromCol;
          updated[toColumnIndex] = toCol;
        }

        return updated;
      });
    },
    [columns]
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
