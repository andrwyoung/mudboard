import { THUMBNAIL_ASPECT_MAP, ThumbnailNames } from "@/types/upload-settings";

type GenerateThumbnailOptions = {
  width?: number;
  height?: number;
  columns?: number;
  padding?: number;
  bgColor?: string;
};

export async function generateCanvasThumbnail(
  blocks: { url: string }[],
  options: GenerateThumbnailOptions = {},
  thumbnailType: ThumbnailNames
): Promise<string> {
  const {
    width = THUMBNAIL_ASPECT_MAP[thumbnailType].width,
    height = THUMBNAIL_ASPECT_MAP[thumbnailType].height,
    columns = 4,
    padding = 8,
    bgColor = "#ffffff",
  } = options;
  console.log("generating images for thumbnail: ", blocks);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  // background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // image sizing
  const cellWidth = (width - padding * (columns + 1)) / columns;
  const rows = Math.ceil(blocks.length / columns);
  const cellHeight = (height - padding * (rows + 1)) / rows;

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // IMPORTANT if loading from Supabase
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    console.log("block url: ", block.url);
    const col = i % columns;
    const row = Math.floor(i / columns);

    try {
      const img = await loadImage(block.url);

      const x = padding + col * (cellWidth + padding);
      const y = padding + row * (cellHeight + padding);

      // maintain aspect ratio inside cell
      const aspect = img.width / img.height;
      let drawW = cellWidth;
      let drawH = cellHeight;
      if (aspect > 1) {
        drawH = cellWidth / aspect;
      } else {
        drawW = cellHeight * aspect;
      }

      ctx.drawImage(img, x, y, drawW, drawH);
    } catch (err) {
      console.warn("Failed to load image", block.url, err);
    }
  }

  return canvas.toDataURL("image/jpeg", 0.9); // or canvas.toBlob for upload
}
