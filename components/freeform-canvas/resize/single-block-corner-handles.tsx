import { FreeformPosition, CameraType } from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { BlockScreenRect, CornerType } from "@/types/freeform-types";
import { CornerHandles } from "./corner-handles";
import { HANDLE_Z_OFFSET } from "@/types/constants";
import { useResizeHandler } from "@/hooks/freeform/use-resize-handler";

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
  const onMouseDown = useResizeHandler({
    block,
    interaction: { type: "corner", corner },
    blockPosition,
    camera,
  });

  return (
    <CornerHandles
      corner={corner}
      zIndex={blockPosition.z + HANDLE_Z_OFFSET}
      blockScreenRect={blockScreenRect}
      showHandle={isOnlySelected}
      disableResizing={disableResizing}
      onMouseDown={onMouseDown}
    />
  );
}
