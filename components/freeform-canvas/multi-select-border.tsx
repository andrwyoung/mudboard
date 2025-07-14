import { useFreeformStore } from "@/store/freeform-store";
import { useSelectionStore } from "@/store/selection-store";
import { COMPRESSED_IMAGE_WIDTH } from "@/types/upload-settings";
import { SideBorder } from "./resize/side-border";
import { ALL_CORNERS, ALL_SIDES } from "@/types/freeform-types";
import { CornerHandles } from "./resize/corner-handles";
import { useMemo } from "react";

export default function MultiSelectBorder({
  sectionId,
}: {
  sectionId: string;
}) {
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

  const multipleSelected = filteredBlocks.length > 1;

  if (!multipleSelected) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const block of filteredBlocks) {
    const pos = positions[block.block_id];
    if (!pos) continue;

    const scale = pos.scale ?? 1;
    const width = (block.width ?? COMPRESSED_IMAGE_WIDTH) * scale;
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
      {/* Side Borders */}
      {ALL_SIDES.map((side) => (
        <SideBorder
          key={side}
          side={side}
          blockScreenRect={blockScreenRect}
          isSelected={true}
          zIndex={10000}
          multipleSelected={false}
          disableResizing={false}
          onMouseDown={() => {}}
        />
      ))}

      {/* Corner Resizers */}
      {ALL_CORNERS.map((corner) => (
        <CornerHandles
          key={corner}
          corner={corner}
          blockScreenRect={blockScreenRect}
          zIndex={10001}
          disableResizing={false}
          onMouseDown={() => {}}
          isOnlySelected={true}
        />
      ))}
    </>
  );
}
