// DATABASE only

// take my list of blocks. clone it. add cloned blocks to section I want

import { supabase } from "@/lib/supabase/supabase-client";
import { TablesInsert } from "@/types/supabase";
import { Block } from "@/types/block-types";
import { v4 as uuidv4 } from "uuid";

export async function cloneBlocks(
  blocks: Block[],
  newSectionId: string
): Promise<Record<string, string>> {
  if (!blocks.length) return {};

  // STEP 1: build the entry to insert. then insert into db
  const idMap: Record<string, string> = {};
  const clonedBlocks: TablesInsert<"blocks">[] = blocks.map((block) => {
    const newId = uuidv4();
    idMap[block.block_id] = newId;

    return {
      block_id: newId, // explicitly assigned
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

      cloned_from: block.block_id, // used to track the history

      // REMEMBER: update clone-blocks-in-section.tsx too
    };
  });

  const { data, error } = await supabase
    .from("blocks")
    .insert(clonedBlocks)
    .select("block_id");

  if (error || !data || !Array.isArray(data)) {
    console.error("Failed to clone blocks:", error);
    throw new Error("Block cloning failed during Supabase insert.");
  }

  return idMap;
}
