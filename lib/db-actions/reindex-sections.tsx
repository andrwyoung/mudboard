// this is currently used after deleting a section
// we want to rearrange the indexes of the section so they make sense

import { supabase } from "@/utils/supabase";
import { useMetadataStore } from "@/store/metadata-store";
import { Section } from "@/types/board-types";
import { canEditBoard } from "@/lib/auth/can-edit-board";

// reindexes sections and syncs with Supabase if it's allowed
export async function reindexSections(): Promise<void> {
  // first reindex locally
  const reorderedSections: Section[] = useMetadataStore
    .getState()
    .sections.map((section, index) => ({
      ...section,
      order_index: index,
    }));

  useMetadataStore.setState(() => ({
    sections: reorderedSections,
  }));

  // sync with database only if has access
  const canWrite = canEditBoard();
  if (!canWrite) {
    console.warn("No write access: not deleting section");
    return;
  }

  await Promise.all(
    reorderedSections.map((section) =>
      supabase
        .from("sections")
        .update({ order_index: section.order_index })
        .eq("section_id", section.section_id)
    )
  );
}
