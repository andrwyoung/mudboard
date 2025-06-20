// lib/db-actions/update-section-columns.tsx

import { supabase } from "@/utils/supabase";
import { useMetadataStore } from "@/store/metadata-store";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { useLayoutStore } from "@/store/layout-store";
import { toast } from "sonner";

export async function updateSectionColumnNum(
  sectionId: string,
  newColumnNum: number
) {
  const canWrite = canEditBoard();

  if (!canWrite) {
    console.warn("Not syncing section column number");
    return;
  }

  // STEP 1: update the actual layout
  // we want to regenerate the layout first so that we don't "save" the previous column layout
  useLayoutStore.getState().regenerateSectionColumns(sectionId);

  // STEP 2: update number of columns
  useMetadataStore.setState((s) => ({
    boardSections: s.boardSections.map((bs) =>
      bs.section.section_id === sectionId
        ? {
            ...bs,
            section: { ...bs.section, saved_column_num: newColumnNum },
          }
        : bs
    ),
  }));

  // update remotely
  await supabase
    .from("sections")
    .update({ saved_column_num: newColumnNum })
    .eq("section_id", sectionId);

  toast.success(`Saved ${newColumnNum} Columns`);
}
