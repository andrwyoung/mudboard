import { useMetadataStore } from "@/store/metadata-store";
import { canEditBoard } from "../auth/can-edit-board";
import { createSupabaseSection } from "../db-actions/create-new-section";
import { initializeSectionColumns } from "../columns/new-section-columns";
import { toast } from "sonner";

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
