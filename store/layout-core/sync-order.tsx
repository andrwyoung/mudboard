// DATABASE + LOCAL (sync-local-order.tsx)

// this is the function that syncs the block order to supabase

import { BlockInsert } from "@/types/block-types";
import { PositionedBlock } from "@/types/sync-types";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { useMetadataStore } from "@/store/metadata-store";
import { commitToSectionColumns } from "../../lib/db-actions/sync-local-order";
import { shouldSyncSectionLayout } from "../../lib/columns/should-sync-indexes";
import { useUIStore } from "../ui-store";
import { canEditSection } from "@/lib/auth/can-edit-section";
import { runSupabaseBatchUpdates } from "@/lib/db-actions/run-batch-updates";

function positionedBlocksToUpdates(
  blocks: PositionedBlock[],
  shouldSyncColPos: boolean
): Partial<BlockInsert>[] {
  return blocks
    .filter(
      ({ block }) => !!block.block_id && !block.block_id.startsWith("temp-")
    )
    .map(({ block, colIndex, rowIndex, orderIndex }) => {
      const base = {
        block_id: block.block_id as string,
        section_id: block.section_id,
        order_index: orderIndex,
      };

      // only sync order_index if columnNum !== visualNumCol,
      return shouldSyncColPos
        ? { ...base, col_index: colIndex, row_index: rowIndex }
        : base;
    });
}

export async function syncSectionOrderToSupabase(
  sectionId: string,
  positionedBlocks: PositionedBlock[]
): Promise<boolean> {
  // first check if we SHOULD sync section
  //
  // grab section
  const section = useMetadataStore
    .getState()
    .boardSections.find((bs) => bs.section.section_id === sectionId)?.section;

  if (!section) {
    console.error("Missing Section when syncing!!");
    return false;
  }

  // check for access
  const canWrite = canEditBoard() && canEditSection(section);
  if (!canWrite) {
    console.warn("No write access: not syncing order");
    return false;
  }

  // if visualNumCols !== section.saved_column_num, exit
  const forceMobileColumns = useUIStore.getState().forceMobileColumns;
  const shouldSyncColPos = shouldSyncSectionLayout(section, forceMobileColumns);

  // use position map to sync
  const updates = positionedBlocksToUpdates(positionedBlocks, shouldSyncColPos);
  console.log("Syncing block order to Supabase via update:", updates);

  // KEY SECTION: update block order to Supabase
  const success = await runSupabaseBatchUpdates(updates, "Sync Order");
  if (!success) return false;

  // locally: save the colIndex rowIndex into each Block
  if (shouldSyncColPos) {
    commitToSectionColumns(sectionId, positionedBlocks);
  }

  console.log("Finished syncing block order to Supabase");

  return true;
}
