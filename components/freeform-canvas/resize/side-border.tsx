import { useResizeHandler } from "@/hooks/freeform/use-resize-handler";
import { CameraType, FreeformPosition } from "@/store/freeform-store";
import { useUserPreferenceStore } from "@/store/use-preferences-store";
import { Block } from "@/types/block-types";
import {
  BORDER_HITBOX_SIZE,
  BORDER_SIZE,
  HANDLE_Z_OFFSET,
} from "@/types/constants";
import { BlockScreenRect, SideType } from "@/types/freeform-types";

export function SideBorder({
  side,
  block,
  blockScreenRect,
  blockPosition,
  camera,
  isOnlySelected,
  disableResizing,
}: {
  side: SideType;
  block: Block;
  blockScreenRect: BlockScreenRect;
  blockPosition: FreeformPosition;
  camera: CameraType;
  isOnlySelected: boolean;
  disableResizing: boolean;
}) {
  const { x, y, width, height } = blockScreenRect;

  const hitboxStyle: React.CSSProperties = !disableResizing
    ? {
        cursor: side === "left" || side === "right" ? "ew-resize" : "ns-resize",
        zIndex: blockPosition.z + HANDLE_Z_OFFSET,
      }
    : {};

  const visualStyle: React.CSSProperties = {};
  switch (side) {
    case "left":
      Object.assign(hitboxStyle, {
        left: x - BORDER_HITBOX_SIZE / 2,
        top: y,
        width: BORDER_HITBOX_SIZE,
        height,
      });
      Object.assign(visualStyle, {
        width: BORDER_SIZE,
        height,
      });
      break;

    case "right":
      Object.assign(hitboxStyle, {
        left: x + width - BORDER_HITBOX_SIZE / 2,
        top: y,
        width: BORDER_HITBOX_SIZE,
        height,
      });
      Object.assign(visualStyle, {
        width: BORDER_SIZE,
        height,
      });
      break;

    case "top":
      Object.assign(hitboxStyle, {
        left: x,
        top: y - BORDER_HITBOX_SIZE / 2,
        width,
        height: BORDER_HITBOX_SIZE,
      });
      Object.assign(visualStyle, {
        width,
        height: BORDER_SIZE,
      });
      break;

    case "bottom":
      Object.assign(hitboxStyle, {
        left: x,
        top: y + height - BORDER_HITBOX_SIZE / 2,
        width,
        height: BORDER_HITBOX_SIZE,
      });
      Object.assign(visualStyle, {
        width,
        height: BORDER_SIZE,
      });
      break;
  }

  const onMouseDown = useResizeHandler({
    block,
    side,
    blockPosition,
    camera,
  });

  const minimalBorders = useUserPreferenceStore((s) => s.minimalBorders);

  return (
    <div
      style={hitboxStyle}
      onMouseDown={!disableResizing ? onMouseDown : undefined}
      className="absolute z-1 
        flex justify-center items-center "
      data-id={`resize-${side}`}
    >
      {isOnlySelected && !minimalBorders && (
        <div
          style={visualStyle}
          className="bg-accent z-2 pointer-events-none"
        />
      )}
    </div>
  );
}
