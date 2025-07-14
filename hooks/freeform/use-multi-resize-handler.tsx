import {
  CameraType,
  FreeformPosition,
  useFreeformStore,
} from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { MAX_SCALE, MIN_PIXEL_SIZE, MIN_SCALE } from "@/types/constants";
import { getCursorForSide, SideType } from "@/types/freeform-types";
import { COMPRESSED_IMAGE_WIDTH } from "@/types/upload-settings";

export function useMultiResizeHandler({
  blocksWithPositions,
  side,
  camera,
}: {
  blocksWithPositions: { block: Block; blockPos: FreeformPosition }[];
  side: SideType;
  camera: CameraType;
}) {
  const setPosition = useFreeformStore((s) => s.setPositionForBlock);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;

    // calculate bounding box
    //
    const boxX = Math.min(
      ...blocksWithPositions.map(({ blockPos }) => blockPos.x ?? 0)
    );
    const boxY = Math.min(
      ...blocksWithPositions.map(({ blockPos }) => blockPos.y ?? 0)
    );
    const boxRight = Math.max(
      ...blocksWithPositions.map(
        ({ block, blockPos }) =>
          (blockPos.x ?? 0) +
          (block.width ?? COMPRESSED_IMAGE_WIDTH) * blockPos.scale
      )
    );
    const boxBottom = Math.max(
      ...blocksWithPositions.map(
        ({ block, blockPos }) =>
          (blockPos.y ?? 0) + block.height * blockPos.scale
      )
    );
    const initialBoundingBox = {
      x: boxX,
      y: boxY,
      width: boxRight - boxX,
      height: boxBottom - boxY,
    };

    document.body.style.cursor = getCursorForSide(side);

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - startX) / camera.scale;
      const dy = (e.clientY - startY) / camera.scale;

      const boxWidth = initialBoundingBox.width;
      const boxHeight = initialBoundingBox.height;

      let scaleRatio = 1;
      let newBoxWidth = boxWidth;
      let newBoxHeight = boxHeight;
      let anchorX = initialBoundingBox.x;
      let anchorY = initialBoundingBox.y;
      let newTopLeftX = initialBoundingBox.x;
      let newTopLeftY = initialBoundingBox.y;

      if (side === "bottom") {
        const delta = dy;
        newBoxHeight = boxHeight + delta;
        scaleRatio = newBoxHeight / boxHeight;

        newBoxWidth = boxWidth * scaleRatio;

        anchorX = initialBoundingBox.x + boxWidth / 2;
        anchorY = initialBoundingBox.y;

        newTopLeftX = anchorX - newBoxWidth / 2;
        newTopLeftY = anchorY;
      }

      if (side === "top") {
        const delta = -dy;
        newBoxHeight = boxHeight + delta;

        scaleRatio = newBoxHeight / boxHeight;
        newBoxWidth = boxWidth * scaleRatio;

        anchorX = initialBoundingBox.x + boxWidth / 2;
        anchorY = initialBoundingBox.y + boxHeight;

        newTopLeftX = anchorX - newBoxWidth / 2;
        newTopLeftY = anchorY - newBoxHeight;
      }

      if (side === "left") {
        const delta = -dx;
        newBoxWidth = boxWidth + delta;

        scaleRatio = newBoxWidth / boxWidth;
        newBoxHeight = boxHeight * scaleRatio;

        anchorX = initialBoundingBox.x + boxWidth;
        anchorY = initialBoundingBox.y + boxHeight / 2;

        newTopLeftX = anchorX - newBoxWidth;
        newTopLeftY = anchorY - newBoxHeight / 2;
      }

      if (side === "right") {
        const delta = dx;
        newBoxWidth = boxWidth + delta;

        scaleRatio = newBoxWidth / boxWidth;

        newBoxHeight = boxHeight * scaleRatio;

        anchorX = initialBoundingBox.x;
        anchorY = initialBoundingBox.y + boxHeight / 2;

        newTopLeftX = anchorX;
        newTopLeftY = anchorY - newBoxHeight / 2;
      }

      for (const { block, blockPos } of blocksWithPositions) {
        const newScale = blockPos.scale * scaleRatio;
        const newWidth = (block.width ?? COMPRESSED_IMAGE_WIDTH) * newScale;
        const newHeight = block.height * newScale;

        if (
          newWidth < MIN_PIXEL_SIZE ||
          newHeight < MIN_PIXEL_SIZE ||
          newScale < MIN_SCALE ||
          newScale > MAX_SCALE
        ) {
          return; // bail if any block would be invalid
        }
      }

      // shared block repositioning
      for (const { block, blockPos } of blocksWithPositions) {
        const relX = (blockPos.x ?? 0) - initialBoundingBox.x;
        const relY = (blockPos.y ?? 0) - initialBoundingBox.y;

        const relXRatio = relX / boxWidth;
        const relYRatio = relY / boxHeight;

        const newX = newTopLeftX + relXRatio * newBoxWidth;
        const newY = newTopLeftY + relYRatio * newBoxHeight;

        setPosition(block.section_id, block.block_id, {
          scale: blockPos.scale * scaleRatio,
          x: newX,
          y: newY,
        });
      }
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
