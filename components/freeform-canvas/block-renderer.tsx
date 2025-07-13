import { CameraType, useFreeformStore } from "@/store/freeform-store";
import { useSelectionStore } from "@/store/selection-store";
import { Block, MudboardImage } from "@/types/block-types";
import { BlockChooser } from "../blocks/memoized-block";
import { COMPRESSED_IMAGE_WIDTH } from "@/types/upload-settings";
import { SideBorder } from "./resize/side-border";
import {
  ALL_CORNERS,
  ALL_SIDES,
  BlockScreenRect,
} from "@/types/freeform-types";
import { CornerHandles } from "./resize/corner-resize";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { getImageUrl } from "@/utils/get-image-url";
import { copyImageToClipboard } from "@/lib/local-helpers/copy-image-to-clipboard";
import { usePanelStore } from "@/store/panel-store";
import { fireConfetti } from "@/utils/fire-confetti";

const draggingRefs: Record<string, boolean> = {};
const lastMouse: Record<string, { x: number; y: number }> = {};

export function BlockRenderer({
  block,
  sectionId,
  editMode,
  setEditMode,
  spacebarDown,
  disableResizing,
}: {
  block: Block;
  sectionId: string;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  spacebarDown: boolean;
  disableResizing: boolean;
}) {
  const { getCamera, getBlockPosition } = useFreeformStore();
  const camera = getCamera(sectionId);
  const blockPos = getBlockPosition(sectionId, block.block_id);

  const selectOnlyThisBlock = useSelectionStore((s) => s.selectOnlyThisBlock);
  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const isSelected = !!selectedBlocks[block.block_id];

  const openPinnedPanelWithBlock = usePanelStore(
    (s) => s.openPinnedPanelWithBlock
  );

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
    <ContextMenu>
      <ContextMenuTrigger
        asChild
        onContextMenu={() => {
          if (!isSelected) {
            selectOnlyThisBlock("main", block);
          }
        }}
      >
        <div style={{}}>
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
                  isOnlySelected={isSelected}
                  disableResizing={disableResizing}
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
                  isOnlySelected={isSelected}
                  disableResizing={disableResizing}
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
              zIndex: blockPos.z,
            }}
            onMouseDown={(e) => {
              console.log("blockPos: ", blockPos);

              if (e.button !== 0) return; // only respond to left-click
              if (!editMode || (editMode && spacebarDown)) return;

              e.stopPropagation();

              if (!isSelected) {
                selectOnlyThisBlock("main", block);

                // bring it to the front
                useFreeformStore
                  .getState()
                  .setPositionForBlock(sectionId, block.block_id, () => ({
                    z: useFreeformStore
                      .getState()
                      .getAndIncrementZIndex(sectionId),
                  }));
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
      </ContextMenuTrigger>
      <ContextMenuContent>
        {block.block_type === "image" && (
          <>
            <ContextMenuItem
              onClick={async () => {
                if (block.data) {
                  const image = block.data as MudboardImage;
                  const url = getImageUrl(
                    image.image_id,
                    image.file_ext,
                    "full"
                  );
                  await copyImageToClipboard(url);
                }
              }}
            >
              Copy Image
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                // if (!pinnedStoreOpen) {
                //   setSidebarCollapsed(true);
                // }
                openPinnedPanelWithBlock(block);
              }}
            >
              Spotlight Image
            </ContextMenuItem>
          </>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => {
            fireConfetti();
          }}
        >
          Celebrate?
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => setEditMode(!editMode)}>
          Change Mode
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
