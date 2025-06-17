import { Block, MudboardImage } from "@/types/block-types";
import { THUMBNAIL_WIDTH } from "@/types/upload-settings";
import { getImageUrl } from "@/utils/get-image-url";
import Image from "next/image";

export default function DashboardThumbnail({
  blocks,
  columns,
}: {
  blocks: Block[][];
  columns: number;
}) {
  return (
    <div className="flex flex-col relative" style={{ width: THUMBNAIL_WIDTH }}>
      <div
        className="grid gap-4"
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
                  alt="DASHBOARD THUMB GENERATOR"
                  height={block.height}
                  width={block.width}
                  className="w-full"
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
