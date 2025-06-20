import { Block, MudboardImage } from "@/types/block-types";
import { getImageUrl } from "@/utils/get-image-url";
import Image from "next/image";
import { THUMBNAIL_ASPECT_MAP } from "@/types/upload-settings";

export default function ExternalThumbnail({
  blocks,
  title,
  columns,
}: {
  blocks: Block[][];
  title: string;
  columns: number;
}) {
  const thumbnailHeight = THUMBNAIL_ASPECT_MAP["board-thumb-ext"].height;
  const thumbnailWidth = THUMBNAIL_ASPECT_MAP["board-thumb-ext"].width;

  return (
    <div
      className="flex flex-col px-24 bg-primary relative"
      style={{
        width: thumbnailWidth,
        minHeight: thumbnailHeight,
        minWidth: thumbnailWidth,
      }}
    >
      <div
        className="grid gap-2 mt-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {blocks.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-2">
            {column.map((block) => {
              if (block.block_type !== "image" || !block.data) return null;

              const image = block.data as MudboardImage;
              const url = getImageUrl(image.image_id, image.file_ext, "medium");

              return (
                <Image
                  key={block.block_id}
                  src={url}
                  alt="EXTERNAL THUMB GENERATOR"
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
          top: `${thumbnailHeight - 200}px`,
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
            {title}
          </h1>
        </div>
      </div>

      <Image
        src="/gradient-overlay2.png"
        alt="Gradient Overlay"
        width={thumbnailWidth}
        height={200}
        className="absolute -top-10 left-0 w-full pointer-events-none z-10 opacity-30"
      />

      <Image
        src="/gradient-overlay-bottom.png"
        alt="Gradient Overlay"
        width={thumbnailWidth}
        height={300}
        className="absolute left-0 w-full pointer-events-none z-10"
        style={{
          top: `${thumbnailHeight - 300}px`,
        }}
      />
    </div>
  );
}
