import {
  CameraType,
  FreeformPosition,
  useFreeformStore,
} from "@/store/freeform-store";
import { Block } from "@/types/block-types";
import { MAX_SCALE, MIN_PIXEL_SIZE, MIN_SCALE } from "@/types/constants";
import {
  BlockScreenRect,
  getCursorForSide,
  SideType,
} from "@/types/freeform-types";
import { COMPRESSED_IMAGE_WIDTH } from "@/types/upload-settings";

function getSizeDelta(newScale: number, startScale: number, dimension: number) {
  return dimension * (newScale - startScale);
}

export function useResizeHandler({
  block,
  side,
  blockPosition,
  camera,
}: {
  block: Block;
  side: SideType;
  blockPosition: FreeformPosition;
  camera: CameraType;
}) {
  const setPosition = useFreeformStore((s) => s.setPositionForBlock);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = blockPosition.scale;

    document.body.style.cursor = getCursorForSide(side);

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - startX) / camera.scale;
      const dy = (e.clientY - startY) / camera.scale;

      let newScale = startScale;
      let newX = blockPosition.x ?? 0;
      let newY = blockPosition.y ?? 0;

      const width = block.width ?? COMPRESSED_IMAGE_WIDTH;
      const height = block.height;

      if (side === "right") {
        const delta = dx;
        const scaleDelta = delta / width;
        newScale = startScale + scaleDelta;

        newX = blockPosition.x ?? 0;
        const heightDiff = getSizeDelta(newScale, startScale, height);
        newY = (blockPosition.y ?? 0) - heightDiff / 2;
      }

      if (side === "bottom") {
        const delta = dy;
        const scaleDelta = delta / height;
        newScale = startScale + scaleDelta;

        newY = blockPosition.y ?? 0;
        const widthDiff = getSizeDelta(newScale, startScale, width);
        newX = (blockPosition.x ?? 0) - widthDiff / 2;
      }

      if (side === "left") {
        const delta = -dx;
        const scaleDelta = delta / width;
        newScale = startScale + scaleDelta;

        const widthDiff = getSizeDelta(newScale, startScale, width);
        newX = (blockPosition.x ?? 0) - widthDiff;

        const heightDiff = getSizeDelta(newScale, startScale, height);
        newY = (blockPosition.y ?? 0) - heightDiff / 2;
      }

      if (side === "top") {
        const delta = -dy;
        const scaleDelta = delta / height;
        newScale = startScale + scaleDelta;

        newY = (blockPosition.y ?? 0) - delta;

        const widthDiff = getSizeDelta(newScale, startScale, width);
        newX = (blockPosition.x ?? 0) - widthDiff / 2;
      }

      const scaledWidth = (block.width ?? COMPRESSED_IMAGE_WIDTH) * newScale;
      const scaledHeight = block.height * newScale;

      if (
        newScale < MIN_SCALE ||
        newScale > MAX_SCALE ||
        scaledWidth < MIN_PIXEL_SIZE ||
        scaledHeight < MIN_PIXEL_SIZE
      ) {
        return;
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
