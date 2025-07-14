import { useUserPreferenceStore } from "@/store/use-preferences-store";
import { BORDER_HITBOX_SIZE, BORDER_SIZE } from "@/types/constants";
import { BlockScreenRect, SideType } from "@/types/freeform-types";

export function SideBorder({
  side,
  blockScreenRect,
  isSelected,
  zIndex,
  softHighlight,
  disableResizing,
  onMouseDown,
}: {
  side: SideType;
  blockScreenRect: BlockScreenRect;
  isSelected: boolean;
  zIndex: number;
  softHighlight: boolean;
  disableResizing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  const { x, y, width, height } = blockScreenRect;
  const BREATHER_MARGIN = BORDER_SIZE;

  const hitboxStyle: React.CSSProperties = {
    // zIndex: blockPosition.z + HANDLE_Z_OFFSET,
    zIndex,
    ...(disableResizing
      ? {}
      : {
          cursor:
            side === "left" || side === "right" ? "ew-resize" : "ns-resize",
        }),
  };

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
        height: height + BREATHER_MARGIN,
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
        height: height + BREATHER_MARGIN,
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
        width: width + BREATHER_MARGIN,
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
        width: width + BREATHER_MARGIN,
        height: BORDER_SIZE,
      });
      break;
  }

  const minimalBorders = useUserPreferenceStore((s) => s.minimalBorders);

  return (
    <div
      style={hitboxStyle}
      onMouseDown={!disableResizing ? onMouseDown : undefined}
      className="absolute z-1 
        flex justify-center items-center "
      data-id={`resize-${side}`}
    >
      {isSelected && !minimalBorders && (
        <div
          style={visualStyle}
          className={`bg-accent z-2 pointer-events-none ${
            softHighlight ? "opacity-60" : ""
          }`}
        />
      )}
    </div>
  );
}
