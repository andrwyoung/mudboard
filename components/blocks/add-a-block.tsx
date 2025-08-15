import React from "react";
import { FaPlus } from "react-icons/fa";

export default function BlockAdder({
  addImage,
  addText,
  isDarkMode,
}: {
  addImage: () => void;
  addText: () => void;
  isDarkMode: boolean;
}) {
  const buttonClass =
    "font-header font-semibold text-md opacity-0 group-hover:opacity-25 group-hover/button:opacity-100 transition-opacity duration-400";

  const textColor = isDarkMode ? "text-off-white" : "text-dark-text";

  return (
    <>
      <div className="relative h-12 w-full group ">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          onClick={addImage}
        >
          <div
            className="flex-shrink-0 relative size-6 group cursor-pointer hover:scale-95 
            transition-transform duration-200 flex items-center justify-center"
          >
            {/* <div className="absolute inset-0 rounded-full border-4 border-primary" /> */}
            <FaPlus
              className={`z-2 size-4  transition-colors duration-500
              ${
                isDarkMode
                  ? "text-canvas-background-dark group-hover:text-off-white"
                  : "text-canvas-background-light group-hover:text-dark-text"
              }`}
            />
            <div
              className={`absolute inset-0 rounded-full  z-1  transition-all duration-300
              group-hover:scale-30 ${
                isDarkMode
                  ? "bg-off-white/30 group-hover:bg-canvas-background-dark"
                  : "bg-dark-text/20 group-hover:bg-canvas-background-light"
              }`}
            />
          </div>
        </div>

        <button
          onClick={addText}
          className="absolute left-0 top-0 bottom-0 w-1/2 group/button pointer-events-auto cursor-pointer"
        >
          <span
            className={`absolute top-1/2 right-[calc(20%)] -translate-y-1/2 text-right ${buttonClass} ${textColor}`}
          >
            text
          </span>
        </button>
        <button
          onClick={addImage}
          className="absolute right-0 top-0 bottom-0 w-1/2 group/button pointer-events-auto cursor-pointer"
        >
          <span
            className={`absolute top-1/2 left-[calc(20%)] -translate-y-1/2 text-left ${buttonClass} ${textColor}`}
          >
            image
          </span>
        </button>
      </div>
    </>
  );
}
