import { CameraType, FreeformPosition } from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { BlockScreenRect, SideType } from "@/types/freeform-types";
import React from "react";
import { SideBorder } from "./side-border";
import { useMultiResizeHandler } from "@/hooks/freeform/use-multi-resize-handler";

export default function MultiBlockSideBorder({
  side,
  blocksWithPositions,
  blockScreenRect,
  camera,
  zIndex,
  disableResizing,
}: {
  side: SideType;
  blocksWithPositions: { block: Block; blockPos: FreeformPosition }[];
  blockScreenRect: BlockScreenRect;
  camera: CameraType;
  zIndex: number;
  disableResizing: boolean;
}) {
  const onMouseDown = useMultiResizeHandler({
    blocksWithPositions,
    side,
    camera,
  });

  return (
    <SideBorder
      side={side}
      blockScreenRect={blockScreenRect}
      isSelected={true}
      zIndex={zIndex}
      softHighlight={false}
      disableResizing={disableResizing}
      onMouseDown={onMouseDown}
    />
  );
}
