import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";
import { Block, MudboardImage } from "@/types/block-types";
import { getImageUrl } from "@/utils/get-image-url";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import html2canvas from "html2canvas-pro";
import { DEFAULT_BOARD_TITLE } from "@/types/constants";
import Image from "next/image";
import {
  DEFAULT_FILE_MIME,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_REGENERATION_DELAY,
} from "@/types/upload-settings";
import { uploadThumbnail } from "@/lib/db-actions/thumbnails/upload-thumbnails";
import { checkThumbnailExists } from "@/lib/db-actions/thumbnails/check-thumbnail-exists";

export default function ThumbnailGenerator() {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const hiddenRef = useRef<HTMLDivElement | null>(null);
  const board = useMetadataStore((s) => s.board);
  const layoutDirty = useLayoutStore((state) => state.layoutDirty);
  const masterBlockOrder = useLayoutStore((s) => s.masterBlockOrder);

  const [regenerationQueued, setRegenerationQueued] = useState(false);

  const numCols = 3;

  const blocks: Block[][] = useMemo(() => {
    const allBlocks = (masterBlockOrder ?? []).slice(0, 30);
    const imageBlocks = allBlocks
      .map((b) => b.block)
      .filter((block) => block.block_type === "image");

    const cols: Block[][] = Array.from({ length: numCols }, () => []);

    imageBlocks.forEach((block, i) => {
      const colIndex = i % numCols;
      cols[colIndex].push(block);
    });

    return cols;
  }, [masterBlockOrder]);

  // function that actually generates thumbnail
  const handleGenerateThumbnail = useCallback(async () => {
    if (!board) return;

    const element = hiddenRef.current;
    if (!element) return;

    const originalCanvas = await html2canvas(element, {
      useCORS: true,
      scale: 1,
      logging: false,
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
  }, [board]);

  useEffect(() => {
    const flatBlocks = blocks.flat();
    if (!board || flatBlocks.length === 0) return;

    const maybeGenerate = async () => {
      const exists = await checkThumbnailExists(
        board.board_id,
        "board-thumb-ext"
      );

      if (!exists) {
        console.log("No thumbnail found. Queuing...");
        setRegenerationQueued(true);
      }
    };

    maybeGenerate();
  }, [board, blocks]);

  // queuing regeneration
  useEffect(() => {
    if (layoutDirty && !regenerationQueued) {
      setRegenerationQueued(true);
    }
  }, [layoutDirty, handleGenerateThumbnail, regenerationQueued]);

  useEffect(() => {
    if (!regenerationQueued) return;

    const timeout = setTimeout(() => {
      handleGenerateThumbnail();
      setRegenerationQueued(false);
    }, THUMBNAIL_REGENERATION_DELAY);

    return () => clearTimeout(timeout);
  }, [regenerationQueued, handleGenerateThumbnail]);

  return (
    <div>
      {false && process.env.NODE_ENV === "development" && (
        <div className="p-4">
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
              {/* <img src={thumbnailUrl} alt="Generated thumbnail" /> */}
            </div>
          )}
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
                    "medium"
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
            className="absolute flex left-0 w-full justify-between items-end px-12 pt-6 pb-2 z-20"
            style={{
              top: `${THUMBNAIL_HEIGHT - 200}px`,
            }}
          >
            <Image
              src="/logo.png"
              alt="Mudboard Small Logo"
              width={96}
              height={96}
              className="-translate-y-2"
            />
            <div className="flex flex-col items-end ">
              <h3 className="text-3xl translate-y-2">Board</h3>
              <h1 className="text-6xl truncate max-w-[800px] text-ellipsis whitespace-nowrap">
                {board?.title ?? DEFAULT_BOARD_TITLE}
              </h1>
            </div>
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
