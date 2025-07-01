// DATABASE + LOCAL

// mark a block deleted in the database and locally

import { supabase } from "@/lib/supabase/supabase-client";
import { useLayoutStore } from "@/store/layout-store";
import { Block } from "@/types/block-types";
import { toast } from "sonner";
import { canEditBoard } from "@/lib/auth/can-edit-board";

export async function softDeleteBlocks(blocks: Block[]) {
  if (blocks.length === 0) return false;

  const canWrite = canEditBoard();
  if (!canWrite) {
    console.warn("No write access: not deleting blocks");
    return false;
  }

  const deletedIds = blocks.map((b) => b.block_id);

  // Take snapshot of layout so we can revert it
  const prevSectionColumns = useLayoutStore.getState().sectionColumns;

  // STEP 1: delete locally
  useLayoutStore.setState((s) => {
    const newSectionColumns = { ...s.sectionColumns };

    for (const block of blocks) {
      const cols = newSectionColumns[block.section_id];
      if (!cols) continue;

      newSectionColumns[block.section_id] = cols.map((col) =>
        col.filter((b) => b.block_id !== block.block_id)
      );
    }

    return {
      sectionColumns: newSectionColumns,
    };
  });

  // STEP 2: reflect on DB
  const { error } = await supabase
    .from("blocks")
    .update({ deleted: true, deleted_at: new Date().toISOString() })
    .in("block_id", deletedIds);

  if (error) {
    console.error("Failed to delete blocks:", error);
    toast.error("Failed to Delete Blocks");

    // Step 3: rollback local layout if DB fails
    useLayoutStore.setState({ sectionColumns: prevSectionColumns });

    return false;
  }

  toast.success(
    `Deleted ${blocks.length} block${blocks.length > 1 ? "s" : ""}`
  );
  return true;
}
