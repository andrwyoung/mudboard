"use client";
import { SortableImageItem } from "@/components/sortable-wrapper";
import { ImageType } from "@/types/image-type";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

export default function Gallery({
  imgs,
  cols = 3,
}: {
  imgs: ImageType[];
  cols?: number;
}) {
  const [columns, setColumns] = useState<ImageType[][]>([]);
  const [activeImage, setActiveImage] = useState<ImageType | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<"above" | "below">("below");

  const [debugMessage, setDebugMessage] = useState("");

  useEffect(() => {
    // build columns when images arrive
    const newColumns: ImageType[][] = Array.from({ length: cols }, () => []);

    imgs.forEach((img, index) => {
      const colIndex = index % cols;
      newColumns[colIndex].push(img);
    });

    setColumns(newColumns);
  }, [imgs, cols]);

  function handleDragEnd(event: DragEndEvent) {
    setDebugMessage("drag ended");
    const { active, over } = event;

    setActiveImage(null);
    if (!over) {
      console.log("over is null");
      return;
    }
    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) {
      console.log("same column. returning");
      return;
    }

    // find column to drop into
    let fromColumnIndex = columns.findIndex((col) =>
      col.some((img) => img.id === activeId)
    );
    let toColumnIndex = columns.findIndex((col) =>
      col.some((img) => img.id === overId)
    );
    if (fromColumnIndex === -1 || toColumnIndex == -1) {
      console.log("column index wrong. returning");
      return;
    }

    const newColumns = [...columns]; // clone
    const fromCol = [...newColumns[fromColumnIndex]];
    const toCol = [...newColumns[toColumnIndex]];

    // find the dragged image
    const movingItemIndex = fromCol.findIndex((img) => img.id === activeId);
    const [movingItem] = fromCol.splice(movingItemIndex, 1);
    // find target index
    const overIndex = toCol.findIndex((img) => img.id === overId);

    if (fromColumnIndex === toColumnIndex) {
      // Moving within the same column
      fromCol.splice(overIndex, 0, movingItem);
      newColumns[fromColumnIndex] = fromCol;
    } else {
      // Moving across columns
      if (overIndex === -1) {
        toCol.push(movingItem);
      } else {
        if (placement === "below") {
          toCol.splice(overIndex + 1, 0, movingItem);
        } else {
          toCol.splice(overIndex, 0, movingItem);
        }
      }
      newColumns[fromColumnIndex] = fromCol;
      newColumns[toColumnIndex] = toCol;
    }

    // update columns
    setColumns(newColumns);

    console.log(
      "drag done from col: ",
      fromCol,
      "toCol: ",
      toCol,
      "fromColumnIndex: ",
      fromColumnIndex,
      "toColumnIndex: ",
      toColumnIndex
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setDebugMessage("drag starting");
    const { active } = event;
    const activeImage = columns.flat().find((img) => img.id === active.id);
    if (activeImage) {
      setActiveImage(activeImage);
    }
  }

  function debounce(func: (...args: any[]) => void, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }
  const debouncedHandleDragMove = useCallback(
    debounce((event: any) => {
      if (!overId) return;

      const { activatorEvent } = event;

      let pointerY: number | null = null;

      if (activatorEvent instanceof MouseEvent) {
        pointerY = activatorEvent.clientY;
      } else if (activatorEvent instanceof TouchEvent) {
        pointerY = activatorEvent.touches[0]?.clientY ?? null;
      }

      if (pointerY !== null) {
        const overElement = document.querySelector(`[data-id="${overId}"]`);
        if (overElement) {
          const rect = overElement.getBoundingClientRect();
          const middleY = rect.top + rect.height / 2;

          if (pointerY < middleY) {
            setPlacement("above");
          } else {
            setPlacement("below");
          }
        }
      }
    }, 40),
    [overId]
  );

  function handleDragOver(event: DragOverEvent) {
    setDebugMessage("drag over");
    const { over } = event;
    setOverId(over ? String(over.id) : null);
  }

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragMove={debouncedHandleDragMove}
    >
      <div className="flex flex-row gap-6">
        {columns.map((column, i) => (
          <div key={i} className="flex flex-col gap-6 bg-amber-100">
            <SortableContext items={column.map((img) => img.id)}>
              {column.map((img, j) => (
                <div
                  key={img.id}
                  data-id={img.id}
                  className="bg-black flex flex-col"
                >
                  {overId === img.id && placement === "above" && (
                    <div className="bg-secondary h-4 rounded transition-all duration-200 ease-in-out" />
                  )}
                  <SortableImageItem id={img.id}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={img.width}
                      height={img.height}
                      className="rounded-md object-cover cursor-pointer"
                    />
                    {overId === img.id && placement === "below" && (
                      <div className="bg-secondary h-4 rounded transition-all duration-200 ease-in-out" />
                    )}
                  </SortableImageItem>
                </div>
              ))}
            </SortableContext>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeImage ? (
          <Image
            src={activeImage.src}
            alt={activeImage.alt}
            width={activeImage.width}
            height={activeImage.height}
            className="rounded-md object-cover opacity-80 scale-30 transition-all" // tweak as you like
          />
        ) : null}
      </DragOverlay>
      <div className="absolute top-4 left-4">
        {debugMessage} <br />
        {placement}
      </div>
    </DndContext>
  );
}
