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
  useMetadataStore
    .getState()
    .updateBoardSection(sectionId, { title: newTitle });

  // update remotely
  await supabase
    .from("sections")
    .update({ title: newTitle })
    .eq("section_id", sectionId);
}
