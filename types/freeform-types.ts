export const ALL_CORNERS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;

export type CornerType = (typeof ALL_CORNERS)[number];
export const ALL_SIDES = ["left", "right", "top", "bottom"] as const;
export type SideType = (typeof ALL_SIDES)[number];

export type BlockScreenRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getCursorForSide(side: SideType) {
  return {
    left: "ew-resize",
    right: "ew-resize",
    top: "ns-resize",
    bottom: "ns-resize",
  }[side];
}

export function getCursorForCorner(corner: CornerType) {
  return {
    "top-left": "nwse-resize",
    "top-right": "nesw-resize",
    "bottom-left": "nesw-resize",
    "bottom-right": "nwse-resize",
  }[corner];
}
