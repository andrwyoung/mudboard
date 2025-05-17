import { uploadImages } from "@/lib/process-images/upload-images";
import React, { useRef } from "react";
import { FaPlus } from "react-icons/fa";

const buttonClass =
  "text-primary font-header font-bold text-lg opacity-0 group-hover:opacity-20 group-hover/button:opacity-100 transition-opacity duration-400";

export default function BlockAdder({ sectionId }: { sectionId: string }) {
  // for triggering the file opener
  const fileInputRef = useRef<HTMLInputElement>(null);
  function handleAddImageBlock() {
    fileInputRef.current?.click();
  }

  function handleAddTextBlock() {
    console.log("not implemented yet");
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            uploadImages(files, sectionId);
          }
        }}
      />
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
            className={`absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-5 ${buttonClass}`}
          >
            image
          </span>
        </button>
        <button
          onClick={() => handleAddTextBlock()}
          className="absolute right-0 top-0 bottom-0 w-1/2 group/button pointer-events-auto cursor-pointer"
        >
          <span
            className={`absolute top-1/2 right-1/2 -translate-y-1/2 -translate-x-8 text-left ${buttonClass}`}
          >
            text
          </span>
        </button>
      </div>
    </>
  );
}
