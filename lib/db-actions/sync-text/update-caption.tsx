// this is how we add a caption. mainly for image blocks

import { supabase } from "@/lib/supabase/supabase-client";
import { useLayoutStore } from "@/store/layout-store";
import { Block } from "@/types/block-types";

export async function updateImageBlockCaption(
  block: Block,
  newCaption: string | null,
  canEdit: boolean
) {
  if (!canEdit) {
    console.error("This should not fire. Blocking caption edit");
    return;
  }

  if (block.block_type !== "image") {
    console.warn("trying to change caption for a non image");
    return;
  }

  // update locally
  useLayoutStore.setState((s) => ({
    sectionColumns: {
      ...s.sectionColumns,
      [block.section_id]: s.sectionColumns[block.section_id].map((column) =>
        column.map((b) =>
          b.block_id === block.block_id ? { ...b, caption: newCaption } : b
        )
      ),
    },
  }));

  // update remotely
  await supabase
    .from("blocks")
    .update({ caption: newCaption })
    .eq("block_id", block.block_id);
}
