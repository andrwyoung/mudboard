import { CameraType, useFreeformStore } from "@/store/freeform-store";
import { useSelectionStore } from "@/store/selection-store";
import { Block } from "@/types/block-types";
import { BlockChooser } from "../blocks/memoized-block";
import { COMPRESSED_IMAGE_WIDTH } from "@/types/upload-settings";
import { AllBorderHandles } from "./resize/all-borders-handler";

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
  const { getCamera, positionMap } = useFreeformStore();
  const camera = getCamera(sectionId);
  const pos = positionMap[sectionId]?.[block.block_id] ?? {
    x: 0,
    y: 0,
    z: 0,
    scale: 1,
  };

  const selectOnlyThisBlock = useSelectionStore((s) => s.selectOnlyThisBlock);
  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const isSelected = !!selectedBlocks[block.block_id];

  const worldX = pos.x ?? 0;
  const worldY = pos.y ?? 0;
  const worldScale = pos.scale ?? 1;

  const screenX = worldX * camera.scale + camera.x;
  const screenY = worldY * camera.scale + camera.y;
  const screenScale = worldScale * camera.scale;

  const scaledBlockWidth =
    (block.width ?? COMPRESSED_IMAGE_WIDTH) * screenScale;
  const scaledBlockHeight = block.height * screenScale;

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
      {editMode && isSelected && (
        <AllBorderHandles
          blockScreenRect={{
            x: screenX,
            y: screenY,
            width: scaledBlockWidth,
            height: scaledBlockHeight,
          }}
        />
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
