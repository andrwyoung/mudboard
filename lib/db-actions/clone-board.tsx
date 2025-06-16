// here's how we duplicate the main board for the demo board
// I still don't know if I want this function public for others to use

import { supabase } from "@/utils/supabase";
import { createNewBoard } from "./create-new-board";
import { checkIfBoardExists } from "./check-board-exist";
import { toast } from "sonner";
import { BoardSection } from "@/types/board-types";
import { Block } from "@/types/block-types";
import { TablesInsert } from "@/types/supabase";

export async function cloneBoard({
  boardIdToClone,
  isDemo,
  claimedBy,
}: {
  boardIdToClone: string;
  isDemo?: boolean;
  claimedBy: string | null;
}): Promise<string | null> {
  const boardToClone = await checkIfBoardExists(boardIdToClone);

  if (!boardToClone) {
    toast.error("Board does not exist");
    return null;
  }

  try {
    // first make new board
    const board = await createNewBoard({
      title: isDemo ? "Demo Board" : `Copy of ${boardToClone.title}`,
      initializeSection: false,
      isDemo,
      claimedBy,
      savedColumnNumber: boardToClone.saved_column_num,
    });

    // STEP 1: get board sections along with the associated sections
    const { data: boardSectionData, error: sectionErr } = await supabase
      .from("board_sections")
      .select("*, section:sections(*)")
      .eq("board_id", boardIdToClone)
      .eq("deleted", false);

    if (sectionErr) throw sectionErr;
    const boardSections = boardSectionData as BoardSection[];

    console.log("BoardSections: ", boardSections, " data: ", boardSectionData);

    // STEP 2: insert the real sections
    const sectionMap: Record<string, string> = {};
    await Promise.all(
      boardSections.map(async (boardSection) => {
        const originalSection = boardSection.section;
        if (!originalSection) return;

        // 2a: first insert to sections
        const sectionInsert: TablesInsert<"sections"> = {
          title: originalSection.title,
          description: originalSection.description,
          forked_from: originalSection.section_id,
          saved_column_num: originalSection.saved_column_num,
          owned_by: claimedBy,
        };
        const { data: newSection, error: sectionInsertErr } = await supabase
          .from("sections")
          .insert([sectionInsert])
          .select()
          .single();

        if (sectionInsertErr) {
          console.error("Error creating section: ", sectionInsertErr);
          throw sectionInsertErr;
        }

        sectionMap[originalSection.section_id] = newSection.section_id;

        // 2b: then insert to board section
        const { data: newBoardSection, error: boardSectionErr } = await supabase
          .from("board_sections")
          .insert([
            {
              board_id: board.board_id,
              section_id: newSection.section_id,
              order_index: boardSection.order_index,
            },
          ]);

        if (boardSectionErr) {
          console.error(
            "Error creating board section entry:, ",
            boardSectionErr
          );
          throw boardSectionErr;
        }

        return newBoardSection;
      })
    );

    // STEP 3: Fetch blocks
    const originalSectionIds = boardSections.map((bs) => bs.section.section_id);
    const { data: blockData, error: blockErr } = await supabase
      .from("blocks")
      .select("*")
      .in("section_id", originalSectionIds)
      .eq("deleted", false);

    if (blockErr) throw blockErr;
    const blocks = blockData as Block[];

    // STEP 4: insert the new blocks
    const newBlocks: TablesInsert<"blocks">[] = blocks.map((block) => ({
      block_type: block.block_type,
      image_id: block.image_id,
      data: block.data,

      col_index: block.col_index,
      row_index: block.row_index,
      order_index: block.order_index,

      height: block.height,
      width: block.width,

      caption: block.caption,

      section_id: sectionMap[block.section_id], // IMPORTANT
      subsection_id: block.subsection_id ?? null,
    }));

    const { error: blockInsertError } = await supabase
      .from("blocks")
      .insert(newBlocks);

    if (blockInsertError) {
      throw blockInsertError;
    }

    return board.board_id;
  } catch (err) {
    console.error("Error creating board", err);
    return null;
  }
}
