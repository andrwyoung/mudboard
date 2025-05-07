import { memo } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { MemoizedImageBlock } from "@/components/blocks/memoized-block";
import { Block, isBlockWithWidth } from "@/types/image-type";
import React from "react";
import { MemoizedDropIndicator } from "@/components/drag/drag-indicator";
import { useUIStore } from "@/store/ui-store";
import { OVERSCAN_SIZE } from "@/types/upload-settings";

// virtualization
function getBlockLayout(
  column: Block[],
  spacing: number,
  columnWidth: number,
  gallerySpacingSize: number
) {
  let top = gallerySpacingSize;
  const items = column.map((block, index) => {
    let height = block.height;

    if (block.block_type === "image" && isBlockWithWidth(block.data)) {
      const width = columnWidth;
      const aspectRatio = block.height / block.data.width;
      height = Math.round(width * aspectRatio);
    }

    const item = { block, top, height };

    // only add spacing below, not before first
    if (index !== 0) {
      top += spacing;
    }
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
        <MemoizedDropIndicator
          id={`drop-${columnIndex}-0`}
          isActive={overId === `drop-${columnIndex}-0`}
          padding="above"
        />
        {visibleItems.map(({ block, top, height }, virtualIndex) => (
          <div
            key={block.block_id}
            data-id={block.block_id}
            style={{
              position: "absolute",
              top,
              height,
              width: "100%",
            }}
          >
            {virtualIndex !== 0 && (
              <MemoizedDropIndicator
                id={`drop-${columnIndex}-${virtualIndex}`}
                isActive={overId === `drop-${columnIndex}-${virtualIndex}`}
              />
            )}

            <MemoizedImageBlock
              block={block}
              isSelected={!!selectedBlocks[block.block_id]}
              isDragging={draggedImage?.block_id === block.block_id}
              onClick={(e) => handleItemClick(block, e)}
            />
          </div>
        ))}
        <MemoizedDropIndicator
          id={`drop-${columnIndex}-${column.length}`}
          isActive={overId === `drop-${columnIndex}-${column.length}`}
          padding="bottom"
        />
      </SortableContext>
    </div>
  );
}

export const MemoizedDroppableColumn = memo(ColumnComponent);
