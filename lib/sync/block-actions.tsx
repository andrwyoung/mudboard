import { supabase } from "@/lib/supabase";
import { hasWriteAccess } from "../db-actions/check-write-access";
import { useLayoutStore } from "@/store/layout-store";
import { Block } from "@/types/block-types";

export async function updateBlockCaption(
  block: Block,
  newCaption: string | null
) {
  const canWrite = await hasWriteAccess();

  if (!canWrite) {
    console.warn("Not syncing block caption");
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
