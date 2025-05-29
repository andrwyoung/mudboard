import { useMetadataStore } from "@/store/metadata-store";
import { Block, BlockInsert, TextBlockType } from "@/types/block-types";
import { TEXT_BLOCK_HEIGHT } from "@/types/upload-settings";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../utils/supabase";
import { useLayoutStore } from "@/store/layout-store";
import {
  findShortestColumn,
  getNextRowIndex,
} from "../columns/OLD-column-helpers";
import { canEditBoard } from "@/lib/auth/can-edit-board";

export async function createTextBlock(
  sectionId: string,
  columnIndex?: number
): Promise<Block> {
  const board = useMetadataStore.getState().board;
  if (!board) throw new Error("Board does not exist");

  const columns = useLayoutStore.getState().sectionColumns[sectionId] ?? [];
  const colIndex = columnIndex ?? findShortestColumn(sectionId);
  const rowIndex = getNextRowIndex(columns[colIndex] ?? []);

  // first create the text and the block
  const textBlock: TextBlockType = {
    text: "",
  };

  const block: Block = {
    block_id: uuidv4(),
    section_id: sectionId,
    board_id: board.board_id,
    block_type: "text",
    data: textBlock,
    height: TEXT_BLOCK_HEIGHT,
    col_index: colIndex,
    row_index: rowIndex,
    caption: null, // text blocks don't have captions
    order_index: 0,
    deleted: false,
  };

  // first slap it into local
  const updateColumns = useLayoutStore.getState().updateColumnsInASection;
  updateColumns(sectionId, (prevCols) => {
    const updated = [...prevCols];
    updated[colIndex] = [...(updated[colIndex] ?? []), block];
    return updated;
  });

  // then if access allows it, then we upload it to supabase
  const canWrite = canEditBoard();
  if (canWrite) {
    const { error: blockInsertError } = await supabase
      .from("blocks")
      .insert(block as BlockInsert)
      .select()
      .single();

    if (blockInsertError) {
      throw new Error(`DB block insert failed: ${blockInsertError.message}`);
    }

    console.log("Uploaded Text Block");
  }

  return block;
}

export async function updateTextBlockText(
  block: Block,
  newText: string | null
) {
  const canWrite = canEditBoard();

  if (!canWrite) {
    console.warn("Not syncing text block text");
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
