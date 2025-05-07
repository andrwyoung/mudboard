import { MudboardImage } from "@/types/image-type";
import React, { useState } from "react";
import Image from "next/image";
import { Blurhash } from "react-blurhash";

import { SUPABASE_OBJECT_URL } from "@/types/upload-settings";
import { useLayoutStore } from "@/store/layout-store";

export function getImageUrl(
  image_id: string,
  file_ext: string,
  size: "medium" | "thumb" | "full" = "medium"
): string {
  return `${SUPABASE_OBJECT_URL}/${image_id}/${size}.${file_ext}`;
}

export function ImageBlock({
  img,
  height,
  isErrored = false,
  onClick,
  onError,
}: {
  img: MudboardImage;
  height: number;
  isErrored?: boolean;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  onError?: () => void;
}) {
  const showBlurImg = useLayoutStore((s) => s.showBlurImg);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!isErrored ? (
        <div
          style={{ aspectRatio: `${img.width} / ${height}`, width: "100%" }}
          className="relative rounded-sm overflow-hidden"
        >
          {img.blurhash && (
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                !loaded || showBlurImg ? "opacity-100" : "opacity-0"
              }`}
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
            src={img.fileName}
            alt={img.caption}
            width={img.width}
            height={height}
            onClick={onClick}
            onError={onError}
            onLoadingComplete={() => setLoaded(true)}
            style={{ visibility: showBlurImg ? "hidden" : "visible" }}
            className="rounded-sm w-full h-full object-cover"
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
          onClick={onClick}
        >
          <span className="text-zinc-500 text-xs px-2">
            {img.caption || "Image failed to load"}
          </span>
        </div>
      )}
    </>
  );
}
