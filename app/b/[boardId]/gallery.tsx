// this is a gallery. it's the thing that is in charge of rendering all the columns

// it's a bit confusing with the wording sorry
// look at the comment on top of board.tsx to see the whole structure

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
import { useGetScope } from "@/hooks/use-get-scope";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { useLayoutStore } from "@/store/layout-store";
import { useSelectionStore } from "@/store/selection-store";
import { MAX_DRAGGED_ITEMS } from "@/types/upload-settings";
import { Section } from "@/types/board-types";
import { MOBILE_COLUMN_NUMBER } from "@/types/constants";

export default function SectionGallery({
  section,
  columns,
  draggedBlocks,
  scrollY,
  selectedBlocks,
  overId,
}: {
  section: Section;
  columns: Block[][];
  draggedBlocks: Block[] | null;
  scrollY: number;
  selectedBlocks: Record<string, Block>;
  overId: string | null;
}) {
  const isMirror = useIsMirror();
  const canvasScope = isMirror ? "mirror" : "main";
  const scope = useGetScope();

  const canEdit = canEditBoard();

  const spacingSize = useUIStore((s) => s.spacingSize);
  const gallerySpacingSize = useUIStore((s) => s.gallerySpacingSize);
  const sidebarWidth = useLayoutStore((s) => s.sidebarWidth);
  const forceMobileColumns = useLayoutStore((s) => s.forceMobileColumns);

  const lastSelectedBlock = useSelectionStore((s) => s.lastSelectedBlock);
  const setSelectedBlocks = useSelectionStore((s) => s.setSelectedBlocks);
  const masterBlockOrder = useLayoutStore((s) => s.masterBlockOrder);

  const { isOpen: overlayGalleryIsOpen, openOverlay: openOverlayGallery } =
    useOverlayStore(canvasScope);

  const isEmpty = columns.every((col) => col.length === 0);
  const { triggerImagePicker, fileInput } = useImagePicker(section.section_id);

  // column width
  const columnWidth = useMemo(() => {
    if (typeof window === "undefined") return 0;

    const totalGapSpacing = spacingSize * (section.visualColumnNum - 1);
    const totalSidePadding = gallerySpacingSize * 2;

    const availableWidth =
      window.innerWidth - totalGapSpacing - totalSidePadding - sidebarWidth;
    const width = availableWidth / section.visualColumnNum;

    console.log(
      "column width is around: ",
      width,
      "window size: ",
      window.innerWidth,
      "sidebar size: ",
      sidebarWidth
    );
    return width;
  }, [spacingSize, gallerySpacingSize, section.visualColumnNum, sidebarWidth]);

  // when clicking on an image
  const handleItemClick = useCallback(
    (block: Block, event: React.MouseEvent<Element, MouseEvent>) => {
      console.log("Clicked? ", event, block);

      if (event.detail === 2 && block.block_type === "image") {
        console.log("Double clicked:", block);
        setSelectedBlocks(canvasScope, { [block.block_id]: block }, block);
        openOverlayGallery(block);
        return;
      }

      let newSelected: Record<string, Block> = {};

      // shift behavior
      if (
        event.shiftKey &&
        lastSelectedBlock?.block_id &&
        selectedBlocks[lastSelectedBlock.block_id]
      ) {
        const currentIndex = masterBlockOrder.findIndex(
          (b) => b.block.block_id === block.block_id
        );
        const lastIndex = masterBlockOrder.findIndex(
          (b) => b.block.block_id === lastSelectedBlock.block_id
        );

        console.log("grabbing items from");

        if (currentIndex !== -1 && lastIndex !== -1) {
          const [start, end] = [currentIndex, lastIndex].sort((a, b) => a - b);
          const inRange = masterBlockOrder.slice(start, end + 1);
          newSelected = { ...selectedBlocks };
          inRange.forEach((b) => {
            newSelected[b.block.block_id] = b.block;
          });
        }
      } else if (event.metaKey || event.ctrlKey) {
        newSelected = { ...selectedBlocks };
        if (newSelected[block.block_id]) {
          delete newSelected[block.block_id];
        } else {
          newSelected[block.block_id] = block;
        }
      } else {
        newSelected = { [block.block_id]: block };
      }

      setSelectedBlocks(canvasScope, newSelected, block);
    },
    [
      setSelectedBlocks,
      openOverlayGallery,
      selectedBlocks,
      canvasScope,
      lastSelectedBlock,
      masterBlockOrder,
    ]
  );

  return (
    <div
      className={`grid h-full relative ${
        draggedBlocks ? "cursor-grabbing" : "cursor-default"
      } ${
        draggedBlocks?.length && draggedBlocks.length > MAX_DRAGGED_ITEMS
          ? ""
          : ""
      } ${overlayGalleryIsOpen ? "pointer-events-none" : ""}`}
      style={{
        gridTemplateColumns: `repeat(${
          forceMobileColumns ? MOBILE_COLUMN_NUMBER : section.visualColumnNum
        }, minmax(0, 1fr))`,
      }}
      aria-hidden={overlayGalleryIsOpen ? "true" : "false"}
    >
      {/* <p className="text-primary">hey there</p> */}
      {isEmpty && canEdit && (
        <>
          {fileInput}
          <div className="absolute inset-0 flex flex-col items-center justify-center ">
            <div
              className="w-fit h-fit flex flex-col items-center select-none
        opacity-60 z-10 hover:opacity-90 transition-all duration-200 cursor-pointer "
              onClick={triggerImagePicker}
            >
              <Image
                src="/1.png"
                alt="No images yet"
                width={375}
                height={150}
                draggable={false}
              />
              <h3 className="text-primary text-sm">
                No Images Yet! Drag one in or click here to add.
              </h3>
            </div>
          </div>
        </>
      )}
      {columns.map((column, columnIndex) => (
        // <div className="bg-amber-50">
        <DroppableColumn
          id={`${scope}::col-${section.section_id}-${columnIndex}`}
          paddingLeft={spacingSize / 2}
          paddingRight={spacingSize / 2}
          key={`${section.section_id}-${columnIndex}`}
          sectionId={section.section_id}
          isMirror={isMirror}
        >
          <MemoizedDroppableColumn
            section={section}
            wholeGalleryEmpty={isEmpty}
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
        // </div>
      ))}
    </div>
  );
}
