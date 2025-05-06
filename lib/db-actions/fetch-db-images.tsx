import {
  Block,
  BlockDownload,
  BlockType,
  ImageDownload,
} from "@/types/image-type";
import { supabase } from "../supabase";
import { DEFAULT_BOARD_ID, SUPABASE_OBJECT_URL } from "@/types/upload-settings";

export async function fetchSupabaseImages(): Promise<Block[]> {
  console.log("Fetching images from Supabase DB...");

  const { data: blocks, error } = await supabase
    .from("blocks")
    .select(
      `
    *,
    image:images (
      image_id,
      width,
      height,
      file_ext,
      original_name,
      description
    )
  `
    )
    .eq("board_id", DEFAULT_BOARD_ID)
    .order("col_index", { ascending: true })
    .order("row_index", { ascending: true });

  if (error) {
    console.error("Error fetching images from DB:", error.message);
    return [];
  }

  type BlockWithOptionalImage = BlockDownload & {
    image?: ImageDownload | null;
  };
  const blocksArray: Block[] = (blocks || []).map(
    (block: BlockWithOptionalImage): Block => {
      const {
        block_id,
        board_id,
        block_type,
        height,
        col_index,
        row_index,
        order_index,
        deleted,
        image,
      } = block;

      const incompleteBlock: Omit<Block, "data"> = {
        block_id,
        board_id,
        block_type: block_type as BlockType,
        height,
        col_index,
        row_index,
        order_index,
        deleted,
      };

      if (block_type === "image" && image) {
        return {
          ...incompleteBlock,

          data: {
            image_id: image.image_id,

            file_ext: image.file_ext,
            original_name: image.original_name,

            width: image.width,
            caption: image.caption ?? image.original_name,

            // defined by me
            fileName: `${SUPABASE_OBJECT_URL}/${image.image_id}/medium.${image.file_ext}`,
            fileType: "database",
          },
        };
      }

      return { ...incompleteBlock, data: null };
    }
  );

  return blocksArray;
}
