// DATABASE + LOCAL

import { supabase } from "@/lib/supabase/supabase-client";
import { useMetadataStore } from "@/store/metadata-store";

export async function updateSectionTitle(
  sectionId: string,
  newTitle: string | null,
  canEdit: boolean
) {
  if (!canEdit) {
    console.warn("This should not fire. Blocking section swap");
    return;
  }

  // update locally
  useMetadataStore.setState((s) => ({
    boardSections: s.boardSections.map((bs) =>
      bs.section.section_id === sectionId
        ? {
            ...bs,
            section: { ...bs.section, title: newTitle },
          }
        : bs
    ),
  }));

  // update remotely
  await supabase
    .from("sections")
    .update({ title: newTitle })
    .eq("section_id", sectionId);
}
