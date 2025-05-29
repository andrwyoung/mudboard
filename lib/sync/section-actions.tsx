import { supabase } from "@/utils/supabase";
import { useMetadataStore } from "@/store/metadata-store";
import { createSupabaseSection } from "../db-actions/create-new-section";
import { toast } from "sonner";
import { initializeSectionColumns } from "./new-section-columns";
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
  const canWrite = canEditBoard();

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

export async function addNewSection({
  board_id,
  title,
  order_index,
}: {
  board_id: string;
  title?: string;
  order_index: number;
}) {
  const canWrite = canEditBoard();
  if (!canWrite) {
    console.warn("Not adding new section");
    return null;
  }

  // create one in the database
  const newSection = await createSupabaseSection({
    board_id,
    title,
    order_index,
  });

  // update locally
  useMetadataStore.setState((s) => ({
    sections: [...s.sections, newSection],
  }));

  // create a new array of columns to use
  initializeSectionColumns(newSection.section_id);

  toast.success("Successfully created new section");
  return newSection;
}
