import { Block, MudboardImage } from "@/types/block-types";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Blurhash } from "react-blurhash";

import {
  CAPTION_HEIGHT,
  IMAGE_VARIANT_MAP,
  imageNames,
  SUPABASE_OBJECT_URL,
} from "@/types/upload-settings";
import { useUIStore } from "@/store/ui-store";
import { useLoadingStore } from "@/store/loading-store";
import { AnimatePresence, motion } from "framer-motion";
import { updateImageBlockCaption } from "@/lib/sync/image-block-actions";

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
  isSelected,
}: {
  block: Block;
  shouldEagerLoad: boolean;
  columnWidth: number;
  isSelected: boolean;
}) {
  const img = block.data as MudboardImage;
  const height = block.height;
  const caption = img.caption;

  const showBlurImg = useLoadingStore((s) => s.showBlurImg);
  const numCols = useUIStore((s) => s.numCols);
  const [loaded, setLoaded] = useState(false);

  const [isErrored, setIsErrored] = useState(false);
  const isBlurred = !loaded || showBlurImg;

  let size: imageNames = "medium";
  if (numCols > 6) size = "thumb";
  else if (numCols < 4) size = "full";

  const variant = IMAGE_VARIANT_MAP[size];
  const aspectRatio = height / img.width;
  const realWidth = variant.width;
  const realHeight = Math.round(realWidth * aspectRatio);

  const fileName =
    img.fileType !== "database"
      ? img.fileName
      : getImageUrl(img.image_id, img.file_ext, size);

  const [captionDraft, setCaptionDraft] = useState(caption ?? "");
  const captionIsActive =
    isSelected || captionDraft.length > 0 || Boolean(caption);
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

  return (
    <>
      {!isErrored ? (
        <>
          <div
            style={{ aspectRatio: `${img.width} / ${height}`, width: "100%" }}
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
            aspectRatio: `${img.width} / ${height}`,
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
