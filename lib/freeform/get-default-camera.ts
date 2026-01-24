import { CameraType, BoundingBox } from "@/store/freeform-store";
import { FREEFORM_MARGIN } from "@/types/constants";

export function getFitToScreenCamera(
  bounds: BoundingBox,
  canvasWidth: number,
  canvasHeight: number
): CameraType {
  console.log("bounds", bounds);

  const { minX, minY, maxX, maxY } = bounds;
  const layoutWidth = maxX - minX;
  const layoutHeight = maxY - minY;

  const paddedWidth = layoutWidth * (1 + FREEFORM_MARGIN * 2);
  const paddedHeight = layoutHeight * (1 + FREEFORM_MARGIN * 2);

  const scaleX = canvasWidth / paddedWidth;
  const scaleY = canvasHeight / paddedHeight;
  const scale = Math.min(scaleX, scaleY, 1); // prevent zooming in too much

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    x: canvasWidth / 2 - centerX * scale,
    y: canvasHeight / 2 - centerY * scale,
    scale,
  };
}
