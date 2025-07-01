// DATABASE + LOCAL

import { supabase } from "@/lib/supabase/supabase-client";
import { useLayoutStore } from "@/store/layout-store";
import { Block, TextBlockType } from "@/types/block-types";

export async function updateTextBlockText(
  block: Block,
  newText: string | null,
  canEdit: boolean
) {
  if (!canEdit) {
    console.error("This should not fire. Blocking text edit");
    return;
  }

  if (block.block_type !== "text") {
    console.warn("trying to change text for a non text block");
    return;
  }

  const textblock = block.data as TextBlockType;

  // update locally
  const newData = {
    ...textblock, // not neccesary right now
    text: newText,
  } as TextBlockType;

  useLayoutStore.setState((s) => ({
    sectionColumns: {
      ...s.sectionColumns,
      [block.section_id]: s.sectionColumns[block.section_id].map((column) =>
        column.map((b) =>
          b.block_id === block.block_id ? { ...b, data: newData } : b
        )
      ),
    },
  }));

  // update remotely
  await supabase
    .from("blocks")
    .update({ data: newData })
    .eq("block_id", block.block_id);
}
