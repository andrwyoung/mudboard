import { useCornerResizeHandler } from "@/hooks/freeform/use-corner-resize-handler";
import { FreeformPosition, CameraType } from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { BlockScreenRect, CornerType } from "@/types/freeform-types";
import { CornerHandles } from "./corner-handles";
import { HANDLE_Z_OFFSET } from "@/types/constants";

export default function SingleBlockCornerResize({
  corner,
  block,
  blockScreenRect,
  blockPosition,
  camera,
  isOnlySelected,
  disableResizing,
}: {
  corner: CornerType;
  block: Block;
  blockScreenRect: BlockScreenRect;
  blockPosition: FreeformPosition;
  camera: CameraType;
  isOnlySelected: boolean;
  disableResizing: boolean;
}) {
  const onMouseDown = useCornerResizeHandler({
    block,
    corner,
    blockPosition,
    camera,
  });

  return (
    <CornerHandles
      corner={corner}
      zIndex={blockPosition.z + HANDLE_Z_OFFSET}
      blockScreenRect={blockScreenRect}
      isOnlySelected={isOnlySelected}
      disableResizing={disableResizing}
      onMouseDown={onMouseDown}
    />
  );
}
