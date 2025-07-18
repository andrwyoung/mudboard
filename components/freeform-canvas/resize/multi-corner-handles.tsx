import { FreeformPosition, CameraType } from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { BlockScreenRect, CornerType } from "@/types/freeform-types";
import { CornerHandles } from "./corner-handles";
import { useMultiResizeHandler } from "@/hooks/freeform/use-multi-resize-handler";

export default function MultiBlockCornerResize({
  corner,
  blocksWithPositions,
  blockScreenRect,
  camera,
  disableResizing,
  zIndex,
  sectionId,
}: {
  corner: CornerType;
  blocksWithPositions: { block: Block; blockPos: FreeformPosition }[];
  blockScreenRect: BlockScreenRect;
  camera: CameraType;
  disableResizing: boolean;
  zIndex: number;
  sectionId: string;
}) {
  const onMouseDown = useMultiResizeHandler({
    blocksWithPositions,
    interaction: { type: "corner", corner },
    camera,
    sectionId,
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
