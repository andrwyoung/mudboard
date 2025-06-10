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

  for (const block of imageBlocks) {
    const image = block.data;
    const url = getImageUrl(image.image_id, image.file_ext, "full");

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const filename = `${image.original_name}.${image.file_ext}`;
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
