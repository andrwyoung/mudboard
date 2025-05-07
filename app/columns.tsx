import { memo } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { MemoizedImageBlock } from "@/components/blocks/memoized-block";
import { Block, isBlockWithWidth } from "@/types/image-type";
import React from "react";
import { MemoizedDropIndicator } from "@/components/drag/drag-indicator";
import { useUIStore } from "@/store/ui-store";
import { IMAGE_OVERSCAN_SIZE, OVERSCAN_SIZE } from "@/types/upload-settings";
import { useLayoutStore } from "@/store/layout-store";

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
  const overscan = OVERSCAN_SIZE;
  const viewportHeight = window.innerHeight;

  const prettyMode = useLayoutStore((s) => s.prettyMode);

  const { items, totalHeight } = getBlockLayout(
    column,
    spacingSize,
    columnWidth,
    gallerySpacingSize
  );

  const visibleItems = items.filter(({ top, height }) => {
    return (
      top + height > scrollY - overscan &&
      top < scrollY + viewportHeight + overscan
    );
  });

  return (
    <div style={{ height: totalHeight, position: "relative" }}>
      <SortableContext items={column.map((block) => block.block_id)}>
        {/* First drop zone */}
        <MemoizedDropIndicator
          id={`drop-${columnIndex}-0`}
          isActive={overId === `drop-${columnIndex}-0`}
          padding="above"
          style={{
            position: "absolute",
            top: items[0]?.top ?? 0,
            width: "100%",
          }}
        />

        {/* Drop indicators between blocks */}
        {items.map(({ top, height }, index) => (
          <>
            {index !== 0 ? (
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
            ) : null}
            {prettyMode && (
              <div
                className="border-2 bg-grey-light rounded-sm"
                style={{
                  position: "absolute",
                  top: top + spacingSize,
                  height,
                  width: "100%",
                }}
              ></div>
            )}
          </>
        ))}

        {/* Drop zone at the end */}
        <MemoizedDropIndicator
          id={`drop-${columnIndex}-${column.length}`}
          isActive={overId === `drop-${columnIndex}-${column.length}`}
          padding="bottom"
          style={{
            position: "absolute",
            top: totalHeight - gallerySpacingSize,
            width: "100%",
          }}
        />

        {visibleItems.map(({ block, top, height }) => {
          const shouldEagerLoad =
            top < scrollY + viewportHeight + IMAGE_OVERSCAN_SIZE;

          return (
            <div
              key={block.block_id}
              data-id={block.block_id}
              style={{
                position: "absolute",
                top: top + spacingSize,
                height,
                width: "100%",
              }}
            >
              <MemoizedImageBlock
                block={block}
                isSelected={!!selectedBlocks[block.block_id]}
                isDragging={draggedImage?.block_id === block.block_id}
                onClick={(e) => handleItemClick(block, e)}
                shouldEagerLoad={shouldEagerLoad}
              />
            </div>
          );
        })}
      </SortableContext>
    </div>
  );
}

export const MemoizedDroppableColumn = memo(ColumnComponent);
