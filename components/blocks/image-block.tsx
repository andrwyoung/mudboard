import { MudboardImage } from "@/types/image-type";
import React, { useState } from "react";
import Image from "next/image";
import { Blurhash } from "react-blurhash";

import { imageNames, SUPABASE_OBJECT_URL } from "@/types/upload-settings";
import { useLayoutStore } from "@/store/layout-store";
import { useUIStore } from "@/store/ui-store";

export function getImageUrl(
  image_id: string,
  file_ext: string,
  size: imageNames
): string {
  return `${SUPABASE_OBJECT_URL}/${image_id}/${size}.${file_ext}`;
}

export function ImageBlock({
  img,
  height,
  shouldEagerLoad,
  columnWidth,
}: {
  img: MudboardImage;
  height: number;
  shouldEagerLoad: boolean;
  columnWidth: number;
}) {
  const showBlurImg = useLayoutStore((s) => s.showBlurImg);
  const prettyMode = useLayoutStore((s) => s.showBlurImg);
  const numCols = useUIStore((s) => s.numCols);
  const [loaded, setLoaded] = useState(false);

  const [isErrored, setIsErrored] = useState(false);
  const isBlurred = !loaded || showBlurImg;

  function getFileName(): string {
    if (img.fileType !== "database") {
      return img.fileName;
    }

    let size: imageNames = "full";
    if (numCols > 6) {
      size = "thumb";
    } else if (numCols > 2) {
      size = "medium";
    }

    return getImageUrl(img.image_id, img.file_ext, size);
  }

  const aspectRatio = height / img.width;
  const calculatedHeight = Math.round(columnWidth * aspectRatio);

  return (
    <>
      {!isErrored ? (
        <div
          style={{ aspectRatio: `${img.width} / ${height}`, width: "100%" }}
          className="relative rounded-sm overflow-hidden"
        >
          {img.blurhash && prettyMode && (
            <div
              className="absolute inset-0"
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
            src={getFileName()}
            alt={img.caption}
            width={columnWidth}
            height={calculatedHeight}
            onError={() => setIsErrored(true)}
            onLoad={() => setLoaded(true)}
            className={`rounded-sm w-full h-full ${
              showBlurImg && !prettyMode ? "hidden" : "visible"
            }`}
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
            {img.caption || "Image failed to load"}
          </span>
        </div>
      )}
    </>
  );
}
