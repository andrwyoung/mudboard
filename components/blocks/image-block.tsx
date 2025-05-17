import { MudboardImage } from "@/types/block-types";
import React, { useState } from "react";
import Image from "next/image";
import { Blurhash } from "react-blurhash";

import {
  IMAGE_VARIANT_MAP,
  imageNames,
  SUPABASE_OBJECT_URL,
} from "@/types/upload-settings";
import { useUIStore } from "@/store/ui-store";
import { useLoadingStore } from "@/store/loading-store";

export function getImageUrl(
  image_id: string,
  file_ext: string,
  size: imageNames
): string {
  return `${SUPABASE_OBJECT_URL}/${image_id}/${size}.${file_ext}`;
}

export function ImageBlock({
  img,
  caption,
  height,
  shouldEagerLoad,
  captionIsActive,
}: {
  img: MudboardImage;
  caption: string | null;
  height: number;
  shouldEagerLoad: boolean;
  columnWidth: number;
  captionIsActive: boolean;
}) {
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

  return (
    <>
      {!isErrored ? (
        <div
          style={{ aspectRatio: `${img.width} / ${height}`, width: "100%" }}
          className={`relative overflow-hidden `}
        >
          {img.blurhash && (
            <div
              className="absolute inset-0 rounded-sm"
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
