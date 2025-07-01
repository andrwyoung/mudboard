// DATABASE + LOCAL

// these are the database actions that help to create and update text blocks

import { Block, BlockInsert, TextBlockType } from "@/types/block-types";
import { TEXT_BLOCK_HEIGHT } from "@/types/upload-settings";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../supabase/supabase-client";
import { useLayoutStore } from "@/store/layout-store";
import { findShortestColumn } from "../../columns/column-helpers";
import { canEditBoard } from "@/lib/auth/can-edit-board";

export async function createTextBlock(
  sectionId: string,
  colIndexPreference?: number,
  rowIndexPreference?: number
): Promise<Block> {
  const columns = useLayoutStore.getState().sectionColumns[sectionId] ?? [];
  const colIndex = colIndexPreference ?? findShortestColumn(sectionId);
  const rowIndex = rowIndexPreference ?? columns[colIndex].length;

  // first create the text and the block
  const textBlock: TextBlockType = {
    text: "",
  };

  const block: Block = {
    block_id: uuidv4(),
    section_id: sectionId,
    block_type: "text",
    data: textBlock,
    height: TEXT_BLOCK_HEIGHT,
    saved_col_index: colIndex,
    saved_row_index: rowIndex,
    saved_order_index: 0,
    caption: null, // text blocks don't have captions
    deleted: false,

    is_flipped: null,
    is_greyscale: null,
    crop: null,
  };

  // first slap it into local
  const updateColumns = useLayoutStore.getState().updateColumnsInASection;
  updateColumns(sectionId, (prevCols) => {
    const updated = [...prevCols];
    const updatedCol = [...(updated[colIndex] ?? [])];
    updatedCol.splice(rowIndex, 0, block); // insert at rowIndex
    updated[colIndex] = updatedCol;

    return updated;
  });

  // now we upload to supabase
  const { saved_col_index, saved_row_index, saved_order_index, ...rest } =
    block;

  const blockInsert: BlockInsert = {
    ...rest,
    col_index: saved_col_index,
    row_index: saved_row_index,
    order_index: saved_order_index,
  };

  // then if access allows it, then we upload it to supabase
  const canWrite = canEditBoard();
  if (canWrite) {
    const { error: blockInsertError } = await supabase
      .from("blocks")
      .insert(blockInsert)
      .select()
      .single();

    if (blockInsertError) {
      throw new Error(
        `DB text block insert failed: ${blockInsertError.message}`
      );
    }

    console.log("Uploaded Text Block");
  }

  return block;
}
