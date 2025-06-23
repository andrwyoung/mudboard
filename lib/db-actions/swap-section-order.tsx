import { supabase } from "@/utils/supabase";
import { BoardSection } from "@/types/board-types";
import { useMetadataStore } from "@/store/metadata-store";
import { canEditBoard } from "../auth/can-edit-board";

// Assumes both sections are on the same board
export async function swapSectionOrder(a: BoardSection, b: BoardSection) {
  if (a.order_index === b.order_index) return;

  // should never fire. we shouldn't even show the button to do this
  const canEdit = canEditBoard();
  if (!canEdit) {
    console.error("This should not fire. Blocking section swap");
    return;
  }

  const { error: errorA } = await supabase
    .from("board_sections")
    .update({ order_index: b.order_index })
    .eq("board_id", a.board_id)
    .eq("section_id", a.section.section_id);

  const { error: errorB } = await supabase
    .from("board_sections")
    .update({ order_index: a.order_index })
    .eq("board_id", b.board_id)
    .eq("section_id", b.section.section_id);

  if (errorA || errorB) {
    console.error("Failed to swap section order:", errorA || errorB);
    return false;
  }

  // Update locally
  useMetadataStore.setState((s) => {
    const newBoardSections = [...s.boardSections].map((bs) => {
      if (bs.section.section_id === a.section.section_id)
        return { ...bs, order_index: b.order_index };
      if (bs.section.section_id === b.section.section_id)
        return { ...bs, order_index: a.order_index };
      return bs;
    });

    return {
      boardSections: newBoardSections,
    };
  });

  return true;
}
