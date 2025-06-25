// this is a gallery. it's the thing that is in charge of rendering all the columns

// it's a bit confusing with the wording sorry
// look at the comment on top of board.tsx to see the whole structure

"use client";
import { DroppableColumn } from "@/components/drag/droppable-column";
import { useUIStore } from "@/store/ui-store";
import { Block } from "@/types/block-types";
import React, { useCallback, useMemo } from "react";
import { MemoizedDroppableColumn } from "./columns";
import { MirrorContext } from "./board";
import Image from "next/image";
import { useImagePicker } from "@/hooks/use-image-picker";
import { useOverlayStore } from "@/store/overlay-store";
import { useGetScope } from "@/hooks/use-get-scope";
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
  canEdit,
  isMirror = false,
}: {
  section: Section;
  columns: Block[][];
  draggedBlocks: Block[] | null;
  scrollY: number;
  selectedBlocks: Record<string, Block>;
  overId: string | null;
  canEdit: boolean;
  isMirror?: boolean;
}) {
  const canvasScope = isMirror ? "mirror" : "main";
  const scope = useGetScope();

  const spacingSize = useUIStore((s) => s.spacingSize);
  const gallerySpacingSize = useUIStore((s) => s.gallerySpacingSize);
  const sidebarWidth = useLayoutStore((s) => s.sidebarWidth);
  const forceMobileColumns = useLayoutStore((s) => s.forceMobileColumns);

  const lastSelectedBlock = useSelectionStore((s) => s.lastSelectedBlock);
  const addBlocksToSelection = useSelectionStore((s) => s.addBlocksToSelection);
  const selectOnlyThisBlock = useSelectionStore((s) => s.selectOnlyThisBlock);
  const removeBlockFromSelection = useSelectionStore(
    (s) => s.removeBlockFromSelection
  );

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
      // console.log("Clicked? ", event, block);
      console.log("Clicked? ", block);

      if (event.detail === 2 && block.block_type === "image") {
        console.log("Double clicked:", block);
        selectOnlyThisBlock(canvasScope, block);
        openOverlayGallery(block);
        return;
      }

      const isMeta = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;

      if (
        isShift &&
        lastSelectedBlock?.block_id &&
        selectedBlocks[lastSelectedBlock.block_id]
      ) {
        const currentIndex = masterBlockOrder.findIndex(
          (b) => b.block.block_id === block.block_id
        );
        const lastIndex = masterBlockOrder.findIndex(
          (b) => b.block.block_id === lastSelectedBlock.block_id
        );

        if (currentIndex !== -1 && lastIndex !== -1) {
          const [start, end] = [currentIndex, lastIndex].sort((a, b) => a - b);
          const inRange = masterBlockOrder
            .slice(start, end + 1)
            .map((b) => b.block);
          addBlocksToSelection(canvasScope, inRange);
          return;
        }
      }

      if (isMeta) {
        const isAlreadySelected = selectedBlocks[block.block_id];
        if (isAlreadySelected) {
          removeBlockFromSelection(block);
        } else {
          addBlocksToSelection(canvasScope, [block]);
        }
        return;
      }

      selectOnlyThisBlock(canvasScope, block);
    },
    [
      selectOnlyThisBlock,
      removeBlockFromSelection,
      addBlocksToSelection,
      openOverlayGallery,
      selectedBlocks,
      canvasScope,
      lastSelectedBlock,
      masterBlockOrder,
    ]
  );

  return (
    <MirrorContext.Provider value={isMirror}>
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
            canEdit={canEdit}
            id={`${scope}::col-${section.section_id}-${columnIndex}`}
            paddingLeft={spacingSize / 2}
            paddingRight={spacingSize / 2}
            key={`${section.section_id}-${columnIndex}`}
            sectionId={section.section_id}
            isMirror={isMirror}
          >
            <MemoizedDroppableColumn
              canEdit={canEdit}
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
    </MirrorContext.Provider>
  );
}
