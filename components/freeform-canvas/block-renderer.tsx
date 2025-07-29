import { useFreeformStore } from "@/store/freeform-store";
import { useSelectionStore } from "@/store/selection-store";
import { Block, MudboardImage } from "@/types/block-types";
import { BlockChooser } from "../blocks/memoized-block";
import {
  ALL_CORNERS,
  ALL_SIDES,
  BlockScreenRect,
} from "@/types/freeform-types";
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
import SingleBlockSideBorder from "./resize/single-block-side-borders";
import SingleBlockCornerResize from "./resize/single-block-corner-handles";
import { useBlockDragHandler } from "@/lib/freeform/drag/block-drag-handler";
import { FREEFROM_DEFAULT_WIDTH } from "@/types/constants";

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
  const multipleSelected = Object.keys(selectedBlocks).length > 1;
  const isOnlySelected = isSelected && Object.keys(selectedBlocks).length === 1;

  const openPinnedPanelWithBlock = usePanelStore(
    (s) => s.openPinnedPanelWithBlock
  );

  // dragging behavior
  const worldX = blockPos.x ?? 0;
  const worldY = blockPos.y ?? 0;
  const worldScale = blockPos.scale ?? 1;

  const screenX = worldX * camera.scale + camera.x;
  const screenY = worldY * camera.scale + camera.y;
  const screenScale = worldScale * camera.scale;

  const scaledBlockWidth =
    (block.width ?? FREEFROM_DEFAULT_WIDTH) * screenScale;
  const scaledBlockHeight = block.height * screenScale;

  const blockScreenRect: BlockScreenRect = {
    x: screenX,
    y: screenY,
    width: scaledBlockWidth,
    height: scaledBlockHeight,
  };

  const { handleMouseDown } = useBlockDragHandler({
    selectedBlock: block,
    sectionId,
    camera,
    isSelected,
    editMode,
    spacebarDown,
  });

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
                <SingleBlockSideBorder
                  key={side}
                  side={side}
                  block={block}
                  blockScreenRect={blockScreenRect}
                  blockPosition={blockPos}
                  camera={camera}
                  isSelected={isSelected}
                  multipleSelected={multipleSelected}
                  disableResizing={disableResizing || multipleSelected}
                  sectionId={sectionId}
                />
              ))}
              {ALL_CORNERS.map((corner) => (
                <SingleBlockCornerResize
                  key={corner}
                  corner={corner}
                  block={block}
                  blockScreenRect={blockScreenRect}
                  blockPosition={blockPos}
                  camera={camera}
                  isOnlySelected={isOnlySelected}
                  disableResizing={disableResizing || multipleSelected}
                  sectionId={sectionId}
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
            onMouseDown={handleMouseDown}
            data-id={`main::block-${block.block_id}`}
            className={`absolute z-0 select-none`}
          >
            <BlockChooser canEdit={true} block={block} numCols={5} />
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
              Spotlight
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
