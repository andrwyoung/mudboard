// clone a board. (right now only used to make Demo boards)

import { supabase } from "@/utils/supabase";
import { createNewBoard } from "../create-new-board";
import { checkIfBoardExists } from "../check-board-exist";
import { toast } from "sonner";
import { BoardSection } from "@/types/board-types";
import { cloneSection } from "./clone-section";
import { cloneBlocksFromSections } from "./clone-blocks-in-section";

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
    // STEP 1: first make new board
    const board = await createNewBoard({
      title: isDemo ? "My Demo Board" : `Copy of ${boardToClone.title}`,
      initializeSection: false,
      isDemo,
      claimedBy,
      savedColumnNumber: boardToClone.saved_column_num, //DEPRECATED. Not neccesary
    });

    // STEP 2: grabs all a board's sections
    // (remember that board_sections maps sections to boards)
    const { data: boardSectionData, error: sectionErr } = await supabase
      .from("board_sections")
      .select("*, section:sections(*)")
      .eq("board_id", boardIdToClone)
      .eq("deleted", false);

    if (sectionErr) throw sectionErr;
    const boardSections = boardSectionData as BoardSection[];

    console.log("BoardSections: ", boardSections, " data: ", boardSectionData);

    // STEP 3: here we clone each of the sections and
    // attach them to this new board
    const originalToClonedSectionIdMap: Record<string, string> = {};
    await Promise.all(
      boardSections.map(async (boardSection) => {
        const originalSection = boardSection.section;
        if (!originalSection) return;

        const result = await cloneSection({
          originalSection,
          destinationBoardId: board.board_id,
          positionInBoard: boardSection.order_index,
          newOwnerUserId: claimedBy,
        });

        if (!result) return;
        originalToClonedSectionIdMap[originalSection.section_id] =
          result.newSectionId;
      })
    );

    // STEP 4: Clone the blocks and attach them to their new section
    await cloneBlocksFromSections(originalToClonedSectionIdMap);

    return board.board_id;
  } catch (err) {
    console.error("Error creating board", err);
    return null;
  }
}
