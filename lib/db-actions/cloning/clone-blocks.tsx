import { supabase } from "@/utils/supabase";
import { Block } from "@/types/block-types";
import { TablesInsert } from "@/types/supabase";

export async function cloneBlocksFromSections(
  originalToClonedSectionIdMap: Record<string, string>
): Promise<void> {
  const originalSectionIds = Object.keys(originalToClonedSectionIdMap);

  // first grab all the relevant blocks
  const { data: blockData, error: blockErr } = await supabase
    .from("blocks")
    .select("*")
    .in("section_id", originalSectionIds)
    .eq("deleted", false);

  if (blockErr) throw blockErr;
  const blocks = blockData as Block[];

  // build blocks to insert
  const newBlocks: TablesInsert<"blocks">[] = blocks.map((block) => ({
    block_type: block.block_type,
    image_id: block.image_id,
    data: block.data,

    col_index: block.saved_col_index,
    row_index: block.saved_row_index,
    order_index: block.saved_order_index,

    height: block.height,
    width: block.width,

    caption: block.caption,

    section_id: originalToClonedSectionIdMap[block.section_id], // IMPORTANT
    subsection_id: block.subsection_id ?? null,

    is_flipped: block.is_flipped,
    is_greyscale: block.is_greyscale,
    crop: block.crop,
  }));

  // insert the new blocks with new section_id
  const { error: blockInsertError } = await supabase
    .from("blocks")
    .insert(newBlocks);

  if (blockInsertError) {
    throw blockInsertError;
  }
}
