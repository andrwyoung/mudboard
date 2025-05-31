"use client";
import { DroppableColumn } from "@/components/drag/droppable-column";
import { useUIStore } from "@/store/ui-store";
import { Block } from "@/types/block-types";
import React, { useCallback, useMemo } from "react";
import { MemoizedDroppableColumn } from "./columns";
import { useIsMirror } from "./board";
import Image from "next/image";
import { useImagePicker } from "@/hooks/use-image-picker";
import { useOverlayStore } from "@/store/overlay-store";
import { CanvasScope } from "@/types/board-types";
import { useGetScope } from "@/hooks/use-get-scope";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { useLayoutStore } from "@/store/layout-store";

export default function Gallery({
  sectionId,
  columns,
  draggedBlocks,
  scrollY,
  selectedBlocks,
  setSelectedBlocks,
  overId,
}: {
  sectionId: string;
  columns: Block[][];
  draggedBlocks: Block[] | null;
  scrollY: number;
  selectedBlocks: Record<string, Block>;
  setSelectedBlocks: (
    scope: CanvasScope,
    blocks: Record<string, Block>
  ) => void;
  overId: string | null;
}) {
  const isMirror = useIsMirror();
  const canvasScope = isMirror ? "mirror" : "main";
  const scope = useGetScope();

  const canEdit = canEditBoard();

  const numCols = useUIStore((s) => s.numCols);
  const spacingSize = useUIStore((s) => s.spacingSize);
  const gallerySpacingSize = useUIStore((s) => s.gallerySpacingSize);
  const sidebarWidth = useLayoutStore((s) => s.sidebarWidth);

  const { isOpen: overlayGalleryIsOpen, openOverlay: openOverlayGallery } =
    useOverlayStore(canvasScope);

  const isEmpty = columns.every((col) => col.length === 0);
  const { triggerImagePicker, fileInput } = useImagePicker(sectionId);

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

  // when clicking on an image
  const handleItemClick = useCallback(
    (block: Block, event: React.MouseEvent<Element, MouseEvent>) => {
      console.log("Clicked? ", event, block);

      if (event.detail === 2) {
        console.log("Double clicked:", block);
        setSelectedBlocks(canvasScope, { [block.block_id]: block });
        openOverlayGallery(block);
        return;
      }

      let newSelected: Record<string, Block> = {};

      if (event.metaKey || event.ctrlKey) {
        newSelected = { ...selectedBlocks };
        if (newSelected[block.block_id]) {
          delete newSelected[block.block_id];
        } else {
          newSelected[block.block_id] = block;
        }
      } else {
        newSelected = { [block.block_id]: block };
      }

      setSelectedBlocks(canvasScope, newSelected);
    },
    [setSelectedBlocks, openOverlayGallery, selectedBlocks, canvasScope]
  );

  return (
    <div
      className={`grid h-full relative ${
        draggedBlocks ? "cursor-grabbing" : "cursor-default"
      } ${overlayGalleryIsOpen ? "pointer-events-none" : ""}`}
      style={{
        gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
      }}
      aria-hidden={overlayGalleryIsOpen ? "true" : "false"}
    >
      {/* <p className="text-primary">hey there</p> */}
      {isEmpty && canEdit && (
        <>
          {fileInput}
          <div className="absolute inset-0 flex flex-col items-center justify-center ">
            <div
              className="w-fit h-fit flex flex-col items-center
        opacity-60 z-10 hover:opacity-90 transition-all duration-200 cursor-pointer"
              onClick={triggerImagePicker}
            >
              <Image
                src="/1.png"
                alt="No images yet"
                width={375}
                height={150}
              />
              <h3 className="text-primary text-sm">
                No Images Yet! Drag one in or click here to add.
              </h3>
            </div>
          </div>
        </>
      )}
      {columns.map((column, columnIndex) => (
        <DroppableColumn
          id={`${scope}::col-${sectionId}-${columnIndex}`}
          paddingLeft={spacingSize / 2}
          paddingRight={spacingSize / 2}
          key={`${sectionId}-${columnIndex}`}
        >
          <MemoizedDroppableColumn
            sectionId={sectionId}
            column={column}
            columnWidth={columnWidth}
            columnIndex={columnIndex}
            overId={overId}
            draggedBlocks={draggedBlocks}
            selectedBlocks={selectedBlocks}
            handleItemClick={handleItemClick}
            scrollY={scrollY}
          />
        </DroppableColumn>
      ))}
    </div>
  );
}
