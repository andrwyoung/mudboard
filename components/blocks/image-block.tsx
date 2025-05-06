import { MudboardImage } from "@/types/image-type";
import React from "react";
import Image from "next/image";

export function ImageBlock({
  img,
  isErrored = false,
  onClick,
  onError,
}: {
  img: MudboardImage;
  isErrored?: boolean;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  onError?: () => void;
}) {
  return (
    <>
      {!isErrored ? (
        <Image
          src={img.fileName}
          alt={img.description}
          width={img.width}
          height={img.height}
          onClick={onClick}
          onError={onError}
          className={`rounded-sm
        `}
        />
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: `${img.width} / ${img.height}`,
          }}
          className="bg-zinc-200 border border-zinc-300 rounded-sm shadow-md
          flex items-center justify-center relative text-center"
          onClick={onClick}
        >
          <span className="text-zinc-500 text-xs px-2">
            {img.description || "Image failed to load"}
          </span>
        </div>
      )}
    </>
  );
}
