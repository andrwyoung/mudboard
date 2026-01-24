// DATABASE + LOCAL

// lib/db-actions/update-section-columns.tsx

import { supabase } from "@/lib/supabase/supabase-client";
import { useMetadataStore } from "@/store/metadata-store";
import { useLayoutStore } from "@/store/layout-store";
import { toast } from "sonner";

export async function saveSectionColumnNum(
  sectionId: string,
  newColumnNum: number,
  canEdit: boolean
) {
  if (!canEdit) {
    console.warn("This should never fire. Blocking Column change");
    return;
  }

  // STEP 1: update number of columns locally
  useMetadataStore.getState().updateBoardSection(sectionId, {
    saved_column_num: newColumnNum,
  });

  // sync order remotely
  // STEP 2: sync the layout locally and remotely so we have a good
  useLayoutStore.getState().setLayoutDirtyForSection(sectionId);
  await useLayoutStore.getState().syncLayout();

  // useLayoutStore.getState().regenerateSectionColumns(sectionId);

  // STEP 3: save the column number remotely
  await supabase
    .from("sections")
    .update({ saved_column_num: newColumnNum })
    .eq("section_id", sectionId);

  toast.success(`Saved ${newColumnNum} Columns`);
}
