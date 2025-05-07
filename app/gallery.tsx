"use client";
import { DroppableColumn } from "@/components/drag/droppable-column";
import { SortableImageItem } from "@/components/drag/sortable-wrapper";
import { useGalleryHandlers } from "@/hooks/use-drag-handlers";
import { BlockRenderer } from "@/components/blocks/block-helpers";
import { useUIStore } from "@/store/ui-store";
import { Block } from "@/types/image-type";
import { AnimatePresence, motion } from "framer-motion";
import { Flipper, Flipped } from "react-flip-toolkit";
import Image from "next/image";
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
import React, { useEffect, useRef, useState } from "react";
import { DropIndicator } from "@/components/drag/drag-indicator";
import { toast } from "sonner";
import { softDeleteBlocks } from "@/lib/db-actions/soft-delete-blocks";

export default function Gallery({
  columns,
  updateColumns,
  blockMap,
}: {
  columns: Block[][];
  updateColumns: (fn: (prev: Block[][]) => Block[][]) => void;
  blockMap: Map<string, { colIndex: number; blockIndex: number }>;
}) {
  const columnCount = useUIStore((s) => s.numCols);
  const spacingSize = useUIStore((s) => s.spacingSize);
  const galleySpacingSize = useUIStore((s) => s.galleySpacingSize);

  const [erroredImages, setErroredImages] = useState<Record<string, boolean>>(
    {}
  );

  const [draggedImage, setDraggedBlock] = useState<Block | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const initialPointerYRef = useRef<number | null>(null);

  const [selectedBlocks, setSelectedBlocks] = useState<Record<string, Block>>(
    {}
  );

  //
  // SECTION: keyboard controls

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // deleting image
      if (e.key === "Backspace" || e.key === "Delete") {
        const blocksToDelete = Object.values(selectedBlocks);
        if (blocksToDelete.length > 0) {
          const deletedIds = blocksToDelete.map((b) => b.block_id);

          updateColumns((prevCols) =>
            prevCols.map((col) =>
              col.filter((b) => !deletedIds.includes(b.block_id))
            )
          );

          softDeleteBlocks(deletedIds); // send to db

          toast.success(
            `Deleted ${blocksToDelete.length} block${
              blocksToDelete.length > 1 ? "s" : ""
            }`
          );
        }
      }

      // deselect with escape
      if (e.key === "Escape") {
        setSelectedBlocks({});
      }

      // Add more keys (Arrow keys for movement, etc.) as needed
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlocks, updateColumns]);

  //
  // SECTION: click and drag behavior
  //
  //

  // listen for clicking elsewhere (to deselect)
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
      updateColumns,
      setDraggedBlock,
      overId,
      setOverId,
      setSelectedBlocks,
      initialPointerYRef,
    });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
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
          paddingLeft: galleySpacingSize,
          paddingRight: galleySpacingSize,
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          gap: spacingSize,
        }}
      >
        {columns.map((column, columnIndex) => (
          <DroppableColumn key={`col-${columnIndex}`} id={`col-${columnIndex}`}>
            <SortableContext items={column.map((block) => block.block_id)}>
              {/* upper padding */}
              <DropIndicator
                id={`drop-${columnIndex}-0`}
                isActive={overId === `drop-${columnIndex}-0`}
                padding="above"
              />
              {column.map((block, blockIndex) => (
                <React.Fragment key={`block-${columnIndex}-${blockIndex}`}>
                  {blockIndex !== 0 && (
                    <DropIndicator
                      id={`drop-${columnIndex}-${blockIndex}`}
                      isActive={overId === `drop-${columnIndex}-${blockIndex}`}
                    />
                  )}

                  <div data-id={block.block_id} className="flex flex-col">
                    <div
                      className={`rounded-sm object-cover transition-all duration-200 cursor-pointer shadow-md 
                          hover:scale-101 hover:shadow-xl hover:brightness-105 hover:saturate-110 hover:opacity-100
                          relative bg-background
                          ${
                            draggedImage?.block_id === block.block_id
                              ? "opacity-30"
                              : ""
                          } ${
                        !!selectedBlocks[block.block_id]
                          ? "outline-4 outline-secondary"
                          : ""
                      }`}
                      onClick={(e) => handleItemClick(block, e)}
                    >
                      <SortableImageItem id={block.block_id}>
                        <h1 className="absolute text-xs top-2 right-2 text-slate-600 z-10">
                          {block.order_index}
                        </h1>

                        <BlockRenderer
                          block={block}
                          isErrored={erroredImages[block.block_id]}
                          onError={() =>
                            setErroredImages((prev) => ({
                              ...prev,
                              [block.block_id]: true,
                            }))
                          }
                        />
                      </SortableImageItem>
                    </div>
                  </div>
                </React.Fragment>
              ))}

              {/* bottom padding */}
              <DropIndicator
                id={`drop-${columnIndex}-${column.length}`}
                isActive={overId === `drop-${columnIndex}-${column.length}`}
                padding="bottom"
              />
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>
      <DragOverlay>
        {draggedImage &&
          draggedImage.block_type === "image" &&
          draggedImage.data &&
          "fileName" in draggedImage.data && (
            <Image
              src={draggedImage.data.fileName}
              alt={draggedImage.data.caption}
              width={draggedImage.data.width}
              height={draggedImage.height}
              className="rounded-md object-cover backdrop-blur-md opacity-80 transition-transform
        duration-200 ease-out scale-105 shadow-xl rotate-1"
            />
          )}
      </DragOverlay>
      <div>{overId}</div>
    </DndContext>
  );
}
