import { memo } from "react";
import { SortableImageItem } from "@/components/drag/sortable-wrapper";
import { Block } from "@/types/image-type";
import { BlockChooser } from "./block-chooser";

function ImageBlockComponent({
  block,
  isSelected,
  isDragging,
  onClick,
}: {
  block: Block;
  isSelected: boolean;
  isDragging: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div data-id={block.block_id} className="flex flex-col">
      <div
        className={`rounded-sm object-cover transition-all duration-200 cursor-pointer shadow-md 
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

          <BlockChooser block={block} />
        </SortableImageItem>
      </div>
    </div>
  );
}

export const MemoizedImageBlock = memo(ImageBlockComponent);
