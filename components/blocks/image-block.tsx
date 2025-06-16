// this is how we render the image blocks
// it's in charge of which resolution size to fetch and how to handle the blurhash

import { Block, MudboardImage } from "@/types/block-types";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Blurhash } from "react-blurhash";

import {
  CAPTION_HEIGHT,
  IMAGE_VARIANT_MAP,
  imageNames,
  SUPABASE_OBJECT_URL,
} from "@/types/upload-settings";
import { useLoadingStore } from "@/store/loading-store";
import { AnimatePresence, motion } from "framer-motion";
import { updateImageBlockCaption } from "@/lib/db-actions/sync-text/update-caption";
import { useSelectionStore } from "@/store/selection-store";
import { useIsMirror } from "@/app/b/[boardId]/board";
import { canEditBoard } from "@/lib/auth/can-edit-board";

export function getImageUrl(
  image_id: string,
  file_ext: string,
  size: imageNames
): string {
  return `${SUPABASE_OBJECT_URL}/${image_id}/${size}.${file_ext}`;
}

export function ImageBlock({
  block,
  shouldEagerLoad,
  numCols,
}: {
  block: Block;
  shouldEagerLoad: boolean;
  columnWidth: number;
  numCols: number;
}) {
  const img = block.data as MudboardImage;
  const height = block.height;
  const width =
    block.width ??
    (() => {
      throw new Error(`Block width is missing for block ID: ${block.block_id}`);
    })();
  const caption = block.caption;

  const showBlurImg = useLoadingStore((s) => s.showBlurImg);
  const [loaded, setLoaded] = useState(false);

  const [isErrored, setIsErrored] = useState(false);
  const isBlurred = !loaded || showBlurImg;

  // SECTION: selection

  const selectedScope = useSelectionStore((s) => s.selectionScope);
  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const isMirror = useIsMirror();
  const canEdit = canEditBoard();
  const isSelected = !!selectedBlocks[block.block_id];
  const isInScope = selectedScope === (isMirror ? "mirror" : "main");
  const isSoleSelected =
    isInScope && Object.keys(selectedBlocks).length === 1 && isSelected;
  const captionIsActive = Boolean(caption) || (isSoleSelected && canEdit);

  // SECTION: filename and sizing

  let size: imageNames = "medium";
  if (numCols > 6) size = "thumb";
  else if (numCols < 4) size = "full";

  const variant = IMAGE_VARIANT_MAP[size];
  const aspectRatio = height / width;
  const realWidth = variant.width;
  const realHeight = Math.round(realWidth * aspectRatio);

  const fileName =
    img.fileType !== "database"
      ? img.fileName
      : getImageUrl(img.image_id, img.file_ext, size);

  // SECTION caption

  const [captionDraft, setCaptionDraft] = useState(caption ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // focus on input as soon as selected
  // useEffect(() => {
  //   if (isSelected && inputRef.current) {
  //     inputRef.current.focus({ preventScroll: true });
  //     inputRef.current.setSelectionRange(
  //       inputRef.current.value.length,
  //       inputRef.current.value.length
  //     ); // places cursor at the end
  //   }
  // }, [isSelected]);

  // when mirror changes caption, then also update this one
  useEffect(() => {
    setCaptionDraft(caption ?? "");
  }, [caption]);

  return (
    <>
      {!isErrored ? (
        <>
          <div
            style={{
              aspectRatio: `${width} / ${height}`,
              width: "100%",
            }}
            className={`relative overflow-hidden`}
          >
            {img.blurhash && (
              <div
                className="absolute inset-0 rounded-sm overflow-hidden"
                style={{
                  opacity: isBlurred ? 1 : 0,
                  transition: `opacity ${
                    isBlurred ? "0s ease-out" : "0.2s ease-in"
                  }`,
                }}
              >
                <Blurhash
                  hash={img.blurhash}
                  punch={1}
                  width="100%"
                  height="100%"
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              </div>
            )}

            <Image
              src={fileName}
              alt={caption ?? img.original_name}
              width={realWidth}
              height={realHeight}
              onError={() => setIsErrored(true)}
              onLoad={() => setLoaded(true)}
              className={`w-full h-full ${showBlurImg ? "hidden" : "visible"}
            ${captionIsActive ? "rounded-t-sm" : "rounded-sm"}`}
              loading={shouldEagerLoad ? "eager" : "lazy"}
            />
          </div>
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
                  onClick={(e) => e.stopPropagation()}
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
                  disabled={!canEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setCaptionDraft(caption ?? "");
                      e.stopPropagation();
                      e.currentTarget.blur();
                    } else if (e.key === "Enter") {
                      if (captionDraft !== caption) {
                        updateImageBlockCaption(block, captionDraft);
                      }
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: `${width} / ${height}`,
          }}
          className="bg-zinc-200 border border-zinc-300 rounded-sm shadow-md
          flex items-center justify-center relative text-center"
        >
          <span className="text-zinc-500 text-xs px-2">
            {caption || "Image failed to load"}
          </span>
        </div>
      )}
    </>
  );
}
