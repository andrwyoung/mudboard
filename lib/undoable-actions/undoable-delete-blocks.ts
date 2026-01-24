import { useLayoutStore } from "@/store/layout-store";
import { useUndoStore } from "@/store/undo-store";
import { Block } from "@/types/block-types";
import { PositionedBlock } from "@/types/sync-types";
import { softDeleteBlocks } from "../db-actions/soft-delete-blocks";
import { supabase } from "@/lib/supabase/supabase-client";
import { putBackBlocks } from "./put-back-blocks";

export async function deleteBlocksWithUndo(blocks: Block[]) {
  const positionedBlocks = blocks
    .map((b) => useLayoutStore.getState().positionedBlockMap.get(b.block_id))
    .filter(Boolean) as PositionedBlock[];

  useUndoStore.getState().execute({
    label: "Delete Blocks",
    payload: { positionedBlocks },
    scope: "shared",
    do: () => softDeleteBlocks(blocks),
    undo: async () => {
      putBackBlocks(positionedBlocks);

      const { error } = await supabase
        .from("blocks")
        .update({ deleted: false, deleted_at: null })
        .in(
          "block_id",
          positionedBlocks.map((p) => p.block.block_id)
        );

      if (error) {
        console.error("Failed to revert deletion in db:", error);
        return false;
      }
    },
  });
}
