import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";
import { Block, MudboardImage } from "@/types/block-types";
import { getImageUrl } from "@/utils/get-image-url";
import React, { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { DEFAULT_BOARD_TITLE } from "@/types/constants";
import Image from "next/image";
import { DEFAULT_FILE_MIME, THUMBNAIL_HEIGHT } from "@/types/upload-settings";
import { uploadThumbnail } from "@/lib/db-actions/thumbnails/upload-thumbnails";

export default function ThumbnailGenerator() {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const hiddenRef = useRef<HTMLDivElement | null>(null);

  const board = useMetadataStore.getState().board;

  const allBlocks = useLayoutStore.getState().masterBlockOrder ?? [];
  const imageBlocks = allBlocks
    .map((b) => b.block)
    .filter((block) => block.block_type === "image");

  const numCols = imageBlocks.length < 5 ? 2 : 3;
  const blocks: Block[][] = Array.from({ length: numCols }, () => []);

  allBlocks.slice().forEach((block, i) => {
    const colIndex = i % numCols;
    blocks[colIndex].push(block.block);
  });

  const handleGenerateThumbnail = async () => {
    if (!board) return;

    const element = hiddenRef.current;
    if (!element) return;

    const originalCanvas = await html2canvas(element, {
      useCORS: true,
      scale: 1,
    });

    const fullWidth = originalCanvas.width;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = fullWidth;
    croppedCanvas.height = THUMBNAIL_HEIGHT;

    const ctx = croppedCanvas.getContext("2d");
    if (!ctx) return;

    // Only crop the bottom of Y
    ctx.drawImage(
      originalCanvas,
      0,
      0,
      fullWidth,
      THUMBNAIL_HEIGHT,
      0,
      0,
      fullWidth,
      THUMBNAIL_HEIGHT
    );

    const dataUrl = croppedCanvas.toDataURL(DEFAULT_FILE_MIME, 0.9);
    setThumbnailUrl(dataUrl);

    await uploadThumbnail(dataUrl, board.board_id, "board-thumb-ext");
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGenerateThumbnail}
        className="px-2 py-1 cursor-pointer bg-accent text-primary text-xs
         hover:bg-white transition-all duration-200 rounded-sm"
      >
        Generate Thumbnail
      </button>
      {thumbnailUrl && (
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailUrl} alt="Generated thumbnail" />
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: "-10000px", // moves it far out of view
          left: "-10000px",
        }}
        ref={hiddenRef}
      >
        <div className="flex flex-col w-[1200px] px-24 bg-primary relative">
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
            }}
          >
            {blocks.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-2">
                {column.map((block) => {
                  if (block.block_type !== "image" || !block.data) return null;

                  const image = block.data as MudboardImage;
                  const url = getImageUrl(
                    image.image_id,
                    image.file_ext,
                    "thumb"
                  );

                  return (
                    <Image
                      key={block.block_id}
                      src={url}
                      alt="GENERATOR"
                      height={block.height}
                      width={block.width}
                      className="w-full rounded"
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div
            className="absolute flex left-0 w-full justify-between items-end px-12 pt-6 pb-2 text-6xl z-20"
            style={{
              top: `${THUMBNAIL_HEIGHT - 160}px`,
            }}
          >
            <Image
              src="/logo.png"
              alt="Mudboard Small Logo"
              width={96}
              height={96}
              className="-translate-y-2"
            />
            <h1 className="truncate max-w-[800px] text-ellipsis whitespace-nowrap">
              {board?.title ?? DEFAULT_BOARD_TITLE}
            </h1>
          </div>

          <Image
            src="/gradient-overlay2.png"
            alt="Gradient Overlay"
            width={1200}
            height={200}
            className="absolute -top-10 left-0 w-full pointer-events-none z-10"
          />

          <Image
            src="/gradient-overlay-bottom.png"
            alt="Gradient Overlay"
            width={1200}
            height={300}
            className="absolute left-0 w-full pointer-events-none z-10"
            style={{
              top: `${THUMBNAIL_HEIGHT - 300}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
