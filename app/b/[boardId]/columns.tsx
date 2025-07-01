// a single column in a gallery

import { memo } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { MemoizedBlock } from "@/components/blocks/memoized-block";
import { Block } from "@/types/block-types";
import React from "react";
import { MemoizedDropIndicator } from "@/components/drag/drag-indicator";
import { useUIStore } from "@/store/ui-store";
import { MAX_DRAGGED_ITEMS } from "@/types/upload-settings";
import { useGetScope } from "@/hooks/use-get-scope";
import { useIsMirror } from "./board";
import BlockAdder from "@/components/blocks/add-a-block";
import { Section } from "@/types/board-types";
import { createTextBlock } from "@/lib/db-actions/sync-text/create-text-block";

// virtualization
function getBlockLayout(
  column: Block[],
  spacing: number,
  columnWidth: number,
  gallerySpacingSize: number
) {
  let top = 0;
  const items = column.map((block) => {
    let height = block.height;

    if (block.block_type === "image" && block.width) {
      const width = columnWidth;
      const aspectRatio = block.height / block.width;
      height = Math.round(width * aspectRatio);
    }

    const item = { block, top, height };

    // only add spacing below, not before first
    top += spacing;
    top += height;

    return item;
  });

  // pad the bottom
  const totalHeight = top + gallerySpacingSize;
  return { items, totalHeight };
}

type Props = {
  canEdit: boolean;
  section: Section;
  wholeGalleryEmpty: boolean;
  column: Block[];
  columnWidth: number;
  columnIndex: number;
  overId: string | null;
  draggedBlocks: Block[] | null;
  selectedBlocks: Record<string, Block>;
  handleItemClick: (block: Block, e: React.MouseEvent) => void;
  triggerImagePicker: (columnIndex?: number, rowIndex?: number) => void;
  visualNumCols: number;
};

function ColumnComponent({
  canEdit,
  section,
  wholeGalleryEmpty,
  column,
  columnWidth,
  columnIndex,
  overId,
  draggedBlocks,
  selectedBlocks,
  handleItemClick,
  triggerImagePicker,
  visualNumCols,
}: Props) {
  const sectionId = section.section_id;

  const spacingSize = useUIStore((s) => s.spacingSize);
  const gallerySpacingSize = useUIStore((s) => s.gallerySpacingSize);
  const mirrorMode = useUIStore((s) => s.mirrorMode);

  const enableDragIndicators =
    draggedBlocks !== null &&
    draggedBlocks.length > 0 &&
    draggedBlocks.length <= MAX_DRAGGED_ITEMS;
  const isMirror = useIsMirror();
  const scope = useGetScope();

  const { items } = getBlockLayout(
    column,
    spacingSize,
    columnWidth,
    gallerySpacingSize
  );

  return (
    // <div style={{ height: totalHeight, position: "relative" }}>
    <div style={{ minHeight: 250 }}>
      <SortableContext items={column.map((block) => block.block_id)}>
        {/* First drop zone */}
        {column.length > 0 && (
          <MemoizedDropIndicator
            canEdit={canEdit}
            id={`${scope}::drop-${sectionId}-${columnIndex}-0`}
            isActive={
              enableDragIndicators &&
              overId === `${scope}::drop-${sectionId}-${columnIndex}-0`
            }
            sectionId={sectionId}
            isMirror={isMirror}
            padding="above"
            // style={{
            //   position: "absolute",
            //   top: items[0]?.top ?? 0,
            //   width: "100%",
            // }}
          />
        )}

        {/* Drop indicators between blocks */}
        {/* {visibleIndicators.map(({ top, index }) =>
          index !== 0 ? (
            <MemoizedDropIndicator
              key={`drop-${columnIndex}-${index}`}
              id={`drop-${columnIndex}-${index}`}
              isActive={overId === `drop-${columnIndex}-${index}`}
              style={{
                position: "absolute",
                top,
                width: "100%",
              }}
            />
          ) : null
        )} */}

        {/* {visibleItems.map(({ block, top, height }) => { */}
        {items.map(({ block }, index) => {
          return (
            <div
              key={`${block.block_id}`}
              data-id={`${scope}::block-${block.block_id}`}
              tabIndex={-1}
              // style={{
              //   position: "absolute",
              //   top: top + spacingSize,
              //   height,
              //   width: "100%",
              // }}
            >
              {index !== 0 ? (
                <MemoizedDropIndicator
                  canEdit={canEdit}
                  key={`${scope}::drop-${sectionId}-${columnIndex}-${index}`}
                  id={`${scope}::drop-${sectionId}-${columnIndex}-${index}`}
                  isActive={
                    enableDragIndicators &&
                    overId ===
                      `${scope}::drop-${sectionId}-${columnIndex}-${index}`
                  }
                  sectionId={sectionId}
                  isMirror={isMirror}
                  // style={{
                  //   position: "absolute",
                  //   top,
                  //   width: "100%",
                  // }}
                />
              ) : null}

              <MemoizedBlock
                canEdit={canEdit}
                block={block}
                isSelected={!!selectedBlocks[block.block_id]}
                isDragging={
                  !!draggedBlocks?.some((b) => b.block_id === block.block_id)
                }
                onClick={(e) => handleItemClick(block, e)}
                columnWidth={columnWidth}
                numCols={visualNumCols}
                addImage={() => triggerImagePicker(columnIndex, index + 1)}
                addText={() =>
                  createTextBlock(section.section_id, columnIndex, index + 1)
                }
              />
            </div>
          );
        })}

        {/* Drop zone at the end */}
        <MemoizedDropIndicator
          canEdit={canEdit}
          id={`${scope}::drop-${sectionId}-${columnIndex}-${column.length}`}
          isActive={
            enableDragIndicators &&
            overId ===
              `${scope}::drop-${sectionId}-${columnIndex}-${column.length}`
          }
          sectionId={sectionId}
          isMirror={isMirror}
          padding="bottom"
          // style={{
          //   position: "absolute",
          //   top: totalHeight - gallerySpacingSize,
          //   width: "100%",
          // }}
        />
      </SortableContext>
      {!wholeGalleryEmpty && canEdit && !mirrorMode && visualNumCols <= 6 && (
        <BlockAdder
          addImage={() => triggerImagePicker(columnIndex)}
          addText={() => createTextBlock(section.section_id, columnIndex)}
        />
      )}
    </div>
  );
}

export const MemoizedDroppableColumn = memo(ColumnComponent);
