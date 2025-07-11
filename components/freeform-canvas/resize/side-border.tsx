import { BORDER_HITBOX_SIZE, BORDER_SIZE } from "@/types/constants";
import { BlockScreenRect } from "@/types/freeform-types";

export function SideBorder({
  side,
  blockScreenRect,
  onMouseDown,
}: {
  side: "top" | "right" | "bottom" | "left";
  blockScreenRect: BlockScreenRect;
  onMouseDown?: (e: React.MouseEvent) => void;
}) {
  const { x, y, width, height } = blockScreenRect;

  const hitboxStyle: React.CSSProperties = {
    cursor: side === "left" || side === "right" ? "ew-resize" : "ns-resize",
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

  return (
    <div
      style={hitboxStyle}
      onMouseDown={onMouseDown}
      className="absolute z-1 
        flex justify-center items-center "
    >
      <div style={visualStyle} className="bg-accent z-2 pointer-events-none" />
    </div>
  );
}
