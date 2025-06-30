// this is what a block is

import { memo } from "react";
import { SortableBlock } from "@/components/drag/sortable-wrapper";
import { Block, MudboardImage } from "@/types/block-types";
import { ImageBlock } from "./image-block";
import TextBlock from "./text-block";
import { useGetScope } from "@/hooks/use-get-scope";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { useOverlayStore } from "@/store/overlay-store";
import { useSelectionStore } from "@/store/selection-store";
import { useIsMirror } from "@/app/b/[boardId]/board";
import { downloadImagesAsZip } from "../download-images/zip-images";
import { deleteBlocksWithUndo } from "@/lib/undoable-actions/undoable-delete-blocks";
import { getImageUrl } from "@/utils/get-image-url";
import { usePanelStore } from "@/store/panel-store";
import { useLayoutStore } from "@/store/layout-store";
import { copyImageToClipboard } from "@/lib/local-helpers/copy-image-to-clipboard";

export function BlockChooser({
  canEdit,
  block,
  shouldEagerLoad,
  columnWidth,
  numCols,
}: {
  canEdit: boolean;
  block: Block;
  shouldEagerLoad: boolean;
  columnWidth: number;
  numCols: number;
}) {
  switch (block.block_type) {
    case "image":
      return (
        <ImageBlock
          canEdit={canEdit}
          block={block}
          shouldEagerLoad={shouldEagerLoad}
          columnWidth={columnWidth}
          numCols={numCols}
        />
      );
    case "text":
      return <TextBlock block={block} canEdit={canEdit} />;
    case "spacer":
      return <div className="h-8 w-full bg-transparent" />; // placeholder
    default:
      return null;
  }
}

function BlockComponent({
  canEdit,
  block,
  isSelected,
  isDragging,
  onClick,
  shouldEagerLoad,
  columnWidth,
  numCols,
  addImage,
  addText,
}: {
  canEdit: boolean;
  block: Block;
  isSelected: boolean;
  isDragging: boolean;
  onClick: (e: React.MouseEvent) => void;
  shouldEagerLoad: boolean;
  columnWidth: number;
  numCols: number;
  addImage: () => void;
  addText: () => void;
}) {
  const position = useLayoutStore((s) => s.getBlockPosition(block.block_id));
  const isMirror = useIsMirror();
  const scope = useGetScope();

  const { openOverlay } = useOverlayStore(scope);

  const openPinnedPanelWithBlock = usePanelStore(
    (s) => s.openPinnedPanelWithBlock
  );

  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const deselectBlocks = useSelectionStore((s) => s.deselectBlocks);
  const selectOnlyThisBlock = useSelectionStore((s) => s.selectOnlyThisBlock);
  const selectedBlocksLength = Object.entries(selectedBlocks).length;
  const currentBlockSelected = !!selectedBlocks[block.block_id];

  return (
    <ContextMenu>
      <ContextMenuTrigger
        asChild
        onContextMenu={() => {
          const alreadySelected = !!selectedBlocks[block.block_id];
          if (!alreadySelected) {
            deselectBlocks();
            selectOnlyThisBlock(scope, block);
          }
        }}
      >
        <div
          // layoutId={`block-${block.block_id}`} // for animating
          data-id={`${scope}::block-${block.block_id}`} // for sortable
          tabIndex={-1}
          className={`flex flex-col rounded-sm object-cover transition-all duration-150 cursor-pointer shadow-md 
              hover:scale-101 hover:shadow-xl hover:opacity-100
              relative bg-background
          ${isDragging ? "opacity-30" : ""} 
          ${
            isSelected
              ? canEdit
                ? "outline-4 outline-accent"
                : "outline-4 outline-secondary"
              : ""
          }`}
          onClick={onClick}
        >
          <SortableBlock
            canEdit={canEdit}
            id={`${scope}::block-${block.block_id}`}
            isMirror={isMirror}
            sectionId={block.section_id}
          >
            {false && process.env.NODE_ENV === "development" && (
              <h1 className="absolute text-xs top-2 right-2 text-slate-600 z-10 py-0.5 px-1 bg-white rounded-sm shadow-sm">
                y:{position?.colIndex}, x:{position?.rowIndex}, o:{" "}
                {position?.orderIndex}
                {/* , t:{position?.top}, h:{position?.height} */}
              </h1>
            )}
            <BlockChooser
              canEdit={canEdit}
              block={block}
              shouldEagerLoad={shouldEagerLoad}
              columnWidth={columnWidth}
              numCols={numCols}
            />
          </SortableBlock>
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
            <ContextMenuItem onClick={() => openOverlay(block)}>
              Expand
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
            {selectedBlocksLength === 1 ? (
              <ContextMenuItem
                onClick={() => {
                  if (block.data) {
                    const image = block.data as MudboardImage;

                    const url = getImageUrl(
                      image.image_id,
                      image.file_ext,
                      "full"
                    );
                    const filename = image.original_name ?? "image";

                    const link = document.createElement("a");
                    link.href = url;
                    link.download = filename;
                    link.target = "_blank"; // optional: in case browser blocks download
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
              >
                Download Image
              </ContextMenuItem>
            ) : (
              <>
                {/* <ContextMenuItem onClick={() => console.log("hey")}>
                Group Selected
              </ContextMenuItem> */}
                <ContextMenuItem
                  onClick={() => {
                    const selected = Object.values(selectedBlocks);
                    downloadImagesAsZip(selected);
                  }}
                >
                  Download Selected
                </ContextMenuItem>
              </>
            )}
          </>
        )}

        {canEdit && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>Add Below</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={addImage}>Image</ContextMenuItem>
              <ContextMenuItem onClick={addText}>Text</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        {/* 
        <ContextMenuItem onClick={() => deselectBlocks()}>
          Deselect
        </ContextMenuItem> */}

        {canEdit && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => {
                // default to deleting the current block
                let blocksToDelete = [block];

                const selectedBlockIds = Object.keys(selectedBlocks);

                // but if there are multiple selected and current block is in there, then delete all
                if (selectedBlockIds.length > 1 && currentBlockSelected) {
                  blocksToDelete = Object.values(selectedBlocks);
                }

                deleteBlocksWithUndo(blocksToDelete);
              }}
              variant="destructive"
            >
              Delete{" "}
              {currentBlockSelected &&
                selectedBlocksLength !== 1 &&
                selectedBlocksLength}
              <ContextMenuShortcut>Del</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const MemoizedBlock = memo(BlockComponent);
