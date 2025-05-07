import { memo } from "react";
import { SortableImageItem } from "@/components/drag/sortable-wrapper";
import { Block, MudboardImage } from "@/types/image-type";
import { ImageBlock } from "./image-block";

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
          img={block.data as MudboardImage}
          height={block.height}
          shouldEagerLoad={shouldEagerLoad}
          columnWidth={columnWidth}
        />
      );
    case "text":
      return <div className="p-2 text-zinc-600 italic">[Text block]</div>; // placeholder
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
  return (
    <div
      data-id={block.block_id}
      className={`flex flex-col rounded-sm object-cover transition-all duration-200 cursor-pointer shadow-md 
      hover:scale-101 hover:shadow-xl hover:brightness-105 hover:saturate-110 hover:opacity-100
      relative bg-background
        ${isDragging ? "opacity-30" : ""} 
        ${isSelected ? "outline-4 outline-secondary" : ""}`}
      onClick={onClick}
    >
      <SortableImageItem id={block.block_id}>
        <h1 className="absolute text-xs top-2 right-2 text-slate-600 z-10">
          {block.order_index}
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
