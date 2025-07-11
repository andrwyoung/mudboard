import { BlockScreenRect } from "@/types/freeform-types";
import { Corner } from "./all-borders-handler";

export function CornerHandles({
  corner,
  blockScreenRect,
  onMouseDown,
}: {
  corner: Corner;
  blockScreenRect: BlockScreenRect;
  onMouseDown?: (e: React.MouseEvent) => void;
}) {
  const size = 16;
  const { x, y, width, height } = blockScreenRect;

  const positions: Record<Corner, { top: number; left: number }> = {
    "top-left": { top: y - size / 2, left: x - size / 2 },
    "top-right": { top: y - size / 2, left: x + width - size / 2 },
    "bottom-left": { top: y + height - size / 2, left: x - size / 2 },
    "bottom-right": { top: y + height - size / 2, left: x + width - size / 2 },
  };

  return (
    <div
      style={{
        ...positions[corner],
        width: size,
        height: size,
      }}
      className="absolute bg-white border-3 
          border-accent z-3 pointer-events-none rounded-sm"
      onMouseDown={onMouseDown}
    />
  );
}
