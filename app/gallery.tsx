"use client";
import { DroppableColumn } from "@/components/drag/droppable-column";
import { SortableImageItem } from "@/components/drag/sortable-wrapper";
import { useGalleryHandlers } from "@/hooks/use-drag-handlers";
import { BlockRenderer } from "@/components/blocks/block-helpers";
import { useUIStore } from "@/store/ui-store";
import { Block, MudboardImage } from "@/types/image-type";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { DropIndicator } from "@/components/drag/drag-indicator";

export default function Gallery({ imgs }: { imgs: MudboardImage[] }) {
  const columnCount = useUIStore((s) => s.columnCount);
  const spacingSize = useUIStore((s) => s.spacingSize);

  const [erroredImages, setErroredImages] = useState<Record<string, boolean>>(
    {}
  );

  const [draggedImage, setDraggedBlock] = useState<Block | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const initialPointerYRef = useRef<number | null>(null);

  const [selectedImages, setSelectedBlocks] = useState<Record<string, Block>>(
    {}
  );

  const [columns, setColumns] = useState<Block[][]>([]);

  // only regenerate "real" columns when backend images change
  const generatedColumns = useMemo(() => {
    const newColumns: Block[][] = Array.from({ length: columnCount }, () => []);
    imgs.forEach((img, index) => {
      const colIndex = index % columnCount;
      newColumns[colIndex].push({
        id: img.image_id,
        type: "image",
        data: img,
      });
    });
    return newColumns;
  }, [imgs, columnCount]);

  // update the fake columns with the real ones if reals ones change
  useEffect(() => {
    setColumns(generatedColumns);
  }, [generatedColumns]);

  // save the block order
  const blockMap = useMemo(() => {
    const map = new Map<string, { colIndex: number; blockIndex: number }>();
    columns.forEach((col, colIndex) => {
      col.forEach((block, blockIndex) => {
        map.set(block.id, { colIndex, blockIndex });
      });
    });
    return map;
  }, [columns]);

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
      setSelectedBlocks({});
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
      blockMap,
      setColumns,
      setDraggedBlock,
      overId,
      setOverId,
      setSelectedBlocks,
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
        className={`grid px-2 sm:px-12 h-full ${
          draggedImage ? "cursor-grabbing" : "cursor-default"
        }`}
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          gap: spacingSize,
        }}
      >
        {columns.map((column, columnIndex) => (
          <DroppableColumn key={`col-${columnIndex}`} id={`col-${columnIndex}`}>
            <SortableContext items={column.map((block) => block.id)}>
              {column.map((block, blockIndex) => (
                <React.Fragment key={`block-${columnIndex}-${blockIndex}`}>
                  <DropIndicator
                    id={`drop-${columnIndex}-${blockIndex}`}
                    isActive={overId === `drop-${columnIndex}-${blockIndex}`}
                    height={spacingSize}
                  />

                  <div data-id={block.id} className="flex flex-col">
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
                </React.Fragment>
              ))}

              {/* final drop indicator */}
              <DropIndicator
                id={`drop-${columnIndex}-${column.length}`}
                isActive={overId === `drop-${columnIndex}-${column.length}`}
              />
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>
      <DragOverlay>
        {draggedImage ? (
          <div className="h-16 w-16  opacity-20 flex flex-row bg-red-500">
            Hey
          </div>
        ) : // <Image
        //   src={activeImage.fileName}
        //   alt={activeImage.description}
        //   width={activeImage.width}
        //   height={activeImage.height}
        //   className="rounded-md object-cover backdrop-blur-md opacity-80 transition-transform
        //   duration-200 ease-out scale-105 shadow-xl rotate-1"
        // />
        null}
      </DragOverlay>
      <div>{overId}</div>
    </DndContext>
  );
}
