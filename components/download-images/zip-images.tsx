import JSZip from "jszip";
import { saveAs } from "file-saver";
import { getImageUrl } from "@/components/blocks/image-block";
import { Block, MudboardImage } from "@/types/block-types";

export async function downloadImagesAsZip(blocks: Block[], title?: string) {
  const zip = new JSZip();

  const imageBlocks = blocks.filter(
    (b): b is Block & { block_type: "image"; data: MudboardImage } =>
      b.block_type === "image" && !!b.data
  );

  for (let i = 0; i < imageBlocks.length; i++) {
    const block = imageBlocks[i];
    const image = block.data;

    const paddedIndex = String(i + 1).padStart(3, "0");
    const rawTitle = (title ?? "section").toLowerCase();
    const safeTitle = rawTitle
      .replace(/[^\w\d]+/g, "-") // Replace symbols with "-"
      .replace(/-+$/, "") // Remove trailing dash if present
      .replace(/^-+/, "") // Remove leading dash if present
      .replace(/-+/g, "-") // Collapse multiple dashes
      .slice(0, 40); // Limit filename length

    const filename = `${safeTitle}_${paddedIndex}.${image.file_ext}`;

    try {
      const url = getImageUrl(image.image_id, image.file_ext, "full");
      const response = await fetch(url);
      const blob = await response.blob();
      zip.file(filename, blob);
    } catch (err) {
      console.error(`Failed to fetch image ${image.image_id}:`, err);
    }
  }

  if (imageBlocks.length === 0) {
    console.warn("No valid image blocks to download.");
    return;
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, `${title?.trim() || "mudboard-images"}.zip`);
}
