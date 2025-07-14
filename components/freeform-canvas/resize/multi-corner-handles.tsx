import { FreeformPosition, CameraType } from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { BlockScreenRect, CornerType } from "@/types/freeform-types";
import { CornerHandles } from "./corner-handles";
import { useMultiCornerResizeHandler } from "@/hooks/freeform/use-multi-corner-resize-handler";

export default function MultiBlockCornerResize({
  corner,
  blocksWithPositions,
  blockScreenRect,
  camera,
  disableResizing,
  zIndex,
}: {
  corner: CornerType;
  blocksWithPositions: { block: Block; blockPos: FreeformPosition }[];
  blockScreenRect: BlockScreenRect;
  camera: CameraType;
  disableResizing: boolean;
  zIndex: number;
}) {
  const onMouseDown = useMultiCornerResizeHandler({
    blocksWithPositions,
    corner,
    camera,
  });

  return (
    <CornerHandles
      corner={corner}
      blockScreenRect={blockScreenRect}
      zIndex={zIndex}
      disableResizing={disableResizing}
      showHandle={true}
      onMouseDown={onMouseDown}
    />
  );
}
