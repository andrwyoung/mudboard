import {
  Block,
  BlockDownload,
  BlockType,
  ImageDownload,
  TextBlockType,
} from "@/types/block-types";
import { supabase } from "../../utils/supabase";
import { SUPABASE_OBJECT_URL } from "@/types/upload-settings";

export async function fetchSupabaseBlocks(boardId: string): Promise<Block[]> {
  console.log("Fetching images from Supabase DB...");

  const { data: blocks, error } = await supabase
    .from("blocks")
    .select(
      `
    *,
    image:images (
      image_id,
      width,
      file_ext,
      caption,
      original_name,
      blurhash
    )
  `
    )
    .eq("board_id", boardId)
    .eq("deleted", false) // don't serve deleted blocks
    .order("col_index", { ascending: true })
    .order("row_index", { ascending: true });

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
        section_id,
        board_id,
        block_type,
        height,
        col_index,
        row_index,
        order_index,
        deleted,
        data: nonImageBlockData,
        image,
      } = block;

      const incompleteImageBlock: Omit<Block, "data"> = {
        block_id,
        section_id,
        board_id,
        block_type: block_type as BlockType,
        height,
        col_index: col_index,
        row_index: row_index,
        order_index: order_index,
        deleted,
      };

      if (block_type === "image" && image) {
        return {
          ...incompleteImageBlock,

          data: {
            image_id: image.image_id,

            file_ext: image.file_ext,
            original_name: image.original_name,

            caption: image.caption,
            width: image.width,
            blurhash: image.blurhash ?? undefined,

            // defined by me
            fileName: `${SUPABASE_OBJECT_URL}/${image.image_id}/thumb.${image.file_ext}`,
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

  return blocksArray;
}
