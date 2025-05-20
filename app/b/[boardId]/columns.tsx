import { memo } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { MemoizedBlock } from "@/components/blocks/memoized-block";
import { Block } from "@/types/block-types";
import React from "react";
import { MemoizedDropIndicator } from "@/components/drag/drag-indicator";
import { useUIStore } from "@/store/ui-store";
import { IMAGE_OVERSCAN_SIZE } from "@/types/upload-settings";
import { isBlockWithWidth } from "@/lib/type-validators/is-image-block";

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

    if (block.block_type === "image" && isBlockWithWidth(block.data)) {
      const width = columnWidth;
      const aspectRatio = block.height / block.data.width;
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
  sectionId: string;
  column: Block[];
  columnWidth: number;
  columnIndex: number;
  overId: string | null;
  draggedImage: Block | null;
  selectedBlocks: Record<string, Block>;
  handleItemClick: (block: Block, e: React.MouseEvent) => void;
  scrollY: number;
};

function ColumnComponent({
  sectionId: sectionId,
  column,
  columnWidth,
  columnIndex,
  overId,
  draggedImage,
  selectedBlocks,
  handleItemClick,
  scrollY,
}: Props) {
  const spacingSize = useUIStore((s) => s.spacingSize);
  const gallerySpacingSize = useUIStore((s) => s.gallerySpacingSize);
  // const overscan = OVERSCAN_SIZE;
  const viewportHeight = window.innerHeight;
  // const isEmpty = column.length === 0;

  const { items } = getBlockLayout(
    column,
    spacingSize,
    columnWidth,
    gallerySpacingSize
  );

  // const visibleItems = items.filter(({ top, height }) => {
  //   return (
  //     top + height > scrollY - overscan &&
  //     top < scrollY + viewportHeight + overscan
  //   );
  // });

  // const visibleIndicators = items
  //   .map(({ top }, index) => ({ top, index }))
  //   .filter(({ top }) => {
  //     return (
  //       top > scrollY - overscan && top < scrollY + viewportHeight + overscan
  //     );
  //   });

  return (
    // <div style={{ height: totalHeight, position: "relative" }}>
    <div style={{ minHeight: 250 }}>
      <SortableContext items={column.map((block) => block.block_id)}>
        {/* First drop zone */}
        {column.length > 0 && (
          <MemoizedDropIndicator
            id={`drop-${sectionId}-${columnIndex}-0`}
            isActive={overId === `drop-${sectionId}-${columnIndex}-0`}
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
        {items.map(({ block, top }, index) => {
          const shouldEagerLoad =
            top < scrollY + viewportHeight + IMAGE_OVERSCAN_SIZE;

          return (
            <div
              key={block.block_id}
              data-id={block.block_id}
              // style={{
              //   position: "absolute",
              //   top: top + spacingSize,
              //   height,
              //   width: "100%",
              // }}
            >
              {index !== 0 ? (
                <MemoizedDropIndicator
                  key={`drop-${sectionId}-${columnIndex}-${index}`}
                  id={`drop-${sectionId}-${columnIndex}-${index}`}
                  isActive={
                    overId === `drop-${sectionId}-${columnIndex}-${index}`
                  }
                  // style={{
                  //   position: "absolute",
                  //   top,
                  //   width: "100%",
                  // }}
                />
              ) : null}

              <MemoizedBlock
                block={block}
                isSelected={!!selectedBlocks[block.block_id]}
                isDragging={draggedImage?.block_id === block.block_id}
                onClick={(e) => handleItemClick(block, e)}
                shouldEagerLoad={shouldEagerLoad}
                columnWidth={columnWidth}
              />
            </div>
          );
        })}

        {/* Drop zone at the end */}
        <MemoizedDropIndicator
          id={`drop-${sectionId}-${columnIndex}-${column.length}`}
          isActive={
            overId === `drop-${sectionId}-${columnIndex}-${column.length}`
          }
          padding="bottom"
          // style={{
          //   position: "absolute",
          //   top: totalHeight - gallerySpacingSize,
          //   width: "100%",
          // }}
        />
      </SortableContext>
      {/* {!isEmpty && (
        <BlockAdder sectionId={sectionId} columnIndex={columnIndex} />
      )} */}
    </div>
  );
}

export const MemoizedDroppableColumn = memo(ColumnComponent);
