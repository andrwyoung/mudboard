import { BlockScreenRect } from "@/types/freeform-types";
import { SideBorder } from "./side-border";
import { CornerHandles } from "./corner-resize";

export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export function AllBorderHandles({
  blockScreenRect,
}: {
  blockScreenRect: BlockScreenRect;
}) {
  return (
    <>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <SideBorder
          key={side}
          side={side}
          blockScreenRect={blockScreenRect}
          onMouseDown={() => console.log("hey")}
        />
      ))}
      {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map(
        (corner) => (
          <CornerHandles
            key={corner}
            corner={corner}
            blockScreenRect={blockScreenRect}
            onMouseDown={() => console.log(`resize from ${corner}`)}
          />
        )
      )}
    </>
  );
}
