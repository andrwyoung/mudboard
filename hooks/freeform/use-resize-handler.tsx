import {
  CameraType,
  FreeformPosition,
  useFreeformStore,
} from "@/store/freeform-store";
import { useSelectionStore } from "@/store/selection-store";
import { Block } from "@/types/block-types";
import {
  FREEFROM_DEFAULT_WIDTH,
  MAX_SCALE,
  MIN_PIXEL_SIZE,
  MIN_SCALE,
} from "@/types/constants";
import {
  CornerType,
  getCursorForCorner,
  getCursorForSide,
  SideType,
} from "@/types/freeform-types";

function getSizeDelta(newScale: number, startScale: number, dimension: number) {
  return dimension * (newScale - startScale);
}

export function useResizeHandler({
  block,
  interaction,
  blockPosition,
  camera,
}: {
  block: Block;
  interaction:
    | { type: "side"; side: SideType }
    | { type: "corner"; corner: CornerType };
  blockPosition: FreeformPosition;
  camera: CameraType;
}) {
  const setPosition = useFreeformStore((s) => s.setPositionForBlock);
  const selectBlock = useSelectionStore((s) => s.selectOnlyThisBlock);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    selectBlock("main", block);

    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = blockPosition.scale;
    const width = block.width ?? FREEFROM_DEFAULT_WIDTH;
    const height = block.height;

    document.body.style.cursor =
      interaction.type === "side"
        ? getCursorForSide(interaction.side)
        : getCursorForCorner(interaction.corner);

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - startX) / camera.scale;
      const dy = (e.clientY - startY) / camera.scale;

      let newScale = startScale;
      let newX = blockPosition.x ?? 0;
      let newY = blockPosition.y ?? 0;

      if (interaction.type === "side") {
        const side = interaction.side;

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
      } else {
        const corner = interaction.corner;

        const signX =
          corner === "top-left" || corner === "bottom-left" ? -1 : 1;
        const signY = corner === "top-left" || corner === "top-right" ? -1 : 1;

        const scaleDeltaX = (signX * dx) / width;
        const scaleDeltaY = (signY * dy) / height;
        const avgScaleDelta = (scaleDeltaX + scaleDeltaY) / 2;

        newScale = startScale + avgScaleDelta;

        const widthDiff = getSizeDelta(newScale, startScale, width);
        const heightDiff = getSizeDelta(newScale, startScale, height);

        if (corner === "top-left") {
          newX = newX - widthDiff;
          newY = newY - heightDiff;
        } else if (corner === "top-right") {
          newY = newY - heightDiff;
        } else if (corner === "bottom-left") {
          newX = newX - widthDiff;
        }
      }

      const scaledWidth = (block.width ?? FREEFROM_DEFAULT_WIDTH) * newScale;
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
