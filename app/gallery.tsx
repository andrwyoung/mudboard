"use client";
import { DroppableColumn } from "@/components/drag/droppable-wrapper";
import { SortableImageItem } from "@/components/drag/sortable-wrapper";
import { useGalleryHandlers } from "@/hooks/use-drag-handlers";
import { BlockRenderer } from "@/lib/blocks/block-helpers";
import { Block, MudboardImage } from "@/types/image-type";
import {
  DndContext,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function Gallery({
  imgs,
  cols = 8,
}: {
  imgs: MudboardImage[];
  cols?: number;
}) {
  const [erroredImages, setErroredImages] = useState<Record<string, boolean>>(
    {}
  );

  const [draggedImage, setDraggedImage] = useState<Block | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<"above" | "below">("below");
  const initialPointerYRef = useRef<number | null>(null);

  console.log(overId, placement);
  const [selectedImages, setSelectedImages] = useState<Record<string, Block>>(
    {}
  );

  const [columns, setColumns] = useState<Block[][]>([]);

  // only regenerate "real" columns when backend images change
  const generatedColumns = useMemo(() => {
    const newColumns: Block[][] = Array.from({ length: cols }, () => []);
    imgs.forEach((img, index) => {
      const colIndex = index % cols;
      newColumns[colIndex].push({
        id: img.image_id,
        type: "image",
        data: img,
      });
    });
    return newColumns;
  }, [imgs, cols]);

  // update the fake columns with the real ones if reals ones change
  useEffect(() => {
    setColumns(generatedColumns);
  }, [generatedColumns]);

  useEffect(() => {
    function handleGlobalClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const clickedId = target.closest("[data-id]")?.getAttribute("data-id");

      if (clickedId) {
        // Clicked inside an image or an image container
        console.log("Clicked on image id:", clickedId);
        return;
      }
      // Otherwise clicked somewhere else, clear selections
      console.log("Clicked elsewhere. Clearing", clickedId);
      setSelectedImages({});
    }
    document.body.addEventListener("click", handleGlobalClick);

    return () => {
      document.body.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  // all the drag handlers
  const { handleDragStart, handleDragMove, handleDragEnd, handleItemClick } =
    useGalleryHandlers({
      columns,
      setColumns,
      setDraggedBlock: setDraggedImage,
      setOverId,
      setPlacement,
      setSelectedBlocks: setSelectedImages,
      initialPointerYRef,
    });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 70,
        tolerance: 5,
      },
    })
  );

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      sensors={sensors}
    >
      <div
        className={`grid gap-4 sm:gap-6 px-2 sm:px-12 ${
          draggedImage ? "cursor-grabbing" : "cursor-default"
        }`}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((column, i) => (
          <DroppableColumn key={`col-${i}`} id={`col-${i}`}>
            <SortableContext items={column.map((block) => block.id)}>
              {column.map((block) => (
                <div
                  key={block.id}
                  data-id={block.id}
                  className="flex flex-col"
                >
                  <SortableImageItem id={block.id}>
                    <div
                      className={`rounded-sm object-cover transition-all duration-200 cursor-pointer shadow-md ${
                        draggedImage?.id === block.id ? "opacity-30" : ""
                      } ${
                        !!selectedImages[block.id]
                          ? "outline-6 outline-secondary"
                          : ""
                      }`}
                    >
                      <BlockRenderer
                        block={block}
                        isErrored={erroredImages[block.id]}
                        onClick={(e) => handleItemClick(block, e)}
                        onError={() =>
                          setErroredImages((prev) => ({
                            ...prev,
                            [block.id]: true,
                          }))
                        }
                      />
                    </div>
                  </SortableImageItem>
                </div>
              ))}
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>
      {/* <DragOverlay>
        {activeImage ? (
          <Image
            src={activeImage.fileName}
            alt={activeImage.description}
            width={activeImage.width}
            height={activeImage.height}
            className="rounded-md object-cover backdrop-blur-md opacity-80 transition-transform 
            duration-200 ease-out scale-105 shadow-xl rotate-1"
          />
        ) : null}
      </DragOverlay> */}
    </DndContext>
  );
}
