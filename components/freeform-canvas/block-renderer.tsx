import { CameraType, useFreeformStore } from "@/store/freeform-store";
import { useSelectionStore } from "@/store/selection-store";
import { Block } from "@/types/block-types";
import { BlockChooser } from "../blocks/memoized-block";
import { COMPRESSED_IMAGE_WIDTH } from "@/types/upload-settings";
import { SideBorder } from "./resize/side-border";
import {
  ALL_CORNERS,
  ALL_SIDES,
  BlockScreenRect,
} from "@/types/freeform-types";
import { CornerHandles } from "./resize/corner-resize";

const draggingRefs: Record<string, boolean> = {};
const lastMouse: Record<string, { x: number; y: number }> = {};

export function BlockRenderer({
  block,
  sectionId,
  editMode,
  spacebarDown,
}: {
  block: Block;
  sectionId: string;
  editMode: boolean;
  spacebarDown: boolean;
}) {
  const { getCamera, getBlockPosition } = useFreeformStore();
  const camera = getCamera(sectionId);
  const blockPos = getBlockPosition(sectionId, block.block_id);

  const selectOnlyThisBlock = useSelectionStore((s) => s.selectOnlyThisBlock);
  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const isSelected = !!selectedBlocks[block.block_id];

  const worldX = blockPos.x ?? 0;
  const worldY = blockPos.y ?? 0;
  const worldScale = blockPos.scale ?? 1;

  const screenX = worldX * camera.scale + camera.x;
  const screenY = worldY * camera.scale + camera.y;
  const screenScale = worldScale * camera.scale;

  const scaledBlockWidth =
    (block.width ?? COMPRESSED_IMAGE_WIDTH) * screenScale;
  const scaledBlockHeight = block.height * screenScale;

  const blockScreenRect: BlockScreenRect = {
    x: screenX,
    y: screenY,
    width: scaledBlockWidth,
    height: scaledBlockHeight,
  };

  function handleMouseDown(blockId: string, camera: CameraType) {
    draggingRefs[blockId] = true;

    function onMouseMove(e: MouseEvent) {
      if (!draggingRefs[blockId]) return;

      const dx = e.clientX - lastMouse[blockId].x;
      const dy = e.clientY - lastMouse[blockId].y;

      lastMouse[blockId] = { x: e.clientX, y: e.clientY };

      useFreeformStore
        .getState()
        .setPositionForBlock(sectionId, blockId, (prev) => ({
          x: (prev?.x ?? 0) + dx / camera.scale,
          y: (prev?.y ?? 0) + dy / camera.scale,
        }));
    }

    function onMouseUp() {
      draggingRefs[blockId] = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  return (
    <div>
      {editMode && (
        <>
          {ALL_SIDES.map((side) => (
            <SideBorder
              key={side}
              side={side}
              block={block}
              blockScreenRect={blockScreenRect}
              blockPosition={blockPos}
              camera={camera}
              isSelected={isSelected}
            />
          ))}
          {ALL_CORNERS.map((corner) => (
            <CornerHandles
              key={corner}
              corner={corner}
              block={block}
              blockScreenRect={blockScreenRect}
              blockPosition={blockPos}
              camera={camera}
              isSelected={isSelected}
            />
          ))}
        </>
      )}

      <div
        style={{
          position: "absolute",
          left: screenX,
          top: screenY,
          transform: `scale(${screenScale})`,
          transformOrigin: "top left",
          width: block.width, // or block.width if you have one
          height: block.height, // or block.height
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return; // only respond to left-click
          if (!editMode || (editMode && spacebarDown)) return;

          e.stopPropagation();

          if (!isSelected) {
            selectOnlyThisBlock("main", block);
          }

          lastMouse[block.block_id] = { x: e.clientX, y: e.clientY };
          handleMouseDown(block.block_id, camera);
        }}
        data-id={`main::block-freeform`}
        className={`absolute z-0`}
      >
        <BlockChooser canEdit={true} block={block} numCols={4} />
      </div>
    </div>
  );
}
