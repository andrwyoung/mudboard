import { supabase } from "@/utils/supabase";
import { useLayoutStore } from "@/store/layout-store";
import { Block } from "@/types/block-types";
import { canEditBoard } from "@/lib/auth/can-edit-board";

export async function updateImageBlockCaption(
  block: Block,
  newCaption: string | null
) {
  const canWrite = canEditBoard();

  if (!canWrite) {
    console.warn("Not syncing block caption");
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
