import { useCallback } from "react";
import { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { ImageType } from "@/types/image-type";

type UseGalleryHandlersProps = {
  columns: ImageType[][];
  setColumns: React.Dispatch<React.SetStateAction<ImageType[][]>>;
  setActiveImage: (img: ImageType | null) => void;
  setOverId: (id: string | null) => void;
  setPlacement: (val: "above" | "below") => void;
  setSelectedImages: React.Dispatch<
    React.SetStateAction<Record<string, ImageType>>
  >;
  initialPointerYRef: React.MutableRefObject<number | null>;
};

export function useGalleryHandlers({
  columns,
  setColumns,
  setActiveImage,
  setOverId,
  setPlacement,
  setSelectedImages,
  initialPointerYRef,
}: UseGalleryHandlersProps) {
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      document.body.classList.add("cursor-grabbing");
      setSelectedImages({});

      const { active, activatorEvent } = event;
      const activeImage = columns
        .flat()
        .find((img) => img.image_id === active.id);
      if (activeImage) {
        setActiveImage(activeImage);
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

      setActiveImage(null);
      initialPointerYRef.current = null;
      setOverId(null);

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id;
      const overId = over.id;
      if (activeId === overId) return;

      const fromColumnIndex = columns.findIndex((col) =>
        col.some((img) => img.image_id === activeId)
      );

      let toColumnIndex = -1;
      if (String(overId).startsWith("col-")) {
        toColumnIndex = Number(String(overId).replace("col-", ""));
      } else {
        toColumnIndex = columns.findIndex((col) =>
          col.some((img) => img.image_id === overId)
        );
      }
      if (fromColumnIndex === -1 || toColumnIndex === -1) return;

      const newColumns = [...columns];
      const fromCol = [...newColumns[fromColumnIndex]];
      const toCol = [...newColumns[toColumnIndex]];

      const movingItemIndex = fromCol.findIndex(
        (img) => img.image_id === activeId
      );
      const [movingItem] = fromCol.splice(movingItemIndex, 1);
      const overIndex = toCol.findIndex((img) => img.image_id === overId);

      if (fromColumnIndex === toColumnIndex) {
        let insertIndex = overIndex === -1 ? fromCol.length : overIndex;
        fromCol.splice(insertIndex, 0, movingItem);
        newColumns[fromColumnIndex] = fromCol;
      } else {
        if (String(overId).startsWith("col-") || overIndex === -1) {
          toCol.push(movingItem);
        } else {
          const place = initialPointerYRef.current ? "below" : "above";
          toCol.splice(
            place === "below" ? overIndex + 1 : overIndex,
            0,
            movingItem
          );
        }
        newColumns[fromColumnIndex] = fromCol;
        newColumns[toColumnIndex] = toCol;
      }

      setColumns(newColumns);
    },
    [columns]
  );

  const handleImageClick = useCallback(
    (img: ImageType, event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
      if (event.detail === 2) {
        console.log("Double clicked:", img);
        return;
      }

      setSelectedImages((prevSelected) => {
        const newSelected = { ...prevSelected };

        if (event.metaKey || event.ctrlKey) {
          if (newSelected[img.image_id]) {
            delete newSelected[img.image_id];
          } else {
            newSelected[img.image_id] = img;
          }
          return newSelected;
        } else {
          if (
            newSelected[img.image_id] &&
            Object.entries(newSelected).length === 1
          ) {
            return {};
          }
          return { [img.image_id]: img };
        }
      });
    },
    []
  );

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleImageClick,
  };
}
