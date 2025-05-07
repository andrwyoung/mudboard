import { memo } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { MemoizedImageBlock } from "@/components/blocks/memoized-block";
import { Block } from "@/types/image-type";
import React from "react";
import { MemoizedDropIndicator } from "@/components/drag/drag-indicator";

type Props = {
  column: Block[];
  columnIndex: number;
  overId: string | null;
  draggedImage: Block | null;
  selectedBlocks: Record<string, Block>;
  handleItemClick: (block: Block, e: React.MouseEvent) => void;
};

function ColumnComponent({
  column,
  columnIndex,
  overId,
  draggedImage,
  selectedBlocks,
  handleItemClick,
}: Props) {
  return (
    <SortableContext items={column.map((block) => block.block_id)}>
      <MemoizedDropIndicator
        id={`drop-${columnIndex}-0`}
        isActive={overId === `drop-${columnIndex}-0`}
        padding="above"
      />
      {column.map((block, blockIndex) => (
        <React.Fragment key={`block-${columnIndex}-${blockIndex}`}>
          {blockIndex !== 0 && (
            <MemoizedDropIndicator
              id={`drop-${columnIndex}-${blockIndex}`}
              isActive={overId === `drop-${columnIndex}-${blockIndex}`}
            />
          )}

          <MemoizedImageBlock
            block={block}
            isSelected={!!selectedBlocks[block.block_id]}
            isDragging={draggedImage?.block_id === block.block_id}
            onClick={(e) => handleItemClick(block, e)}
          />
        </React.Fragment>
      ))}
      <MemoizedDropIndicator
        id={`drop-${columnIndex}-${column.length}`}
        isActive={overId === `drop-${columnIndex}-${column.length}`}
        padding="bottom"
      />
    </SortableContext>
  );
}

export const MemoizedDroppableColumn = memo(ColumnComponent);
