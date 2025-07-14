import {
  CameraType,
  FreeformPosition,
  useFreeformStore,
} from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { MAX_SCALE, MIN_PIXEL_SIZE, MIN_SCALE } from "@/types/constants";
import {
  CornerType,
  getCursorForCorner,
  getCursorForSide,
  SideType,
} from "@/types/freeform-types";
import { COMPRESSED_IMAGE_WIDTH } from "@/types/upload-settings";

export function useMultiCornerResizeHandler({
  blocksWithPositions,
  corner,
  camera,
}: {
  blocksWithPositions: { block: Block; blockPos: FreeformPosition }[];
  corner: CornerType;
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

    document.body.style.cursor = getCursorForCorner(corner);

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

      if (corner === "top-left") {
        const deltaX = -dx;
        const deltaY = -dy;

        newBoxWidth = boxWidth + deltaX;
        newBoxHeight = boxHeight + deltaY;

        const scaleRatioX = newBoxWidth / boxWidth;
        const scaleRatioY = newBoxHeight / boxHeight;

        scaleRatio = Math.min(scaleRatioX, scaleRatioY); // uniform scale

        newBoxWidth = boxWidth * scaleRatio;
        newBoxHeight = boxHeight * scaleRatio;

        anchorX = initialBoundingBox.x + boxWidth;
        anchorY = initialBoundingBox.y + boxHeight;

        newTopLeftX = anchorX - newBoxWidth;
        newTopLeftY = anchorY - newBoxHeight;
      }

      if (corner === "top-right") {
        const deltaX = dx;
        const deltaY = -dy;

        newBoxWidth = boxWidth + deltaX;
        newBoxHeight = boxHeight + deltaY;

        const scaleRatioX = newBoxWidth / boxWidth;
        const scaleRatioY = newBoxHeight / boxHeight;

        scaleRatio = Math.min(scaleRatioX, scaleRatioY);

        newBoxWidth = boxWidth * scaleRatio;
        newBoxHeight = boxHeight * scaleRatio;

        anchorX = initialBoundingBox.x;
        anchorY = initialBoundingBox.y + boxHeight;

        newTopLeftX = anchorX;
        newTopLeftY = anchorY - newBoxHeight;
      }

      if (corner === "bottom-left") {
        const deltaX = -dx;
        const deltaY = dy;

        newBoxWidth = boxWidth + deltaX;
        newBoxHeight = boxHeight + deltaY;

        const scaleRatioX = newBoxWidth / boxWidth;
        const scaleRatioY = newBoxHeight / boxHeight;

        scaleRatio = Math.min(scaleRatioX, scaleRatioY);

        newBoxWidth = boxWidth * scaleRatio;
        newBoxHeight = boxHeight * scaleRatio;

        anchorX = initialBoundingBox.x + boxWidth;
        anchorY = initialBoundingBox.y;

        newTopLeftX = anchorX - newBoxWidth;
        newTopLeftY = anchorY;
      }

      if (corner === "bottom-right") {
        const deltaX = dx;
        const deltaY = dy;

        newBoxWidth = boxWidth + deltaX;
        newBoxHeight = boxHeight + deltaY;

        const scaleRatioX = newBoxWidth / boxWidth;
        const scaleRatioY = newBoxHeight / boxHeight;

        scaleRatio = Math.min(scaleRatioX, scaleRatioY);

        newBoxWidth = boxWidth * scaleRatio;
        newBoxHeight = boxHeight * scaleRatio;

        anchorX = initialBoundingBox.x;
        anchorY = initialBoundingBox.y;

        newTopLeftX = anchorX;
        newTopLeftY = anchorY;
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
