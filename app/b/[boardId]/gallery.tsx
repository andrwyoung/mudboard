"use client";
import { DroppableColumn } from "@/components/drag/droppable-column";
import { useGalleryHandlers } from "@/hooks/use-drag-handlers";
import { useUIStore } from "@/store/ui-store";
import { Block } from "@/types/block-types";
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
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { softDeleteBlocks } from "@/lib/db-actions/soft-delete-blocks";
import { MemoizedDroppableColumn } from "./columns";
import { useIsMirror } from "./board";

export default function Gallery({
  columns,
  updateColumns,
  blockMap,
  draggedBlock,
  setDraggedBlock,
  sidebarWidth,
  scrollY,
}: {
  columns: Block[][];
  updateColumns: (fn: (prev: Block[][]) => Block[][]) => void;
  blockMap: Map<string, { colIndex: number; blockIndex: number }>;
  draggedBlock: Block | null;
  setDraggedBlock: (b: Block | null) => void;
  sidebarWidth: number;
  scrollY: number;
}) {
  const isMirror = useIsMirror();
  const numCols = useUIStore((s) => (isMirror ? s.mirrorNumCols : s.numCols));
  const spacingSize = useUIStore((s) => s.spacingSize);
  const gallerySpacingSize = useUIStore((s) => s.gallerySpacingSize);

  const [overId, setOverId] = useState<string | null>(null);
  const initialPointerYRef = useRef<number | null>(null);

  const [selectedBlocks, setSelectedBlocks] = useState<Record<string, Block>>(
    {}
  );

  // column width
  const columnWidth = useMemo(() => {
    if (typeof window === "undefined") return 0;

    const totalGapSpacing = spacingSize * (numCols - 1);
    const totalSidePadding = gallerySpacingSize * 2;

    const availableWidth =
      window.innerWidth - totalGapSpacing - totalSidePadding - sidebarWidth;
    const width = availableWidth / numCols;

    console.log(
      "column width is around: ",
      width,
      "window size: ",
      window.innerWidth,
      "sidebar size: ",
      sidebarWidth
    );
    return width;
  }, [spacingSize, gallerySpacingSize, numCols, sidebarWidth]);

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
        className={`grid h-full ${
          draggedBlock ? "cursor-grabbing" : "cursor-default"
        }`}
        style={{
          paddingLeft: gallerySpacingSize,
          paddingRight: gallerySpacingSize,
          gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
          gap: spacingSize,
        }}
      >
        {columns.map((column, columnIndex) => (
          <DroppableColumn key={`col-${columnIndex}`} id={`col-${columnIndex}`}>
            <MemoizedDroppableColumn
              column={column}
              columnWidth={columnWidth}
              columnIndex={columnIndex}
              overId={overId}
              draggedImage={draggedBlock}
              selectedBlocks={selectedBlocks}
              handleItemClick={handleItemClick}
              scrollY={scrollY}
            />
          </DroppableColumn>
        ))}
      </div>
      <DragOverlay>
        {draggedBlock &&
          draggedBlock.block_type === "image" &&
          draggedBlock.data &&
          "fileName" in draggedBlock.data && (
            <Image
              src={draggedBlock.data.fileName}
              alt={draggedBlock.data.caption}
              width={draggedBlock.data.width}
              height={draggedBlock.height}
              className="rounded-md object-cover backdrop-blur-md opacity-80 transition-transform
        duration-200 ease-out scale-105 shadow-xl rotate-1"
            />
          )}
      </DragOverlay>
      <div>{overId}</div>
    </DndContext>
  );
}
