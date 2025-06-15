// these are the actions we use to update the a section's title or description

import { supabase } from "@/utils/supabase";
import { useMetadataStore } from "@/store/metadata-store";
import { canEditBoard } from "@/lib/auth/can-edit-board";

export async function updateSectionTitle(
  sectionId: string,
  newTitle: string | null
) {
  const canWrite = canEditBoard();

  if (!canWrite) {
    console.warn("Not syncing section title");
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
  useMetadataStore.setState((s) => ({
    boardSections: s.boardSections.map((bs) =>
      bs.section.section_id === sectionId
        ? {
            ...bs,
            section: { ...bs.section, description: newDescription },
          }
        : bs
    ),
  }));

  // update remotely
  await supabase
    .from("sections")
    .update({ description: newDescription })
    .eq("section_id", sectionId);
}
