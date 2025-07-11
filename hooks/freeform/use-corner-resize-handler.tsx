import {
  CameraType,
  FreeformPosition,
  useFreeformStore,
} from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { MAX_SCALE, MIN_PIXEL_SIZE, MIN_SCALE } from "@/types/constants";
import { BlockScreenRect, CornerType } from "@/types/freeform-types";
import { COMPRESSED_IMAGE_WIDTH } from "@/types/upload-settings";

export function useCornerResizeHandler({
  block,
  corner,
  blockPosition,
  camera,
}: {
  block: Block;
  corner: CornerType;
  blockPosition: FreeformPosition;
  camera: CameraType;
}) {
  const setPosition = useFreeformStore((s) => s.setPositionForBlock);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = blockPosition.scale;
    const width = block.width ?? COMPRESSED_IMAGE_WIDTH;
    const height = block.height;

    document.body.style.cursor =
      corner === "top-left" || corner === "bottom-right"
        ? "nwse-resize"
        : "nesw-resize";

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - startX) / camera.scale;
      const dy = (e.clientY - startY) / camera.scale;

      let newScale = startScale;
      let newX = blockPosition.x ?? 0;
      let newY = blockPosition.y ?? 0;

      // Determine direction multiplier based on corner
      const signX = corner === "top-left" || corner === "bottom-left" ? -1 : 1;
      const signY = corner === "top-left" || corner === "top-right" ? -1 : 1;

      const scaleDeltaX = (signX * dx) / width;
      const scaleDeltaY = (signY * dy) / height;

      const avgScaleDelta = (scaleDeltaX + scaleDeltaY) / 2;
      newScale = startScale + avgScaleDelta;

      // Early bailout on limits
      const scaledWidth = width * newScale;
      const scaledHeight = height * newScale;

      if (
        newScale < MIN_SCALE ||
        newScale > MAX_SCALE ||
        scaledWidth < MIN_PIXEL_SIZE ||
        scaledHeight < MIN_PIXEL_SIZE
      ) {
        return;
      }

      // Anchor position updates
      const widthDiff = scaledWidth - width * startScale;
      const heightDiff = scaledHeight - height * startScale;

      if (corner === "top-left") {
        newX = (blockPosition.x ?? 0) - widthDiff;
        newY = (blockPosition.y ?? 0) - heightDiff;
      } else if (corner === "top-right") {
        newX = blockPosition.x ?? 0;
        newY = (blockPosition.y ?? 0) - heightDiff;
      } else if (corner === "bottom-left") {
        newX = (blockPosition.x ?? 0) - widthDiff;
        newY = blockPosition.y ?? 0;
      } else if (corner === "bottom-right") {
        newX = blockPosition.x ?? 0;
        newY = blockPosition.y ?? 0;
      }

      setPosition(block.section_id, block.block_id, {
        scale: newScale,
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      document.body.style.cursor = "default";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return onMouseDown;
}
