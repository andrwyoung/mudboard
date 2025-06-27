// take a section. copy all blocks inside that section. put all those blocks into new section.
// repeat

import { supabase } from "@/utils/supabase";
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

  // NOTE: I cant (don't wanna) cast to Block[] because col_index is named saved_col_index

  // build blocks to insert
  const newBlocks: TablesInsert<"blocks">[] = blockData.map((block) => ({
    block_type: block.block_type,
    image_id: block.image_id,
    data: block.data,

    col_index: block.col_index,
    row_index: block.row_index,
    order_index: block.order_index,

    height: block.height,
    width: block.width,

    caption: block.caption,

    section_id: originalToClonedSectionIdMap[block.section_id], // IMPORTANT
    subsection_id: block.subsection_id ?? null,

    is_flipped: block.is_flipped,
    is_greyscale: block.is_greyscale,
    crop: block.crop,

    cloned_from: block.block_id,

    // REMEMBER: update clone-blocks.tsx too
  }));

  // insert the new blocks with new section_id
  const { error: blockInsertError } = await supabase
    .from("blocks")
    .insert(newBlocks);

  if (blockInsertError) {
    throw blockInsertError;
  }
}
