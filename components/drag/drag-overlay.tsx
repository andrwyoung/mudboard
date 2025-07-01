"use client";

import { useDragStore } from "@/store/drag-store";
import { DragOverlay } from "@dnd-kit/core";
import Image from "next/image";

export default function DragOverlayBlock() {
  const draggedBlocks = useDragStore((s) => s.draggedBlocks);

  if (!draggedBlocks || draggedBlocks.length === 0) return null;

  const firstBlock = draggedBlocks[0];

  return (
    <DragOverlay dropAnimation={null}>
      <div className="relative">
        {firstBlock.block_type === "image" &&
          firstBlock.data &&
          "fileName" in firstBlock.data && (
            <Image
              src={firstBlock.data.fileName}
              alt={
                firstBlock.caption ?? firstBlock.data.original_name ?? "image"
              }
              width={firstBlock.width}
              height={firstBlock.height}
              tabIndex={-1}
              className="rounded-md object-cover backdrop-blur-md opacity-80 transition-transform
              duration-200 ease-out scale-105 shadow-xl rotate-1"
            />
          )}

        {draggedBlocks.length > 1 && (
          <div
            className="absolute bottom-0 font-header right-0 bg-white px-3 py-1 
            text-md text-primary rounded-lg"
          >
            {draggedBlocks.length}
          </div>
        )}
      </div>
    </DragOverlay>
  );
}
