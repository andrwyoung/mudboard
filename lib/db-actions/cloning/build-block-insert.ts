// UNUSED
import { Block } from "@/types/block-types";
import { TablesInsert } from "@/types/supabase";

export function buildClonedBlockInsert(
  blocks: Block[],
  newSectionId: string
): TablesInsert<"blocks">[] {
  const blockInserts: TablesInsert<"blocks">[] = blocks.map((block) => ({
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

    cloned_from: block.block_id,
  }));

  return blockInserts;
}
