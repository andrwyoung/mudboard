import { MudboardImage } from "@/types/image-type";
import React from "react";
import Image from "next/image";
import { Blurhash } from "react-blurhash";

import { SUPABASE_OBJECT_URL } from "@/types/upload-settings";

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
  return (
    <>
      {!isErrored ? (
        true && img.blurhash ? (
          <div
            style={{
              aspectRatio: `${img.width} / ${height}`,
              width: "100%",
            }}
            className="rounded-sm overflow-hidden"
          >
            <Blurhash
              hash={img.blurhash}
              punch={1}
              width="100%" // This does nothing!
              height="100%" // This does nothing!
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>
        ) : (
          <Image
            src={img.fileName}
            alt={img.caption}
            width={img.width}
            height={height}
            onClick={onClick}
            onError={onError}
            className={`rounded-sm`}
            placeholder="empty" // we're doing custom placeholder now
          />
        )
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
