import {
  CameraType,
  FreeformPosition,
  useFreeformStore,
} from "@/store/freeform-store";
import { useUndoStore } from "@/store/undo-store";
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

export function useMultiResizeHandler({
  blocksWithPositions,
  interaction,
  camera,
  sectionId,
}: {
  blocksWithPositions: { block: Block; blockPos: FreeformPosition }[];
  interaction:
    | { type: "side"; side: SideType }
    | { type: "corner"; corner: CornerType };
  camera: CameraType;
  sectionId: string;
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
          (block.width ?? FREEFROM_DEFAULT_WIDTH) * blockPos.scale
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

    document.body.style.cursor =
      interaction.type === "side"
        ? getCursorForSide(interaction.side)
        : getCursorForCorner(interaction.corner);

    // UNDO
    const undoStore = useUndoStore.getState();
    const initialPositions = Object.fromEntries(
      blocksWithPositions.map(({ block, blockPos }) => [
        block.block_id,
        {
          x: blockPos.x ?? 0,
          y: blockPos.y ?? 0,
          scale: blockPos.scale,
        },
      ])
    );

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

      if (interaction.type === "side") {
        const side = interaction.side;

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

        // CORNERS
        //
      } else {
        const corner = interaction.corner;

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
      }

      for (const { block, blockPos } of blocksWithPositions) {
        const newScale = blockPos.scale * scaleRatio;
        const newWidth = (block.width ?? FREEFROM_DEFAULT_WIDTH) * newScale;
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

        setPosition(sectionId, block.block_id, {
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

      const finalPositions =
        useFreeformStore.getState().positionMap[sectionId] ?? {};

      const hasChanged = Object.entries(initialPositions).some(
        ([blockId, initial]) => {
          const final = finalPositions[blockId];
          return (
            final &&
            (final.x !== initial.x ||
              final.y !== initial.y ||
              final.scale !== initial.scale)
          );
        }
      );

      if (hasChanged) {
        undoStore.execute({
          label: "Resize blocks",
          scope: "freeform",
          sectionId,
          undo: () => {
            for (const [blockId, pos] of Object.entries(initialPositions)) {
              setPosition(sectionId, blockId, pos);
            }
          },
          do: () => {
            for (const [blockId, pos] of Object.entries(finalPositions)) {
              setPosition(sectionId, blockId, pos);
            }
          },
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return onMouseDown;
}
