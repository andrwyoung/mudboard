import { supabase } from "@/lib/supabase";
import { useMetadataStore } from "@/store/metadata-store";
import { hasWriteAccess } from "../db-actions/check-write-access";

export async function updateSectionTitle(
  sectionId: string,
  newTitle: string | null
) {
  const canWrite = await hasWriteAccess();

  if (!canWrite) {
    console.warn("Not syncing section title");
    return;
  }

  // update locally
  useMetadataStore.setState((s) => ({
    sections: s.sections.map((section) =>
      section.section_id === sectionId
        ? { ...section, title: newTitle }
        : section
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
  const canWrite = await hasWriteAccess();

  if (!canWrite) {
    console.warn("Not syncing section description");
    return;
  }

  // update locally
  useMetadataStore.setState((s) => ({
    sections: s.sections.map((section) =>
      section.section_id === sectionId
        ? { ...section, description: newDescription }
        : section
    ),
  }));

  // update remotely
  await supabase
    .from("sections")
    .update({ description: newDescription })
    .eq("section_id", sectionId);
}
