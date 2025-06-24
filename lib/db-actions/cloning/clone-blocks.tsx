import { supabase } from "@/utils/supabase";
import { TablesInsert } from "@/types/supabase";
import { Block } from "@/types/block-types";

export async function cloneBlocks(
  blocks: Block[],
  newSectionId: string
): Promise<Record<string, string>> {
  if (!blocks.length) {
  }

  const clonedBlocks: TablesInsert<"blocks">[] = blocks.map((block) => ({
    block_type: block.block_type,
    image_id: block.image_id,
    data: block.data,

    col_index: block.saved_col_index,
    row_index: block.saved_row_index,
    order_index: block.saved_order_index,

    height: block.height,
    width: block.width,
    caption: block.caption,

    section_id: newSectionId, // IMPORTANT
    subsection_id: block.subsection_id ?? null,

    is_flipped: block.is_flipped,
    is_greyscale: block.is_greyscale,
    crop: block.crop,
  }));

  const { data, error } = await supabase
    .from("blocks")
    .insert(clonedBlocks)
    .select("block_id");

  if (error || !data || !Array.isArray(data)) {
    console.error("Failed to clone blocks:", {
      error,
      receivedData: data,
      attemptedBlocks: clonedBlocks,
    });
    throw new Error("Block cloning failed during Supabase insert.");
  }

  // map the old ids to the new ones so we know what we're doing
  // TODO: actually do not know if this is right....
  const idMap: Record<string, string> = {};
  blocks.forEach((block, index) => {
    const newBlock = data[index];
    if (newBlock) {
      idMap[block.block_id] = newBlock.block_id;
    }
  });

  return idMap;
}
