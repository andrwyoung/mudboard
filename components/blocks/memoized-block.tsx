import { memo } from "react";
import { SortableImageItem } from "@/components/drag/sortable-wrapper";
import { Block } from "@/types/block-types";
import { ImageBlock } from "./image-block";
import TextBlock from "./text-block";
import { useLayoutStore } from "@/store/layout-store";
import { useGetScope } from "@/hooks/use-get-scope";

export function BlockChooser({
  block,
  shouldEagerLoad,
  columnWidth,
}: {
  block: Block;
  shouldEagerLoad: boolean;
  columnWidth: number;
}) {
  switch (block.block_type) {
    case "image":
      return (
        <ImageBlock
          block={block}
          shouldEagerLoad={shouldEagerLoad}
          columnWidth={columnWidth}
        />
      );
    case "text":
      return <TextBlock block={block} />;
    case "spacer":
      return <div className="h-8 w-full bg-transparent" />; // placeholder
    default:
      return null;
  }
}

function BlockComponent({
  block,
  isSelected,
  isDragging,
  onClick,
  shouldEagerLoad,
  columnWidth,
}: {
  block: Block;
  isSelected: boolean;
  isDragging: boolean;
  onClick: (e: React.MouseEvent) => void;
  shouldEagerLoad: boolean;
  columnWidth: number;
}) {
  const position = useLayoutStore((s) => s.getBlockPosition(block.block_id));
  const scope = useGetScope();

  return (
    <div
      // layoutId={`block-${block.block_id}`} // for animating
      data-id={`${scope}::block-${block.block_id}`} // for sortable
      tabIndex={-1}
      className={`flex flex-col rounded-sm object-cover transition-all duration-150 cursor-pointer shadow-md 
      hover:scale-101 hover:shadow-xl hover:opacity-100
      relative bg-background
        ${isDragging ? "opacity-30" : ""} 
        ${isSelected ? "outline-4 outline-secondary" : ""}`}
      onClick={onClick}
    >
      <SortableImageItem id={`${scope}::block-${block.block_id}`}>
        <h1 className="absolute text-xs top-2 right-2 text-slate-600 z-10 py-0.5 px-1 bg-white rounded-sm shadow-sm">
          {position?.colIndex}, {position?.rowIndex}, {position?.orderIndex}
        </h1>

        <BlockChooser
          block={block}
          shouldEagerLoad={shouldEagerLoad}
          columnWidth={columnWidth}
        />
      </SortableImageItem>
    </div>
  );
}

export const MemoizedBlock = memo(BlockComponent);
