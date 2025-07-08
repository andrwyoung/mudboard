// DATABASE FETCH

// grab blocks from database. convert to naming convention we use locally
// if it's an image, convert to MudboardImage. if text, convert to TextBlock

import {
  Block,
  BlockDownload,
  BlockType,
  CropRect,
  ImageDownload,
  TextBlockType,
} from "@/types/block-types";
import { supabase } from "../supabase/supabase-client";
import { SUPABASE_OBJECT_URL } from "@/types/upload-settings";

export async function fetchSupabaseBlocks(
  sectionIds: string[]
): Promise<Record<string, Block[]>> {
  console.log("Fetching images from Supabase DB...");

  const { data: blocks, error } = await supabase
    .from("blocks")
    .select(
      `
    *,
    image:images (
      image_id,
      og_width,
      og_height,
      file_ext,
      original_name,
      blurhash,
      uploaded_by
    )
  `
    )
    .in("section_id", sectionIds)
    .eq("deleted", false); // don't serve deleted blocks

  if (error) {
    throw new Error("Failed to fetch Blocks: " + error.message);
  }

  type BlockWithOptionalImage = BlockDownload & {
    image?: ImageDownload | null;
  };
  const blocksArray: Block[] = (blocks || []).map(
    (block: BlockWithOptionalImage): Block => {
      const {
        block_id,
        image_id,
        section_id,
        block_type,
        height,
        width,
        col_index,
        row_index,
        order_index,
        caption,
        deleted,
        data: nonImageBlockData,
        image,
        is_flipped,
        is_greyscale,
        crop,
        cloned_from,

        canvas_x,
        canvas_y,
        canvas_z,
        canvas_scale,
      } = block;

      const incompleteImageBlock: Omit<Block, "data"> = {
        block_id,
        image_id: image_id ?? undefined,
        section_id,
        block_type: block_type as BlockType,
        height,
        width: width ?? undefined,
        saved_col_index: col_index,
        saved_row_index: row_index,
        saved_order_index: order_index,
        caption,
        deleted,
        is_flipped,
        is_greyscale,
        crop: crop as CropRect,
        cloned_from: cloned_from ?? undefined,

        canvas_x,
        canvas_y,
        canvas_z,
        canvas_scale,
      };

      if (block_type === "image" && image) {
        return {
          ...incompleteImageBlock,

          data: {
            image_id: image.image_id,

            file_ext: image.file_ext,
            original_name: image.original_name,

            og_width: image.og_width,
            og_height: image.og_height,
            blurhash: image.blurhash ?? undefined,
            uploaded_by: image.uploaded_by ?? undefined,

            // defined by me
            fileName: `${SUPABASE_OBJECT_URL}/${image.image_id}/medium.${image.file_ext}`,
            fileType: "database",
          },
        };
      } else if (block_type === "text") {
        return {
          ...incompleteImageBlock,
          data: nonImageBlockData as TextBlockType,
        };
      }

      // for all other blocks just return everything
      return { ...incompleteImageBlock, data: null };
    }
  );

  // group by section_id
  const grouped: Record<string, Block[]> = {};
  for (const block of blocksArray) {
    const key = block.section_id;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(block);
  }

  return grouped;
}
