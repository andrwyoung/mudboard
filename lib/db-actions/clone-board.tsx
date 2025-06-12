// here's how we duplicate the main board for the demo board
// I still don't know if I want this function public for others to use

import { supabase } from "@/utils/supabase";
import { createNewBoard } from "./create-new-board";
import { checkIfBoardExists } from "./check-board-exist";
import { toast } from "sonner";

export async function cloneBoard({
  boardIdToClone,
  isDemo,
  claimedBy,
}: {
  boardIdToClone: string;
  isDemo?: boolean;
  claimedBy?: string;
}): Promise<string | null> {
  const boardExists = await checkIfBoardExists(boardIdToClone);

  if (!boardExists) {
    toast.error("Board does not exist");
    return null;
  }

  try {
    // first make new board
    const board = await createNewBoard({
      title: "Demo Board",
      initializeSection: false,
      isDemo,
      claimedBy,
    });

    // 1a: get sections
    const { data: sections, error: sectionErr } = await supabase
      .from("sections")
      .select("*")
      .eq("board_id", boardIdToClone)
      .eq("deleted", false);

    if (sectionErr) throw sectionErr;

    // 1b: insert the real sections
    const sectionMap: Record<string, string> = {};
    await Promise.all(
      sections.map(async (section) => {
        const { section_id: _, ...rest } = section;
        const { data, error } = await supabase
          .from("sections")
          .insert([{ ...rest, board_id: board.board_id }])
          .select()
          .single();
        if (error) throw error;
        sectionMap[section.section_id] = data.section_id;
        return data;
      })
    );

    // 2a: Fetch blocks
    const { data: blocks, error: blockErr } = await supabase
      .from("blocks")
      .select("*")
      .eq("board_id", boardIdToClone)
      .eq("deleted", false);

    if (blockErr) throw blockErr;

    // 2b: insert the new blocks
    const newBlocks = blocks.map(({ block_id: _, ...rest }) => ({
      ...rest,
      board_id: board.board_id,
      section_id: sectionMap[rest.section_id],
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
