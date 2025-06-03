// these are the green lines that show up between images when you drag things around

// it's important because these things are actually how we keep track of where we want
// to drop an image somewhere. look at use-drag-handlers.tsx and notice that we keep
// these ids in dropID

import { useUIStore } from "@/store/ui-store";
import { useDroppable } from "@dnd-kit/core";
import React from "react";

function DropIndicator({
  id,
  isActive,
  padding,
  style,
  sectionId,
  isMirror,
}: {
  id: string;
  isActive: boolean;
  padding?: "bottom" | "above";
  style?: React.CSSProperties;
  isMirror: boolean;
  sectionId: string;
}) {
  const spacingSize = useUIStore((s) => s.spacingSize);

  const { setNodeRef } = useDroppable({
    id,
    data: {
      sectionId,
      isMirror,
    },
  });

  const isPaddingBlock = padding ? true : false;
  // only apply inline height if it's not a padding block
  const height = isPaddingBlock ? undefined : spacingSize;

  let positionClass = "top-1/2 -translate-y-1/2";
  if (padding === "above") {
    positionClass = ""; // a little down from the top
  }
  if (padding === "bottom") {
    positionClass = ""; // a little up from the bottom
  }

  return (
    <div
      ref={setNodeRef}
      data-id={id}
      className={`w-full z-15 transition-all duration-150 ease-in-out relative
       ${padding === "bottom" ? "flex-1" : ""}`}
      tabIndex={-1}
      style={{
        ...style,
        height,
        // minHeight: !height ? galleySpacingSize : undefined,
        minHeight: !height ? spacingSize : undefined,
      }}
    >
      {isActive && (
        <div
          className={`absolute left-0 w-full h-1 bg-accent rounded-full shadow ${positionClass}`}
          style={{
            top: padding === "bottom" ? spacingSize / 2 : undefined,
            bottom: padding === "above" ? spacingSize / 2 : undefined,
          }}
        />
      )}
    </div>
  );
}

export const MemoizedDropIndicator = React.memo(DropIndicator);
