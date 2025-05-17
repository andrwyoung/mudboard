import { memo, useEffect, useRef, useState } from "react";
import { SortableImageItem } from "@/components/drag/sortable-wrapper";
import { Block, MudboardImage } from "@/types/block-types";
import { ImageBlock } from "./image-block";
import { updateBlockCaption } from "@/lib/sync/block-actions";
import { AnimatePresence, motion } from "framer-motion";
import { CAPTION_HEIGHT } from "@/types/upload-settings";

export function BlockChooser({
  block,
  shouldEagerLoad,
  columnWidth,
  captionIsActive,
}: {
  block: Block;
  shouldEagerLoad: boolean;
  columnWidth: number;
  captionIsActive: boolean;
}) {
  switch (block.block_type) {
    case "image":
      return (
        <ImageBlock
          img={block.data as MudboardImage}
          caption={block.caption ?? null}
          height={block.height}
          shouldEagerLoad={shouldEagerLoad}
          columnWidth={columnWidth}
          captionIsActive={captionIsActive}
        />
      );
    case "text":
      return <div className="p-2 text-zinc-600 italic">[Text block]</div>; // placeholder
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
  const [captionDraft, setCaptionDraft] = useState(block.caption ?? "");
  const captionIsActive =
    isSelected || captionDraft.length > 0 || Boolean(block.caption);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);

  // focus on input as soon as selected
  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      ); // places cursor at the end
    }
  }, [isSelected]);

  return (
    <div
      data-id={block.block_id}
      className={`flex flex-col rounded-sm object-cover transition-all duration-150 cursor-pointer shadow-md 
      hover:scale-101 hover:shadow-xl hover:opacity-100
      relative bg-background
        ${isDragging ? "opacity-30" : ""} 
        ${isSelected ? "outline-4 outline-secondary" : ""}`}
      onClick={onClick}
    >
      <SortableImageItem id={block.block_id}>
        <h1 className="absolute text-xs top-2 right-2 text-slate-600 z-10">
          {block.order_index}
        </h1>

        <BlockChooser
          block={block}
          captionIsActive={captionIsActive}
          shouldEagerLoad={shouldEagerLoad}
          columnWidth={columnWidth}
        />

        <AnimatePresence initial={false}>
          {captionIsActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: CAPTION_HEIGHT }} // match your fixed height
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <input
                ref={inputRef}
                type="text"
                value={captionDraft}
                placeholder="Add a caption"
                onChange={(e) => setCaptionDraft(e.target.value)}
                className={`px-3 py-2 w-full text-sm 
                 border-none focus:outline-none rounded-b-sm
              ${
                isFocused
                  ? "text-primary bg-white"
                  : "text-primary-darker bg-transparent"
              }`}
                style={{ height: CAPTION_HEIGHT }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setCaptionDraft(block.caption ?? "");
                    e.stopPropagation();
                    e.currentTarget.blur();
                  } else if (e.key === "Enter") {
                    if (captionDraft !== block.caption) {
                      updateBlockCaption(block, captionDraft);
                    }
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </SortableImageItem>
    </div>
  );
}

export const MemoizedBlock = memo(BlockComponent);
