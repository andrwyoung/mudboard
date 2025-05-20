"use client";
import { DroppableColumn } from "@/components/drag/droppable-column";
import { useUIStore } from "@/store/ui-store";
import { Block } from "@/types/block-types";
import React, { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { softDeleteBlocks } from "@/lib/db-actions/soft-delete-blocks";
import { MemoizedDroppableColumn } from "./columns";
import { useIsMirror } from "./board";
import Image from "next/image";
import { useImagePicker } from "@/hooks/use-image-picker";
import { useOverlayStore } from "@/store/overlay-store";
import { CanvasScope } from "@/types/board-types";
import { useSelectionStore } from "@/store/selection-store";

export default function Gallery({
  sectionId,
  columns,
  updateColumns,
  draggedBlock,
  sidebarWidth,
  scrollY,
  selectedBlocks,
  setSelectedBlocks,
  overId,
}: {
  sectionId: string;
  columns: Block[][];
  updateColumns: (fn: (prev: Block[][]) => Block[][]) => void;
  draggedBlock: Block | null;
  sidebarWidth: number;
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

  const numCols = useUIStore((s) => s.numCols);
  const spacingSize = useUIStore((s) => s.spacingSize);
  const gallerySpacingSize = useUIStore((s) => s.gallerySpacingSize);

  const deselectBlocks = useSelectionStore((s) => s.deselectBlocks);

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

  //
  // SECTION: keyboard controls

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (overlayGalleryIsOpen) return;

      const activeEl = document.activeElement;
      const isTyping =
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable);

      if (isTyping) return;

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
        deselectBlocks();
      }

      // Add more keys (Arrow keys for movement, etc.) as needed
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedBlocks,
    updateColumns,
    setSelectedBlocks,
    overlayGalleryIsOpen,
    deselectBlocks,
  ]);

  //
  // SECTION: click and drag behavior
  //
  //

  // listen for clicking elsewhere (to deselect)
  useEffect(() => {
    function handleGlobalClick(event: MouseEvent) {
      if (overlayGalleryIsOpen) return;

      const target = event.target as HTMLElement;
      const clickedId = target.closest("[data-id]")?.getAttribute("data-id");

      if (
        !clickedId ||
        clickedId.startsWith("drop-") ||
        clickedId.startsWith("col-") ||
        clickedId.startsWith("section-")
      ) {
        console.log("Clicked outside block. Clearing selection.");
        deselectBlocks();
      }
    }
    document.body.addEventListener("click", handleGlobalClick);

    return () => {
      document.body.removeEventListener("click", handleGlobalClick);
    };
  }, [setSelectedBlocks, overlayGalleryIsOpen, deselectBlocks]);

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
        draggedBlock ? "cursor-grabbing" : "cursor-default"
      } ${overlayGalleryIsOpen ? "pointer-events-none" : ""}`}
      style={{
        gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
      }}
      aria-hidden={overlayGalleryIsOpen ? "true" : "false"}
    >
      {/* <p className="text-primary">hey there</p> */}
      {isEmpty && (
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
          id={`col-${sectionId}-${columnIndex}`}
          paddingLeft={spacingSize / 2}
          paddingRight={spacingSize / 2}
          key={`col-${sectionId}-${columnIndex}`}
        >
          <MemoizedDroppableColumn
            sectionId={sectionId}
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
  );
}
