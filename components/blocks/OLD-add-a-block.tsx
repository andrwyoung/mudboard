import { useImagePicker } from "@/hooks/use-image-picker";
import { createTextBlock } from "@/lib/sync/text-block-actions";
import React from "react";
import { FaPlus } from "react-icons/fa";

const buttonClass =
  "text-primary font-header font-semibold text-md opacity-0 group-hover:opacity-20 group-hover/button:opacity-100 transition-opacity duration-400";

export default function BlockAdder({
  sectionId,
  columnIndex,
}: {
  sectionId: string;
  columnIndex: number;
}) {
  // for triggering the file opener
  const { triggerImagePicker, fileInput } = useImagePicker(
    sectionId,
    columnIndex
  );

  function handleAddImageBlock() {
    triggerImagePicker();
  }

  function handleAddTextBlock() {
    createTextBlock(sectionId, columnIndex);
  }

  return (
    <>
      {fileInput}
      <div className="relative h-12 w-full group ">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="flex-shrink-0 relative size-8 group cursor-pointer hover:scale-95 
            transition-transform duration-200 flex items-center justify-center"
          >
            {/* <div className="absolute inset-0 rounded-full border-4 border-primary" /> */}
            <FaPlus className="z-2 size-5 text-background group-hover:text-primary transition-colors duration-500" />
            <div
              className="absolute inset-0 rounded-full bg-primary/20 z-1 group-hover:bg-background transition-all duration-300
              group-hover:scale-30"
            />
          </div>
        </div>

        <button
          onClick={() => handleAddImageBlock()}
          className="absolute left-0 top-0 bottom-0 w-1/2 group/button pointer-events-auto cursor-pointer"
        >
          <span
            className={`absolute top-1/2 right-[calc(20%)] -translate-y-1/2 text-right ${buttonClass}`}
          >
            image
          </span>
        </button>
        <button
          onClick={() => handleAddTextBlock()}
          className="absolute right-0 top-0 bottom-0 w-1/2 group/button pointer-events-auto cursor-pointer"
        >
          <span
            className={`absolute top-1/2 left-[calc(20%)] -translate-y-1/2 text-left ${buttonClass}`}
          >
            text
          </span>
        </button>
      </div>
    </>
  );
}
