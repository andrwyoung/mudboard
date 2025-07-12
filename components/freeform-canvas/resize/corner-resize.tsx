import {
  BlockScreenRect,
  CornerType,
  getCursorForCorner,
} from "@/types/freeform-types";
import { CameraType, FreeformPosition } from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { useCornerResizeHandler } from "@/hooks/freeform/use-corner-resize-handler";

export function CornerHandles({
  corner,
  block,
  blockScreenRect,
  blockPosition,
  camera,
  isSelected,
  disableResizing,
}: {
  corner: CornerType;
  block: Block;
  blockScreenRect: BlockScreenRect;
  blockPosition: FreeformPosition;
  camera: CameraType;
  isSelected: boolean;
  disableResizing: boolean;
}) {
  const INDICATOR_SIZE = 16;
  const HITBOX_WIDTH = 20;
  const HITBOX_HEIGHT = 36;
  const { x, y, width, height } = blockScreenRect;

  const positions: Record<CornerType, { top: number; left: number }> = {
    "top-left": { top: y - INDICATOR_SIZE / 2, left: x - INDICATOR_SIZE / 2 },
    "top-right": {
      top: y - INDICATOR_SIZE / 2,
      left: x + width - INDICATOR_SIZE / 2,
    },
    "bottom-left": {
      top: y + height - INDICATOR_SIZE / 2,
      left: x - INDICATOR_SIZE / 2,
    },
    "bottom-right": {
      top: y + height - INDICATOR_SIZE / 2,
      left: x + width - INDICATOR_SIZE / 2,
    },
  };

  const hitbox_positions: Record<
    CornerType,
    {
      top: number;
      left: number;
      transform: string;
    }
  > = {
    "top-left": {
      top: y,
      left: x,
      transform: "translate(-50%, -50%) rotate(135deg)",
    },
    "top-right": {
      top: y,
      left: x + width,
      transform: "translate(-50%, -50%) rotate(45deg)",
    },
    "bottom-left": {
      top: y + height,
      left: x,
      transform: "translate(-50%, -50%) rotate(-135deg)",
    },
    "bottom-right": {
      top: y + height,
      left: x + width,
      transform: "translate(-50%, -50%) rotate(-45deg)",
    },
  };

  const onMouseDown = useCornerResizeHandler({
    block,
    corner,
    blockPosition,
    camera,
  });

  return (
    <>
      <div
        style={{
          ...hitbox_positions[corner],
          cursor: !disableResizing ? getCursorForCorner(corner) : undefined,
          width: HITBOX_WIDTH,
          height: HITBOX_HEIGHT,
        }}
        data-id={`resize-${corner}`}
        className="absolute z-3"
        onMouseDown={!disableResizing ? onMouseDown : undefined}
      />
      {isSelected && (
        <div
          style={{
            ...positions[corner],
            width: INDICATOR_SIZE,
            height: INDICATOR_SIZE,
          }}
          data-id={`resize-${corner}`}
          className="absolute bg-white border-3 
          border-accent z-4 pointer-events-none rounded-sm"
        />
      )}
    </>
  );
}
