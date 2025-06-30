// 1. mark a board deleted
// 2. mark all a board's board_sections deleted
// 3. (maybe) mark a section as deleted depending on what soft-delete-section.tsx does

// this function DOES NOT: remove it locally

import { supabase } from "@/lib/supabase/supabase-client";
import { SoftDeleteSections } from "./soft-delete-section";

export async function softDeleteBoard(boardId: string, userId: string) {
  // STEP 1: mark board as deleted
  const { error } = await supabase
    .from("boards")
    .update({ deleted: true, deleted_at: new Date().toISOString() })
    .eq("board_id", boardId)
    .eq("user_id", userId); // you can only delete your own board

  if (error) {
    console.error("Failed to delete board:", error.message);
    return false;
  }

  // STEP 2: mark board_sections as deleted
  const { data: boardSections, error: boardSectionsError } = await supabase
    .from("board_sections")
    .update({ deleted: true, deleted_at: new Date().toISOString() })
    .eq("board_id", boardId)
    .select("section_id");

  if (boardSectionsError) {
    console.error(
      "Failed to delete board_sections:",
      boardSectionsError.message
    );
    return false;
  }

  // STEP 3??? mark sections as deleted
  const sectionIds = boardSections?.map((bs) => bs.section_id).filter(Boolean);
  if (sectionIds.length > 0) {
    await SoftDeleteSections(sectionIds, userId);
  }

  return true;
}
