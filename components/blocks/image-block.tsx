// this is how we render the image blocks
// it's in charge of which resolution size to fetch and how to handle the blurhash

import { Block, MudboardImage } from "@/types/block-types";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Blurhash } from "react-blurhash";

import {
  CAPTION_HEIGHT,
  IMAGE_VARIANT_MAP,
  ImageSizes,
} from "@/types/upload-settings";
import { useLoadingStore } from "@/store/loading-store";
import { AnimatePresence, motion } from "framer-motion";
import { updateImageBlockCaption } from "@/lib/db-actions/sync-text/update-caption";
import { useSelectionStore } from "@/store/selection-store";
import { getImageUrl } from "@/utils/get-image-url";
import { useLayoutStore } from "@/store/layout-store";
import { MAX_COLUMNS } from "@/types/constants";

export function ImageBlock({
  canEdit,
  block,
  numCols,
}: {
  canEdit: boolean;
  block: Block;
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

  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const isSelected = !!selectedBlocks[block.block_id];
  const isSoleSelected = Object.keys(selectedBlocks).length === 1 && isSelected;
  const captionIsActive = Boolean(caption) || (isSoleSelected && canEdit);

  // overrides
  const visualOverridesMap = useLayoutStore((s) => s.visualOverridesMap);
  const clearVisualOverride = useLayoutStore((s) => s.clearVisualOverride);
  const overrides = visualOverridesMap.get(block.block_id);
  const editActive =
    overrides?.is_flipped ||
    overrides?.is_greyscale ||
    overrides?.crop !== undefined;

  // SECTION: filename and sizing

  // sizing fallback
  const getInitialSize = (): ImageSizes => {
    if (numCols >= 7) return "thumb";
    if (numCols >= 5) return "medium";
    if (numCols >= 3) return "large";
    return "full";
  };

  const [imageSize, setImageSize] = useState<ImageSizes>(getInitialSize());

  // fallback strategy
  const fallbackMap: Record<ImageSizes, ImageSizes | null> = {
    full: "large",
    large: "medium",
    medium: "thumb",
    thumb: null,
  };

  // sizing
  const variant = IMAGE_VARIANT_MAP[imageSize];
  const aspectRatio = height / width;
  const realWidth = variant.width;
  const realHeight = Math.round(realWidth * aspectRatio);

  // lil dot sizing
  const baseSize = 48;
  const decay = 0.6;
  const dotSize = Math.max(
    MAX_COLUMNS,
    Math.min(16, baseSize * Math.pow(decay, numCols))
  );

  const fileName =
    img.fileType !== "database"
      ? img.fileName
      : getImageUrl(img.image_id, img.file_ext, imageSize);

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
            {editActive && canEdit && (
              <div
                title={"Reset Visual Edits"}
                className="absolute bg-accent border-2 hover:bg-secondary box-border
                border-white/80 hover:boarder-secondary z-20 shadow-lg rounded-full cursor-pointer 
                hover:scale-125 transition-all"
                style={{
                  position: "absolute",
                  top: `${(MAX_COLUMNS - numCols) * 1.5 + 6}px`,
                  right: `${(MAX_COLUMNS - numCols) * 1.5 + 6}px`,
                  width: `${dotSize}px`,
                  height: `${dotSize}px`,
                  minHeight: 12,
                  minWidth: 12,
                }}
                onClick={(e) => {
                  if (!canEdit) return;
                  e.stopPropagation();
                  clearVisualOverride(block.block_id);
                }}
              />
            )}

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
              onError={() => {
                const fallback = fallbackMap[imageSize];
                if (fallback) {
                  setImageSize(fallback); // trigger fallback retry
                } else {
                  setIsErrored(true); // final failure
                }
              }}
              onLoad={() => setLoaded(true)}
              className={`w-full h-full ${showBlurImg ? "hidden" : "visible"}
            ${captionIsActive && false ? "rounded-t-sm" : "rounded-sm"}
            ${overrides?.is_greyscale ? "grayscale" : ""}
                  ${overrides?.is_flipped ? "transform scale-x-[-1]" : ""}`}
              draggable={false}
            />
          </div>
          <AnimatePresence initial={false}>
            {captionIsActive && false && (
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
                        ? "text-primary bg-primary-text"
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
                        updateImageBlockCaption(block, captionDraft, canEdit);
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
