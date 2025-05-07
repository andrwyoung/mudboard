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
}: {
  img: MudboardImage;
  height: number;
}) {
  const showBlurImg = useLayoutStore((s) => s.showBlurImg);
  const [loaded, setLoaded] = useState(false);

  const [isErrored, setIsErrored] = useState(false);

  return (
    <>
      {!isErrored ? (
        <div
          style={{ aspectRatio: `${img.width} / ${height}`, width: "100%" }}
          className="relative rounded-sm overflow-hidden"
        >
          {img.blurhash && (
            <div
              className="absolute inset-0"
              style={{
                opacity: !loaded || showBlurImg ? 1 : 0,
                transition: `opacity ${
                  !loaded || showBlurImg ? "0s ease-out" : "0.2s ease-in"
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
            src={img.fileName}
            alt={img.caption}
            width={img.width}
            height={height}
            onError={() => setIsErrored(true)}
            onLoadingComplete={() => setLoaded(true)}
            className={`rounded-sm w-full h-full ${
              showBlurImg ? "hidden" : "visible"
            }`}
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
