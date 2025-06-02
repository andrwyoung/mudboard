import { memo } from "react";
import { SortableItem } from "@/components/drag/sortable-wrapper";
import { Block, MudboardImage } from "@/types/block-types";
import { getImageUrl, ImageBlock } from "./image-block";
import TextBlock from "./text-block";
import { useGetScope } from "@/hooks/use-get-scope";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { useOverlayStore } from "@/store/overlay-store";
import { useSelectionStore } from "@/store/selection-store";
import { softDeleteBlocks } from "@/lib/db-actions/soft-delete-blocks";
import { useUIStore } from "@/store/ui-store";

export function BlockChooser({
  block,
  shouldEagerLoad,
  columnWidth,
}: {
  block: Block;
  shouldEagerLoad: boolean;
  columnWidth: number;
}) {
  switch (block.block_type) {
    case "image":
      return (
        <ImageBlock
          block={block}
          shouldEagerLoad={shouldEagerLoad}
          columnWidth={columnWidth}
        />
      );
    case "text":
      return <TextBlock block={block} />;
    case "spacer":
      return <div className="h-8 w-full bg-transparent" />; // placeholder
    default:
      return null;
  }
}

function BlockComponent({
  block,
  isSelected,
  isDragging,
  onClick,
  shouldEagerLoad,
  columnWidth,
}: {
  block: Block;
  isSelected: boolean;
  isDragging: boolean;
  onClick: (e: React.MouseEvent) => void;
  shouldEagerLoad: boolean;
  columnWidth: number;
}) {
  // const position = useLayoutStore((s) => s.getBlockPosition(block.block_id));
  const scope = useGetScope();

  const { openOverlay } = useOverlayStore(scope);
  const { openOverlay: otherOpenOverlay } = useOverlayStore(
    scope === "main" ? "mirror" : "main"
  );

  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const selectedBlocksLength = Object.entries(selectedBlocks).length;
  const currentBlockSelected = !!selectedBlocks[block.block_id];

  // throw to other screen
  const mirrorMode = useUIStore((s) => s.mirrorMode);
  const toggleMirrorMode = useUIStore((s) => s.toggleMirrorMode);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          // layoutId={`block-${block.block_id}`} // for animating
          data-id={`${scope}::block-${block.block_id}`} // for sortable
          tabIndex={-1}
          className={`flex flex-col rounded-sm object-cover transition-all duration-150 cursor-pointer shadow-md 
              hover:scale-101 hover:shadow-xl hover:opacity-100
              relative bg-background
        ${isDragging ? "opacity-30" : ""} 
        ${isSelected ? "outline-4 outline-secondary" : ""}`}
          onClick={onClick}
        >
          <SortableItem id={`${scope}::block-${block.block_id}`}>
            {/* <h1 className="absolute text-xs top-2 right-2 text-slate-600 z-10 py-0.5 px-1 bg-white rounded-sm shadow-sm">
          y:{position?.colIndex}, x:{position?.rowIndex}, o:
          {position?.orderIndex}, t:{position?.top}, h:{position?.height}
        </h1> */}

            <BlockChooser
              block={block}
              shouldEagerLoad={shouldEagerLoad}
              columnWidth={columnWidth}
            />
          </SortableItem>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {block.block_type === "image" && (
          <>
            <ContextMenuItem onClick={() => openOverlay(block)}>
              Expand
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                // if mirror mode not active. first do that:
                if (!mirrorMode) {
                  toggleMirrorMode();
                }

                otherOpenOverlay(block);
                // then set the overlay to selected image
              }}
            >
              View In Mirror
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                if (block.data) {
                  const image = block.data as MudboardImage;

                  const url = getImageUrl(
                    image.image_id,
                    image.file_ext,
                    "full"
                  );
                  window.open(url, "_blank", "noopener,noreferrer");
                }
              }}
            >
              Open in new Tab
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        {selectedBlocksLength > 1 && currentBlockSelected && (
          <>
            <ContextMenuItem onClick={() => console.log("hey")}>
              Group Selected
            </ContextMenuItem>
            <ContextMenuItem onClick={() => console.log("hey")}>
              Download Selected
            </ContextMenuItem>
            <ContextMenuItem onClick={() => console.log("hey")}>
              Deselect
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        <ContextMenuItem
          onClick={() => {
            // default to deleting the current block
            let blocksToDelete = [block];

            const selectedBlockIds = Object.keys(selectedBlocks);

            // but if there are multiple selected and current block is in there, then delete all
            if (selectedBlockIds.length > 1 && currentBlockSelected) {
              blocksToDelete = Object.values(selectedBlocks);
            }

            softDeleteBlocks(blocksToDelete);
          }}
          variant="destructive"
        >
          Delete{" "}
          {currentBlockSelected &&
            selectedBlocksLength !== 1 &&
            selectedBlocksLength}
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const MemoizedBlock = memo(BlockComponent);
