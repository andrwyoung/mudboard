import { FreeformPosition, useFreeformStore } from "@/store/freeform-store";
import { useSelectionStore } from "@/store/selection-store";
import { ALL_CORNERS, ALL_SIDES } from "@/types/freeform-types";
import { useMemo } from "react";
import { FREEFROM_DEFAULT_WIDTH, Z_INDEX_INCREMENT } from "@/types/constants";
import MultiBlockSideBorder from "./resize/multi-side-border";
import { Block } from "@/types/block-types";
import MultiBlockCornerResize from "./resize/multi-corner-handles";
import { useMultiBlockDragHandler } from "@/lib/freeform/drag/selection-drag-handler";
import { runFreeformAutoLayout } from "@/lib/freeform/autolayout/run-autolayout";
import { MdAutoAwesomeMosaic } from "react-icons/md";

export default function MultiSelectBorder({
  sectionId,
  isPanning,
  editMode,
}: {
  sectionId: string;
  isPanning: boolean;
  editMode: boolean;
}) {
  const topZIndex =
    useFreeformStore((s) => s.topZIndexMap[sectionId]) + Z_INDEX_INCREMENT;

  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const positionMap = useFreeformStore((s) => s.positionMap?.[sectionId]);
  const camera = useFreeformStore((s) => s.getCamera)(sectionId);

  const positions = useMemo(() => {
    return Object.fromEntries(
      Object.values(selectedBlocks)
        .filter((block) => block.section_id === sectionId)
        .map((block) => [block.block_id, positionMap?.[block.block_id] ?? null])
    );
  }, [selectedBlocks, sectionId, positionMap]);

  const filteredBlocks = Object.values(selectedBlocks).filter(
    (block) => block.section_id === sectionId
  );

  const blocksWithPositions = useMemo(() => {
    return filteredBlocks
      .map((block) => {
        const blockPos = positions[block.block_id];
        if (!blockPos) return null;
        return { block, blockPos };
      })
      .filter(
        (item): item is { block: Block; blockPos: FreeformPosition } =>
          item !== null
      );
  }, [filteredBlocks, positions]);

  const multipleSelected = filteredBlocks.length > 1;

  // hooks
  const { handleMouseDown } = useMultiBlockDragHandler({
    sectionId,
    camera,
    editMode,
    spacebarDown: isPanning,
  });

  if (!multipleSelected) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const block of filteredBlocks) {
    const pos = positions[block.block_id];
    if (!pos) continue;

    const scale = pos.scale ?? 1;
    const width = (block.width ?? FREEFROM_DEFAULT_WIDTH) * scale;
    const height = block.height * scale;

    const x = pos.x ?? 0;
    const y = pos.y ?? 0;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  // Convert to screen coordinates
  const screenX = minX * camera.scale + camera.x;
  const screenY = minY * camera.scale + camera.y;
  const screenWidth = (maxX - minX) * camera.scale;
  const screenHeight = (maxY - minY) * camera.scale;

  const blockScreenRect = {
    x: screenX,
    y: screenY,
    width: screenWidth,
    height: screenHeight,
  };

  return (
    <>
      <div
        onMouseDown={handleMouseDown}
        data-id="freeform-multi-select-box"
        style={{
          left: `${blockScreenRect.x}px`,
          top: `${blockScreenRect.y}px`,
          width: `${blockScreenRect.width}px`,
          height: `${blockScreenRect.height}px`,
          cursor: isPanning ? "grab" : "move",
        }}
        className="absolute -z-10 "
      />

      <div
        data-id="freeform-select-actions"
        style={{
          left: `${blockScreenRect.x + 16}px`,
          top: `${blockScreenRect.y + 16}px`,
          zIndex: topZIndex + Z_INDEX_INCREMENT,
        }}
        className="absolute"
      >
        <button
          type="button"
          aria-label="Run auto-layout for selected blocks"
          title="Auto-layout Selection"
          onClick={(e) => {
            e.stopPropagation();
            runFreeformAutoLayout(filteredBlocks, sectionId);
          }}
          className="w-4 h-4 cursor-pointer hover:text-accent text-white"
        >
          <MdAutoAwesomeMosaic className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Side Borders */}
      {ALL_SIDES.map((side) => (
        <MultiBlockSideBorder
          key={side}
          side={side}
          blocksWithPositions={blocksWithPositions}
          blockScreenRect={blockScreenRect}
          disableResizing={isPanning}
          camera={camera}
          zIndex={topZIndex}
        />
      ))}

      {/* Corner Resizers */}
      {ALL_CORNERS.map((corner) => (
        <MultiBlockCornerResize
          key={corner}
          corner={corner}
          blocksWithPositions={blocksWithPositions}
          blockScreenRect={blockScreenRect}
          disableResizing={isPanning}
          camera={camera}
          zIndex={topZIndex}
        />
      ))}
    </>
  );
}
