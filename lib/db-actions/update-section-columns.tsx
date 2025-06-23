// lib/db-actions/update-section-columns.tsx

import { supabase } from "@/utils/supabase";
import { useMetadataStore } from "@/store/metadata-store";
import { useLayoutStore } from "@/store/layout-store";
import { toast } from "sonner";

export async function updateSectionColumnNum(
  sectionId: string,
  newColumnNum: number,
  canEdit: boolean
) {
  if (!canEdit) {
    console.warn("This should never fire. Blocking Column change");
    return;
  }

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
  // STEP 2: sync the layout locally and remotely so we have a good
  await useLayoutStore.getState().syncLayout();

  // // STEP 3: regenerate the real columns
  // useLayoutStore.getState().regenerateSectionColumns(sectionId);

  // STEP 2: save the column number
  await supabase
    .from("sections")
    .update({ saved_column_num: newColumnNum })
    .eq("section_id", sectionId);

  toast.success(`Saved ${newColumnNum} Columns`);
}
