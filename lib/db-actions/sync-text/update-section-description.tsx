// DATABASE + LOCAL

import { canEditBoard } from "@/lib/auth/can-edit-board";
import { supabase } from "@/lib/supabase/supabase-client";
import { useMetadataStore } from "@/store/metadata-store";

export async function updateSectionDescription(
  sectionId: string,
  newDescription: string | null
) {
  const canWrite = canEditBoard();

  if (!canWrite) {
    console.warn("Not syncing section description");
    return;
  }

  // update locally
  useMetadataStore.getState().updateBoardSection(sectionId, {
    description: newDescription,
  });

  // update remotely
  await supabase
    .from("sections")
    .update({ description: newDescription })
    .eq("section_id", sectionId);
}
