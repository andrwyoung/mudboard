// this is currently used after deleting a section
// we want to rearrange the indexes of the section so they make sense

import { supabase } from "@/utils/supabase";
import { useMetadataStore } from "@/store/metadata-store";
import { BoardSection } from "@/types/board-types";
import { canEditBoard } from "@/lib/auth/can-edit-board";

// reindexes sections and syncs with Supabase if it's allowed
export async function reindexSections(): Promise<void> {
  // first reindex locally
  const reorderedSections: BoardSection[] = useMetadataStore
    .getState()
    .boardSections.map((boardSection, index) => ({
      ...boardSection,
      order_index: index,
    }));

  useMetadataStore.setState(() => ({
    boardSections: reorderedSections,
  }));

  // sync with database only if has access
  const canWrite = canEditBoard();
  if (!canWrite) {
    console.warn("No write access: not deleting section");
    return;
  }

  await Promise.all(
    reorderedSections.map((boardSection) =>
      supabase
        .from("board_sections")
        .update({ order_index: boardSection.order_index })
        .eq("board_section_id", boardSection.board_section_id)
    )
  );
}
