import { useResizeHandler } from "@/hooks/freeform/use-resize-handler";
import { CameraType, FreeformPosition } from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { BlockScreenRect, SideType } from "@/types/freeform-types";
import React from "react";
import { SideBorder } from "./side-border";
import { HANDLE_Z_OFFSET } from "@/types/constants";

export default function SingleBlockSideBorder({
  side,
  block,
  blockScreenRect,
  blockPosition,
  camera,
  isSelected,
  multipleSelected,
  disableResizing,
}: {
  side: SideType;
  block: Block;
  blockScreenRect: BlockScreenRect;
  blockPosition: FreeformPosition;
  camera: CameraType;
  isSelected: boolean;
  multipleSelected: boolean;
  disableResizing: boolean;
}) {
  const onMouseDown = useResizeHandler({
    block,
    side,
    blockPosition,
    camera,
  });

  return (
    <SideBorder
      side={side}
      blockScreenRect={blockScreenRect}
      isSelected={isSelected}
      zIndex={blockPosition.z + HANDLE_Z_OFFSET}
      softHighlight={multipleSelected}
      disableResizing={disableResizing}
      onMouseDown={onMouseDown}
    />
  );
}
