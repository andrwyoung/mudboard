// this is a gallery. it's the thing that is in charge of rendering all the columns

// it's a bit confusing with the wording sorry
// look at the comment on top of board.tsx to see the whole structure

"use client";
import { DroppableColumn } from "@/components/drag/droppable-column";
import { useUIStore } from "@/store/ui-store";
import { Block } from "@/types/block-types";
import React, { useCallback } from "react";
import { MemoizedDroppableColumn } from "./columns";
import { MirrorContext } from "./board";
import Image from "next/image";
import { useImagePicker } from "@/hooks/use-image-picker";
import { useOverlayStore } from "@/store/overlay-store";
import { useLayoutStore } from "@/store/layout-store";
import { useSelectionStore } from "@/store/selection-store";
import { Section } from "@/types/board-types";
import { MOBILE_COLUMN_NUMBER } from "@/types/constants";
import { useSecondaryLayoutStore } from "@/store/secondary-layout-store";

function SectionGallery({
  section,
  columns,
  canEdit,
  isMirror = false,
}: {
  section: Section;
  columns: Block[][];
  canEdit: boolean;
  isMirror?: boolean;
}) {
  const scope = isMirror ? "mirror" : "main";

  const spacingSize = useUIStore((s) => s.spacingSize);
  const forceMobileColumns = useUIStore((s) => s.forceMobileColumns);

  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const lastSelectedBlock = useSelectionStore((s) => s.lastSelectedBlock);
  const addBlocksToSelection = useSelectionStore((s) => s.addBlocksToSelection);
  const selectOnlyThisBlock = useSelectionStore((s) => s.selectOnlyThisBlock);
  const removeBlockFromSelection = useSelectionStore(
    (s) => s.removeBlockFromSelection
  );

  const visualNumColsMirror = useSecondaryLayoutStore((s) => s.visualColumnNum);
  const visualNumColsMain = useLayoutStore((s) =>
    s.getVisualNumColsForSection(section.section_id)
  );
  const visualNumCols = isMirror ? visualNumColsMirror : visualNumColsMain;

  const masterBlockOrderMirror = useSecondaryLayoutStore(
    (s) => s.masterBlockOrder
  );
  const masterBlockOrderMain = useLayoutStore(
    (s) => s.masterBlockOrder[section.section_id]
  );
  const masterBlockOrder = isMirror
    ? masterBlockOrderMirror
    : masterBlockOrderMain;

  const { isOpen: overlayGalleryIsOpen, openOverlay: openOverlayGallery } =
    useOverlayStore(scope);

  const isEmpty = columns.every((col) => col.length === 0);
  const { triggerImagePicker, fileInput } = useImagePicker(section.section_id);

  // when clicking on an image
  const handleItemClick = useCallback(
    (block: Block, event: React.MouseEvent<Element, MouseEvent>) => {
      // console.log("Clicked? ", event, block);
      console.log("Clicked? ", block);

      if (event.detail === 2 && block.block_type === "image") {
        console.log("Double clicked:", block);
        selectOnlyThisBlock(scope, block);
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
          addBlocksToSelection(scope, inRange);
          return;
        }
      }

      if (isMeta) {
        const isAlreadySelected = selectedBlocks[block.block_id];
        if (isAlreadySelected) {
          removeBlockFromSelection(block);
        } else {
          addBlocksToSelection(scope, [block]);
        }
        return;
      }

      selectOnlyThisBlock(scope, block);
    },
    [
      selectOnlyThisBlock,
      removeBlockFromSelection,
      addBlocksToSelection,
      openOverlayGallery,
      selectedBlocks,
      scope,
      lastSelectedBlock,
      masterBlockOrder,
    ]
  );

  return (
    <MirrorContext.Provider value={isMirror}>
      {fileInput}
      <div
        className={`grid h-full relative  ${
          overlayGalleryIsOpen ? "pointer-events-none" : ""
        }`}
        style={{
          gridTemplateColumns: `repeat(${
            forceMobileColumns ? MOBILE_COLUMN_NUMBER : visualNumCols
          }, minmax(0, 1fr))`,
        }}
        aria-hidden={overlayGalleryIsOpen ? "true" : "false"}
      >
        {/* <p className="text-primary">hey there</p> */}
        {isEmpty && canEdit && (
          <>
            <div className="absolute inset-0 flex flex-col items-center justify-center ">
              <div
                className="w-fit h-fit flex flex-col items-center select-none
                    opacity-60 z-10 hover:opacity-90 transition-all duration-200 cursor-pointer "
                onClick={() => triggerImagePicker()}
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
              columnIndex={columnIndex}
              selectedBlocks={selectedBlocks}
              handleItemClick={handleItemClick}
              triggerImagePicker={triggerImagePicker}
              visualNumCols={visualNumCols}
            />
          </DroppableColumn>
          // </div>
        ))}
      </div>
    </MirrorContext.Provider>
  );
}

export default React.memo(SectionGallery);
